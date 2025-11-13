from hr.models import Employee, Assignment
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from hr.serializers import AssignmentSerializer
from hr.models.order import Order
from hr.serializers.order import OrderSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from hr.serializers.full_user import FullUserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from hr.serializers.register_customer import RegisterCustomerSerializer
from rest_framework.permissions import AllowAny
from hr.models import Employee, Assignment
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from hr.serializers import AssignmentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework import viewsets, permissions
from hr.serializers.customer import FavoriteSerializer
from hr.models.customer import Favorite, ServiceType, Customer
import time
import logging

logger = logging.getLogger(__name__)

class SimpleCreateOrderAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Tạo order với payment integration
        - payment_method = 'CASH' → Tạo order + payment record với status PENDING
        - payment_method = 'BANK_TRANSFER' → Tạo order + payment + gọi PayOS API
        """
        # Lấy payment_method trước khi validate
        payment_method = request.data.get('payment_method', 'CASH')
        
        # 1. Validate và tạo Order
        serializer = OrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Loại bỏ payment_method khỏi validated_data
        validated_data = serializer.validated_data
        validated_data.pop('payment_method', None)
        
        # Set status dựa trên payment method
        if payment_method == 'BANK_TRANSFER':
            validated_data['status'] = 'PENDING_PAYMENT'
        else:
            validated_data['status'] = 'PENDING'
        
        # Tạo order
        order = serializer.create(validated_data)
        
        # 2. Serialize lại order để trả về response
        output_serializer = OrderSerializer(order)
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
        
        # 4. Tạo Payment record
        if payment_app_available:
            try:
                if payment_method == 'BANK_TRANSFER':
                    # Tạo order_code unique
                    order_code = int(time.time() * 1000)
                    
                    # Tạo Payment record
                    short_description = f"DH{order_code}"[:25]
                    
                    payment = Payment.objects.create(
                        order=order,
                        order_code=order_code,
                        amount=order.cost_confirm,
                        payment_method='BANK_TRANSFER',
                        status='PENDING',
                        description=f'Thanh toán đơn hàng #{order.id}'
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
                        buyer_phone = getattr(order.customer, 'phone_number', None)
                    
                    logger.info(f"Creating PayOS payment: order_code={order_code}, amount={order.cost_confirm}")
                    
                    # Tạo items list
                    items = [{
                        "name": f"Dịch vụ {order.service_type.name}" if hasattr(order, 'service_type') and order.service_type else "Dịch vụ dọn dẹp",
                        "quantity": 1,
                        "price": int(order.cost_confirm)
                    }]
                    
                    result = payos.create_payment_link(
                        order_code=order_code,
                        amount=int(order.cost_confirm),
                        description=short_description,
                        return_url=f"{settings.FRONTEND_URL}/payment/success",
                        cancel_url=f"{settings.FRONTEND_URL}/payment/cancel",
                        buyer_name=buyer_name,
                        buyer_email=buyer_email,
                        buyer_phone=buyer_phone,
                        items=items
                    )
                    
                    logger.info(f"PayOS API response: {result}")
                    
                    # Xử lý response
                    if result is None:
                        error_msg = "PayOS API returned None. Check API credentials and network."
                        logger.error(f"❌ {error_msg}")
                        
                        payment.delete()
                        order.status = 'PENDING'
                        order.save()
                        
                        response_data['payment_error'] = error_msg
                        response_data['message'] = 'Không thể kết nối với PayOS. Vui lòng chọn thanh toán tiền mặt hoặc thử lại sau.'
                    
                    elif isinstance(result, dict) and result.get('code') == '00' and 'data' in result and result['data']:
                        # Success
                        data = result['data']
                        
                        payment.payment_url = data.get('checkoutUrl')
                        payment.qr_code = data.get('qrCode')
                        payment.account_number = data.get('accountNumber')
                        payment.account_name = data.get('accountName')
                        payment.save()
                        
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
                        
                        logger.info(f"✅ Payment created for Order #{order.id}")
                    
                    elif 'data' in result and result['data']:
                        # Fallback
                        data = result['data']
                        
                        payment.payment_url = data.get('checkoutUrl')
                        payment.qr_code = data.get('qrCode')
                        payment.account_number = data.get('accountNumber')
                        payment.account_name = data.get('accountName')
                        payment.save()
                        
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
                        # Lỗi từ PayOS
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
        
        return Response(response_data, status=status.HTTP_201_CREATED)


class CustomerOrdersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = getattr(request.user, "id", None)
        if not user_id:
            return Response({"detail": "Không xác định được user"}, status=403)

        from hr.models.customer import Customer
        from hr.models import Order
        try:
            customer = Customer.objects.get(user_id=user_id)
        except Customer.DoesNotExist:
            return Response({"detail": "User không phải là customer"}, status=403)

        orders = Order.objects.filter(customer=customer)
        from hr.serializers.order import OrderSerializer
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class UpdateOrderFeedbackAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, order_id):
        user_id = getattr(request.user, "id", None)
        if not user_id:
            return Response({"detail": "Không xác định được user"}, status=403)

        from hr.models.customer import Customer
        try:
            customer = Customer.objects.get(user_id=user_id)
        except Customer.DoesNotExist:
            return Response({"detail": "User không phải là customer"}, status=403)

        try:
            order = Order.objects.get(id=order_id, customer=customer)
        except Order.DoesNotExist:
            return Response({"detail": "Không tìm thấy đơn hàng"}, status=404)

        # Chỉ cho phép cập nhật feedback cho đơn hàng đã hoàn thành
        if order.status != 'completed':
            return Response({
                "detail": "Chỉ có thể gửi phản hồi cho đơn hàng đã hoàn thành"
            }, status=400)

        customer_feedback = request.data.get('customer_feedback', '')
        if not customer_feedback.strip():
            return Response({"detail": "Phản hồi không được để trống"}, status=400)

        order.customer_feedback = customer_feedback.strip()
        order.save()

        from hr.serializers.order import OrderSerializer
        serializer = OrderSerializer(order)
        return Response(serializer.data)


class UpdateOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        """Lấy thông tin chi tiết đơn hàng"""
        user_id = getattr(request.user, "id", None)
        if not user_id:
            return Response({"detail": "Không xác định được user"}, status=403)

        from hr.models.customer import Customer
        try:
            customer = Customer.objects.get(user_id=user_id)
        except Customer.DoesNotExist:
            return Response({"detail": "User không phải là customer"}, status=403)

        try:
            order = Order.objects.get(id=order_id, customer=customer)
        except Order.DoesNotExist:
            return Response({"detail": "Không tìm thấy đơn hàng"}, status=404)

        from hr.serializers.order import OrderSerializer
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def put(self, request, order_id):
        """Cập nhật thông tin đơn hàng (chỉ cho trạng thái pending)"""
        print(f"DEBUG: PUT request data: {request.data}")
        print(f"DEBUG: Order ID: {order_id}")
        
        user_id = getattr(request.user, "id", None)
        if not user_id:
            return Response({"detail": "Không xác định được user"}, status=403)

        from hr.models.customer import Customer
        try:
            customer = Customer.objects.get(user_id=user_id)
            print(f"DEBUG: Found customer: {customer.id}")
        except Customer.DoesNotExist:
            return Response({"detail": "User không phải là customer"}, status=403)

        try:
            order = Order.objects.get(id=order_id, customer=customer)
            print(f"DEBUG: Found order: {order.id}, status: {order.status}")
        except Order.DoesNotExist:
            return Response({"detail": "Không tìm thấy đơn hàng"}, status=404)
        
        # Chỉ cho phép cập nhật đơn hàng ở trạng thái pending
        if order.status != 'pending':
            return Response({
                "detail": "Chỉ có thể chỉnh sửa đơn hàng ở trạng thái chờ xác nhận"
            }, status=400)

        # Validate và cập nhật dữ liệu
        from hr.serializers.order import OrderSerializer
        
        # Tạo data dict với các fields cho phép update
        update_data = {}
        allowed_fields = [
            'service_type', 'area_m2', 'preferred_start_time', 
            'preferred_end_time', 'requested_hours', 'estimated_hours', 
            'cost_confirm', 'note'
        ]
        
        for field in allowed_fields:
            if field in request.data:
                value = request.data[field]
                # Convert datetime strings to proper format if needed
                if field in ['preferred_start_time', 'preferred_end_time']:
                    if isinstance(value, str):
                        from datetime import datetime
                        import pytz
                        try:
                            # Parse ISO format datetime
                            dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
                            update_data[field] = dt
                        except ValueError:
                            print(f"DEBUG: Invalid datetime format for {field}: {value}")
                            return Response({
                                "detail": f"Invalid datetime format for {field}"
                            }, status=400)
                    else:
                        update_data[field] = value
                elif field in ['area_m2', 'requested_hours', 'estimated_hours', 'cost_confirm']:
                    # Convert numeric fields
                    if value is not None and value != '':
                        try:
                            from decimal import Decimal
                            update_data[field] = Decimal(str(value))
                        except (ValueError, TypeError):
                            print(f"DEBUG: Invalid numeric format for {field}: {value}")
                            return Response({
                                "detail": f"Invalid numeric format for {field}"
                            }, status=400)
                    else:
                        if field == 'cost_confirm':
                            update_data[field] = None  # cost_confirm can be null
                        else:
                            print(f"DEBUG: Required field {field} is empty")
                            return Response({
                                "detail": f"Field {field} is required"
                            }, status=400)
                else:
                    update_data[field] = value
        
        print(f"DEBUG: Update data: {update_data}")
        
        serializer = OrderSerializer(order, data=update_data, partial=True)
        
        print(f"DEBUG: Serializer validation: {serializer.is_valid()}")
        if not serializer.is_valid():
            print(f"DEBUG: Serializer errors: {serializer.errors}")
            return Response({
                "detail": "Dữ liệu không hợp lệ",
                "errors": serializer.errors
            }, status=400)
        
        try:
            serializer.save()
            print(f"DEBUG: Order updated successfully")
            return Response(serializer.data)
        except Exception as e:
            print(f"DEBUG: Error saving order: {str(e)}")
            return Response({
                "detail": f"Lỗi khi lưu đơn hàng: {str(e)}"
            }, status=400)
        

class FavoriteViewSet(viewsets.ModelViewSet):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # chỉ trả về favorites của user hiện tại
        user = self.request.user
        try:
            customer = Customer.objects.get(user_id=user.id)
        except Customer.DoesNotExist:
            return Favorite.objects.none()
        return Favorite.objects.filter(customer=customer).order_by('-created_at')
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        print(f"DEBUG: Attempting to delete favorite: {instance.id}")
        print(f"DEBUG: Customer: {instance.customer_id}, Service: {instance.service_name}")
        
        # Delete the instance
        instance.delete()
        print(f"DEBUG: Favorite {instance.id} deleted successfully")
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_create(self, serializer):
        # Lấy customer từ user hiện tại
        customer = Customer.objects.get(user_id=self.request.user.id)
        
        # Lấy service_type id
        service_id = self.request.data.get('service_type') or self.request.data.get('service_type_id')
        if not service_id:
            # Nếu không có service_type_id, raise error
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"service_type": "Service type ID is required"})
        
        try:
            service = ServiceType.objects.get(id=service_id)
        except ServiceType.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"service_type": "Service type not found"})
        
        # Tự động điền tất cả các trường từ ServiceType
        serializer.save(
            customer=customer,
            service_type=service,
            service_name=service.name,
            price_per_m2=service.price_per_m2,
            img=service.img if service.img else None
        )