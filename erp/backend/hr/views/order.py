from base.views import BaseViewSet
from rest_framework import viewsets, permissions
from ..models import Order, Assignment, DecisionLog
from ..models.customer import Customer, ServiceType
from ..serializers.order import (
    OrderSerializer, OrderEmployeeSerializer, AssignmentSerializer, DecisionLogSerializer,
    CustomerSerializer, ServiceTypeSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response
from common.constants.http import Http
from django.db.models import Q
from hr.permissions import IsAdmin, IsEmployee, IsCustomer
from businesses.models.employee import EmployeeWorkingStatus
from rest_framework import status
from decimal import Decimal
import time
import logging

logger = logging.getLogger(__name__)

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    def get_permissions(self):
        if self.request.user and self.request.user.is_staff:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class ServiceTypeViewSet(viewsets.ModelViewSet):
    queryset = ServiceType.objects.all().order_by('id')
    serializer_class = ServiceTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class OrderViewSet(BaseViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    search_map = {
        "status": "iexact",
        "customer__name": "icontains",
        "note": "icontains",
    }
    required_alternate_scopes = {
        "create": [["users:view-mine"], ["users:edit-mine"]],
        "retrieve": [["roles:edit"], ["roles:view"]],
        "update": [["roles:edit"]],
        "destroy": [["roles:edit"]],
        "list": [["roles:edit"], ["roles:view"]],
        "get_assignments": [["roles:edit"], ["roles:view"]],
        "updateStatus": [["roles:edit"]],
        "update_admin_log": [["roles:edit"]],
        "complete": [["roles:edit"]],
        "invoice": [["users:view-mine"], ["users:edit-mine"]],
    }

    def get_serializer_class(self):
        """Trả về serializer phù hợp dựa trên role của user"""
        user = self.request.user
        
        # Nếu là JWTUser, lấy User thật từ database
        if hasattr(user, 'id'):
            from oauth.models import User
            try:
                real_user = User.objects.get(id=user.id)
                
                # Check if user is employee
                if hasattr(real_user, 'employees') and real_user.employees.exists():
                    if self.action in ['update', 'partial_update']:
                        return OrderEmployeeSerializer
            except User.DoesNotExist:
                pass
        
        return OrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(preferred_start_time__gte=start_date)
        if end_date:
            queryset = queryset.filter(preferred_start_time__lte=end_date)
        
        user = self.request.user
        if user.is_staff:
            return queryset
        
        # Nếu là JWTUser, lấy User thật từ database
        if hasattr(user, 'id'):
            from oauth.models import User
            try:
                real_user = User.objects.get(id=user.id)
                if hasattr(real_user, 'employees') and real_user.employees.exists():
                    return queryset.filter(assignment__employee__user=real_user)
            except User.DoesNotExist:
                pass
        
        return queryset.none()

    def get_permissions(self):
        user = self.request.user
        if user.is_staff:
            return [permissions.IsAdminUser()]
        
        # Nếu là JWTUser, lấy User thật từ database
        if hasattr(user, 'id'):
            from oauth.models import User
            try:
                real_user = User.objects.get(id=user.id)
                if hasattr(real_user, 'employees') and real_user.employees.exists():
                    if self.action in ['list', 'retrieve', 'assignments']:
                        return [permissions.IsAuthenticated(), IsEmployee()]
                    elif self.action in ['update', 'partial_update']:
                        # Cho phép employee update (chỉ status thông qua OrderEmployeeSerializer)
                        return [permissions.IsAuthenticated(), IsEmployee()]
                    return [permissions.IsAdminUser()]
            except User.DoesNotExist:
                pass
        
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        """
        Override create để tích hợp Payment
        - payment_method = 'CASH' → Tạo order + payment record với status PENDING
        - payment_method = 'BANK_TRANSFER' → Tạo order + payment + gọi PayOS API
        """
        # Lấy payment_method trước khi validate
        payment_method = request.data.get('payment_method', 'CASH')
        
        # 1. Tạo Order
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Loại bỏ payment_method khỏi validated_data (vì Order model không có field này)
        validated_data = serializer.validated_data
        validated_data.pop('payment_method', None)
        
        # Set status dựa trên payment method
        if payment_method == 'BANK_TRANSFER':
            validated_data['status'] = 'PENDING_PAYMENT'
        else:
            validated_data['status'] = 'PENDING'
        
        # Tạo order với validated_data đã loại bỏ payment_method
        order = serializer.create(validated_data)
        
        # 2. Serialize lại order để trả về response
        output_serializer = self.get_serializer(order)
        response_data = output_serializer.data
        
        # 3. Kiểm tra xem app payments có tồn tại không
        try:
            from payments.models import Payment
            from payments.services.payos_service import PayOSService
            from django.conf import settings
            payment_app_available = True
        except ImportError:
            payment_app_available = False
            logger.warning("Payment app not available.")
        
        # 3. Tạo Payment record
        if payment_app_available:
            try:
                if payment_method == 'BANK_TRANSFER':
                    # Tạo order_code unique
                    order_code = int(time.time() * 1000)
                    
                    # Tạo Payment record
                    # PayOS yêu cầu description tối đa 25 ký tự
                    # Dùng order_code (số) thay vì UUID
                    short_description = f"DH{order_code}"[:25]  # Đảm bảo không vượt 25 ký tự
                    
                    payment = Payment.objects.create(
                        order=order,
                        order_code=order_code,
                        amount=order.cost_confirm,
                        payment_method='BANK_TRANSFER',
                        status='PENDING',
                        description=f'Thanh toán đơn hàng #{order.id}'  # Full description for DB
                    )
                    
                    # Gọi PayOS API
                    payos = PayOSService(
                        client_id=settings.PAYOS_CLIENT_ID,
                        api_key=settings.PAYOS_API_KEY,
                        checksum_key=settings.PAYOS_CHECKSUM_KEY
                    )
                    
                    # Get buyer info
                    buyer_name = None
                    buyer_email = None
                    buyer_phone = None
                    
                    if order.customer:
                        buyer_name = getattr(order.customer, 'name', None)
                        buyer_email = getattr(order.customer, 'email', None)
                        buyer_phone = getattr(order.customer, 'phone_number', None) or getattr(order.customer, 'phone', None)
                    
                    logger.info(f"Creating PayOS payment: order_code={order_code}, amount={order.cost_confirm}, buyer={buyer_name}")
                    
                    # Tạo items list (required by PayOS)
                    items = [{
                        "name": f"Dịch vụ {order.service_type.name}" if hasattr(order, 'service_type') and order.service_type else "Dịch vụ dọn dẹp",
                        "quantity": 1,
                        "price": int(order.cost_confirm)
                    }]
                    
                    result = payos.create_payment_link(
                        order_code=order_code,
                        amount=int(order.cost_confirm),
                        description=short_description,  # Dùng short description cho PayOS (max 25 chars)
                        return_url=f"{settings.FRONTEND_URL}/payment/success",
                        cancel_url=f"{settings.FRONTEND_URL}/payment/cancel",
                        buyer_name=buyer_name,
                        buyer_email=buyer_email,
                        buyer_phone=buyer_phone,
                        items=items
                    )
                    
                    logger.info(f"PayOS API response type: {type(result)}")
                    logger.info(f"PayOS API response: {result}")
                    
                    # Kiểm tra response
                    if result is None:
                        # Lỗi kết nối / API không phản hồi
                        error_msg = "PayOS API returned None. Check API credentials and network."
                        logger.error(f"❌ {error_msg}")
                        
                        payment.delete()
                        order.status = 'PENDING'
                        order.save()
                        
                        response_data['payment_error'] = error_msg
                        response_data['message'] = 'Không thể kết nối với PayOS. Vui lòng chọn thanh toán tiền mặt hoặc thử lại sau.'
                    
                    elif isinstance(result, dict) and result.get('code') == '00' and 'data' in result and result['data']:
                        # Success response từ PayOS theo format: {code: "00", desc: "success", data: {...}}
                        data = result['data']
                        
                        # Cập nhật payment
                        payment.payment_url = data.get('checkoutUrl')
                        payment.qr_code = data.get('qrCode')
                        payment.account_number = data.get('accountNumber')
                        payment.account_name = data.get('accountName')
                        payment.save()
                        
                        # Thêm info payment vào response
                        response_data['payment'] = {
                            'payment_id': str(payment.id),
                            'payment_url': payment.payment_url,
                            'qr_code': payment.qr_code,
                            'order_code': order_code,
                            'account_number': payment.account_number,
                            'account_name': payment.account_name,
                            'amount': float(payment.amount),
                            'status': payment.status,
                            'transfer_content': f"DH{order_code}",  # Nội dung CK cho manual transfer
                            'bank_name': 'BIDV'  # Tên ngân hàng (từ PayOS)
                        }
                        
                        logger.info(f"✅ Payment created for Order #{order.id}")
                    
                    elif 'data' in result and result['data']:
                        # Fallback: Có data nhưng không có code="00"
                        data = result['data']
                        
                        # Cập nhật payment
                        payment.payment_url = data.get('checkoutUrl')
                        payment.qr_code = data.get('qrCode')
                        payment.account_number = data.get('accountNumber')
                        payment.account_name = data.get('accountName')
                        payment.save()
                        
                        # Thêm info payment vào response
                        response_data['payment'] = {
                            'payment_id': str(payment.id),
                            'payment_url': payment.payment_url,
                            'qr_code': payment.qr_code,
                            'order_code': order_code,
                            'account_number': payment.account_number,
                            'account_name': payment.account_name,
                            'amount': float(payment.amount),
                            'status': payment.status,
                            'transfer_content': f"DH{order_code}",
                            'bank_name': 'BIDV'
                        }
                        
                        logger.info(f"✅ Payment created for Order #{order.id} (fallback)")
                    
                    else:
                        # Lỗi từ PayOS (không có 'data' trong response hoặc result không hợp lệ)
                        if result and isinstance(result, dict):
                            error_msg = result.get('desc', 'Unknown error')
                            error_code = result.get('code', 'N/A')
                        else:
                            error_msg = 'Invalid response from PayOS'
                            error_code = 'INVALID_RESPONSE'
                        
                        logger.error(f"❌ PayOS error: Code={error_code}, Message={error_msg}")
                        
                        payment.delete()
                        order.status = 'PENDING'
                        order.save()
                        
                        response_data['payment_error'] = f"PayOS Error [{error_code}]: {error_msg}"
                        response_data['message'] = 'Không thể tạo link thanh toán. Vui lòng chọn thanh toán tiền mặt hoặc thử lại sau.'
                
                else:  # CASH
                    # Tạo payment record cho cash
                    payment = Payment.objects.create(
                        order=order,
                        amount=order.cost_confirm,
                        payment_method='CASH',
                        status='PENDING',
                        description=f'Thanh toán tiền mặt cho đơn hàng #{order.id}'
                    )
                    response_data['message'] = 'Đơn hàng đã tạo thành công. Thanh toán tiền mặt khi hoàn thành dịch vụ.'
                
            except Exception as e:
                logger.error(f"❌ Error creating payment: {str(e)}")
                response_data['payment_error'] = str(e)
                response_data['message'] = 'Đơn hàng đã tạo nhưng có lỗi với thanh toán. Vui lòng liên hệ hỗ trợ.'
        
        headers = self.get_success_headers(response_data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    @action(methods=[Http.HTTP_GET, Http.HTTP_POST], detail=True, url_path="assignments")
    def assignments(self, request, pk=None):
        order = self.get_object()
        
        if request.method == 'GET':
            assignments = Assignment.objects.filter(order=order)
            serializer = AssignmentSerializer(assignments, many=True)
            return Response(serializer.data)
            
        elif request.method == 'POST':
            created_assignments = []
            print("Received data:", request.data)  # Thêm log để debug
            
            for assignment_data in request.data:
                assignment_data['order'] = order.id
                serializer = AssignmentSerializer(data=assignment_data)
                print("Validating data:", assignment_data)  # Thêm log để debug
                
                if serializer.is_valid():
                    assignment = serializer.save()
                    employee = assignment.employee
                    employee.status = EmployeeWorkingStatus.INACTIVE
                    employee.save()
                    created_assignments.append(assignment)
                else:
                    print("Validation errors:", serializer.errors)  # Thêm log để debug
                    return Response(
                        {
                            "detail": "Dữ liệu không hợp lệ",
                            "errors": serializer.errors
                        }, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            result_serializer = AssignmentSerializer(created_assignments, many=True)
            return Response(result_serializer.data, status=status.HTTP_201_CREATED)
        
    @action(methods=['PATCH'], detail=True, url_path="updateStatus")
    def updateStatus(self, request, pk=None):
        """
        API endpoint để cập nhật trạng thái đơn hàng
        """
        order = self.get_object()
        old_status = order.status
        
        if 'status' not in request.data:
            return Response({"detail": "Missing status field"}, status=status.HTTP_400_BAD_REQUEST)
        
        new_status = request.data['status']
        print(f"🔄 Updating order {pk} from {old_status} to {new_status}")
        
        valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'rejected', 'refund', 'REFUND']
        
        if new_status not in valid_statuses:
            print(f"❌ Invalid status: {new_status}")
            return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
            
        order.status = new_status
        order.save()
        print(f"✅ Order {pk} status updated to {order.status}")
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(methods=['PATCH'], detail=True, url_path="admin-log")
    def update_admin_log(self, request, pk=None):
        """
        API endpoint để cập nhật admin_log của đơn hàng
        """
        order = self.get_object()
        
        print("="*50)
        print(f"UPDATE ADMIN LOG REQUEST: Order ID={pk}")
        print(f"Request data: {request.data}")

        # Kiểm tra dữ liệu đầu vào
        if 'admin_log' not in request.data:
            # Kiểm tra xem có trường reason không (để tương thích với code cũ)
            if 'reason' in request.data:
                order.admin_log = request.data['reason']
            else:
                return Response(
                    {"detail": "Missing admin_log field"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            admin_log = request.data['admin_log']
            # Kiểm tra nếu admin_log là dict có chứa reason
            if isinstance(admin_log, dict) and 'reason' in admin_log:
                order.admin_log = admin_log['reason']
            else:
                # Lưu admin_log trực tiếp
                order.admin_log = admin_log
        
        # Lưu thay đổi
        order.save()
        
        print(f"Admin log updated for order {pk}")
        print(f"New log: {order.admin_log}")
        if 'status' in request.data:
            print(f"Status updated to: {order.status}")
        
        # Trả về đơn hàng đã cập nhật
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(methods=['POST'], detail=True, url_path="complete")
    def complete_order(self, request, pk=None):
        order = self.get_object()
        print(f"Completing order {order.id}")
        requested_hours = Decimal(str(order.requested_hours))  # Sửa ở đây
        print(f"Requested hours: {requested_hours}")
        assignments = Assignment.objects.filter(order=order)
        print(f"Found {assignments.count()} assignments")
        for assignment in assignments:
            employee = assignment.employee
            employee.total_hours_worked = (employee.total_hours_worked or Decimal('0')) + requested_hours
            employee.completed_orders_count = (employee.completed_orders_count or 0) + 1
            employee.status = EmployeeWorkingStatus.ACTIVE
            employee.save()
        assignments.delete()
        return Response({"detail": "Đã hoàn thành đơn hàng và cập nhật nhân viên."}, status=status.HTTP_200_OK)
    

class AssignmentViewSet(BaseViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    required_alternate_scopes = {
        "create": [["roles:edit"]],
        "retrieve": [["assignments:view"], ["roles:edit"]],
        "update": [["roles:edit"]],
        "destroy": [["roles:edit"]],
        "list": [["assignments:view"], ["roles:edit"]],
    }

