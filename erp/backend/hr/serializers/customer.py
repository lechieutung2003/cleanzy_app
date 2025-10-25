from rest_framework import serializers
from ..models import Customer, ServiceType,Favorite

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

# class ServiceTypeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ServiceType
#         fields = '__all__'
class ServiceTypeSerializer(serializers.ModelSerializer):
    img = serializers.ImageField(required=False, allow_null=True)
    star = serializers.DecimalField(max_digits=2, decimal_places=1)
    about = serializers.CharField(allow_blank=True)

    class Meta:
        model = ServiceType
        fields = '__all__'
        
class CustomerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Customer
        fields = ['id', 'name', 'phone', 'address', 'area', 'email', 'first_name', 'last_name']

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['id', 'customer', 'service_type', 'service_name', 'price_per_m2', 'img', 'created_at']
        read_only_fields = ['id', 'created_at', 'customer']