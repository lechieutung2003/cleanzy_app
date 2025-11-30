from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from hr.serializers.full_user import FullUserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from hr.serializers.register_customer import RegisterCustomerSerializer
from hr.serializers.customer import CustomerSerializer
from rest_framework.permissions import AllowAny
from hr.models import Employee, Assignment
from hr.models.customer import Customer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from hr.serializers import AssignmentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from hr.models.order import Order
from hr.serializers.order import OrderSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserInfoAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        serializer = FullUserSerializer(user)
        return Response(serializer.data)


class CustomerInfoAPIView(APIView):
    """API để lấy và cập nhật thông tin chi tiết của customer từ bảng hr_customer"""
    permission_classes = [IsAuthenticated]
    
    def get_customer(self, request):
        """Helper method to get customer from request"""
        jwt_user = request.auth.user if hasattr(request, 'auth') and request.auth else request.user
        customer = None
        
        # Thử tìm customer bằng user relationship trước
        if hasattr(jwt_user, 'email') and jwt_user.email:
            try:
                real_user = User.objects.get(email=jwt_user.email)
                customer = Customer.objects.get(user=real_user)
            except (User.DoesNotExist, Customer.DoesNotExist):
                pass
        
        # Nếu chưa tìm thấy, thử tìm bằng email
        if not customer and hasattr(jwt_user, 'email') and jwt_user.email:
            try:
                customer = Customer.objects.get(email=jwt_user.email)
                
                # Link customer với user nếu chưa có
                if not customer.user:
                    try:
                        real_user = User.objects.get(email=jwt_user.email)
                        customer.user = real_user
                        customer.save()
                    except User.DoesNotExist:
                        pass
                        
            except Customer.DoesNotExist:
                pass
        
        print(f"🔍 get_customer: Found customer id={customer.id if customer else 'None'} for jwt_user email={getattr(jwt_user, 'email', 'N/A')}")
        
        return customer
    
    def get(self, request):
        try:
            customer = self.get_customer(request)
            
            if not customer:
                return Response(
                    {"detail": "Customer profile not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Refresh customer từ database để đảm bảo có data mới nhất
            customer.refresh_from_db()
            
            serializer = CustomerSerializer(customer)
            print(f"📤 GET /api/v1/customer/info - Trả về: name={customer.name}, email={customer.email}")
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in CustomerInfoAPIView GET: {e}")
            import traceback
            traceback.print_exc()
            
            return Response(
                {"detail": f"Error retrieving customer info: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request):
        """Cập nhật một hoặc nhiều trường của customer và đồng bộ với oauth_users nếu không phải guest"""
        try:
            customer = self.get_customer(request)
            
            if not customer:
                return Response(
                    {"detail": "Customer profile not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Lấy data từ request
            data = request.data.copy()
            
            print(f"📥 PATCH /api/v1/customer/info - Data nhận: {data}")
            print(f"🔍 Customer: id={customer.id}, user_id={customer.user.id if customer.user else None}, is_guest={customer.user.is_guest if customer.user else 'N/A'}")
            
            # Đồng bộ với oauth_users nếu customer có user (không phân biệt guest)
            if customer.user:
                user_updated = False
                print(f"🔄 Bắt đầu sync với oauth_users...")
                print(f"   Before - first_name: {customer.user.first_name}, last_name: {customer.user.last_name}")
                
                # Cập nhật email trong oauth_users nếu có
                if 'email' in data and data['email'] != customer.user.email:
                    print(f"   📧 Updating email: {customer.user.email} → {data['email']}")
                    customer.user.email = data['email']
                    customer.user.username = data['email']  # Username thường là email
                    user_updated = True
                
                # Cập nhật name trong oauth_users nếu có
                if 'name' in data and data['name']:
                    # Split name thành first_name và last_name
                    name_parts = data['name'].strip().split(' ', 1)
                    new_first_name = name_parts[0]
                    new_last_name = name_parts[1] if len(name_parts) > 1 else ''
                    
                    print(f"   👤 Splitting name: '{data['name']}' → first='{new_first_name}', last='{new_last_name}'")
                    
                    if (new_first_name != customer.user.first_name or 
                        new_last_name != customer.user.last_name):
                        print(f"   👤 Updating name: {customer.user.first_name}/{customer.user.last_name} → {new_first_name}/{new_last_name}")
                        customer.user.first_name = new_first_name
                        customer.user.last_name = new_last_name
                        user_updated = True
                    else:
                        print(f"   ⏭️  Name không thay đổi, skip update")
                
                # Lưu thay đổi vào oauth_users
                if user_updated:
                    customer.user.save()
                    print(f"✅ Đã đồng bộ oauth_users cho customer {customer.id}")
                    print(f"   After - first_name: {customer.user.first_name}, last_name: {customer.user.last_name}")
                else:
                    print(f"ℹ️  Không có thay đổi nào để sync vào oauth_users")
            else:
                print(f"⚠️  Customer không có user linked, bỏ qua sync")
            
            # Cập nhật hr_customer
            serializer = CustomerSerializer(customer, data=data, partial=True)
            
            if serializer.is_valid():
                updated_customer = serializer.save()
                print(f"✅ Đã cập nhật hr_customer: name={updated_customer.name}, email={updated_customer.email}")
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"Error in CustomerInfoAPIView PATCH: {e}")
            import traceback
            traceback.print_exc()
            
            return Response(
                {"detail": f"Error updating customer info: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RegisterCustomerAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        print(f"Request data: {request.data}")  # Log data nhận được
        serializer = RegisterCustomerSerializer(data=request.data)
        if serializer.is_valid():
            customer = serializer.save()
            return Response(serializer.to_representation(customer), status=status.HTTP_201_CREATED)
        print(f"Serializer errors: {serializer.errors}")  # Log lỗi validation
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

