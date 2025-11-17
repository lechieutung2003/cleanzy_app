"""
WebSocket URL routing cho payments app
"""
from django.urls import path
from .consumers import PaymentConsumer

websocket_urlpatterns = [
    path('ws/payments/<str:order_id>/', PaymentConsumer.as_asgi()),
]
