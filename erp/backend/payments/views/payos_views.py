"""
PayOS Views for payment API endpoints
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from ..services.payos_service import PayOSService
import time
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])  # Changed to AllowAny for testing
def create_payment(request):
    """
    Tạo link thanh toán PayOS
    
    Request body:
    {
        "amount": 500000,
        "description": "Payment for Cleanzy service",
        "order_id": "123"
    }
    
    Response:
    {
        "payment_url": "https://pay.payos.vn/...",
        "qr_code": "https://...",
        "order_code": 1234567890123,
        "account_number": "...",
        "account_name": "...",
        "amount": 500000,
        "description": "..."
    }
    """
    amount = request.data.get('amount')
    description = request.data.get('description', 'Payment for Cleanzy service')
    order_id = request.data.get('order_id')
    
    if not amount or not order_id:
        return Response(
            {'error': 'Amount and order_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Tạo order_code unique (chỉ dùng timestamp vì PayOS yêu cầu số nguyên)
    order_code = int(time.time() * 1000)  # milliseconds timestamp
    
    try:
        payos = PayOSService(
            client_id=settings.PAYOS_CLIENT_ID,
            api_key=settings.PAYOS_API_KEY,
            checksum_key=settings.PAYOS_CHECKSUM_KEY
        )
        
        # Tạo payment link
        result = payos.create_payment_link(
            order_code=order_code,
            amount=int(amount),
            description=description,
            return_url=f"{settings.FRONTEND_URL}/payment/success",
            cancel_url=f"{settings.FRONTEND_URL}/payment/cancel",
            buyer_name=request.user.get_full_name() if hasattr(request, 'user') and hasattr(request.user, 'get_full_name') else None,
            buyer_email=request.user.email if hasattr(request, 'user') and hasattr(request.user, 'email') else None,
            buyer_phone=getattr(request.user, 'phone', None) if hasattr(request, 'user') else None
        )
        
        logger.info(f"Payment link created for order {order_id}, order_code: {order_code}")
        
        return Response({
            'payment_url': result['data']['checkoutUrl'],
            'qr_code': result['data']['qrCode'],
            'order_code': order_code,
            'account_number': result['data'].get('accountNumber'),
            'account_name': result['data'].get('accountName'),
            'amount': amount,
            'description': description
        })
        
    except Exception as e:
        logger.error(f"Error creating payment: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])  # Changed to AllowAny for testing
def check_payment_status(request, order_code):
    """
    Kiểm tra trạng thái thanh toán
    
    URL: /api/payments/status/<order_code>/
    
    Response:
    {
        "status": "PAID" | "PENDING" | "CANCELLED",
        "amount": 500000,
        "order_code": 1234567890123
    }
    """
    try:
        payos = PayOSService(
            client_id=settings.PAYOS_CLIENT_ID,
            api_key=settings.PAYOS_API_KEY,
            checksum_key=settings.PAYOS_CHECKSUM_KEY
        )
        
        result = payos.get_payment_info(order_code=int(order_code))
        
        return Response({
            'status': result['data']['status'],
            'amount': result['data']['amount'],
            'order_code': order_code,
            'transactions': result['data'].get('transactions', [])
        })
        
    except Exception as e:
        logger.error(f"Error checking payment status: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_payment_request(request, order_code):
    """
    Hủy thanh toán
    
    URL: /api/payments/cancel/<order_code>/
    
    Request body:
    {
        "reason": "User cancelled"
    }
    """
    reason = request.data.get('reason', 'User cancelled')
    
    try:
        payos = PayOSService(
            client_id=settings.PAYOS_CLIENT_ID,
            api_key=settings.PAYOS_API_KEY,
            checksum_key=settings.PAYOS_CHECKSUM_KEY
        )
        
        result = payos.cancel_payment(order_code=int(order_code), reason=reason)
        
        logger.info(f"Payment cancelled for order_code: {order_code}")
        
        return Response({
            'success': True,
            'message': 'Payment cancelled successfully'
        })
        
    except Exception as e:
        logger.error(f"Error cancelling payment: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def payos_webhook(request):
    """
    Webhook nhận thông báo từ PayOS khi thanh toán thành công
    
    PayOS sẽ gửi POST request đến endpoint này với:
    - Header: x-signature
    - Body: webhook data
    
    Webhook data structure:
    {
        "code": "00",  # "00" = success
        "desc": "success",
        "data": {
            "orderCode": 1234567890,
            "amount": 500000,
            "description": "...",
            "accountNumber": "...",
            "reference": "...",
            "transactionDateTime": "...",
            "currency": "VND",
            "paymentLinkId": "...",
            "code": "00",
            "desc": "success",
            "counterAccountBankId": "",
            "counterAccountBankName": "",
            "counterAccountName": "",
            "counterAccountNumber": "",
            "virtualAccountName": "",
            "virtualAccountNumber": ""
        },
        "signature": "..."
    }
    """
    signature = request.headers.get('x-signature')
    
    if not signature:
        logger.warning("Webhook received without signature")
        return Response(
            {'error': 'Missing signature'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        payos = PayOSService(
            client_id=settings.PAYOS_CLIENT_ID,
            api_key=settings.PAYOS_API_KEY,
            checksum_key=settings.PAYOS_CHECKSUM_KEY
        )
        
        # Verify signature
        webhook_data = request.data
        if not payos.verify_webhook_signature(webhook_data, signature):
            logger.warning("Invalid webhook signature received")
            return Response(
                {'error': 'Invalid signature'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Xử lý webhook data
        code = webhook_data.get('code')
        data = webhook_data.get('data', {})
        order_code = data.get('orderCode')
        amount = data.get('amount')
        description = data.get('description')
        
        logger.info(f"Webhook received - Order: {order_code}, Status: {code}, Amount: {amount}")
        
        # TODO: Cập nhật trạng thái đơn hàng trong database
        # Ví dụ:
        # if code == "00":  # Payment success
        #     Order.objects.filter(code=order_code).update(
        #         status='paid',
        #         payment_time=data.get('transactionDateTime'),
        #         payment_reference=data.get('reference')
        #     )
        
        return Response({
            'success': True,
            'message': 'Webhook processed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
