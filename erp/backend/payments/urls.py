"""
Payment URLs configuration
"""
from django.urls import path
from .views import payos_views

app_name = 'payments'

urlpatterns = [
    # PayOS endpoints
    path('create/', payos_views.create_payment, name='create_payment'),
    path('status/<int:order_code>/', payos_views.check_payment_status, name='check_payment_status'),
    path('cancel/<int:order_code>/', payos_views.cancel_payment_request, name='cancel_payment'),
    path('webhook/payos/', payos_views.payos_webhook, name='payos_webhook'),
]
