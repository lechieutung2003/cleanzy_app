"""
PayOS Service for payment processing
Documentation: https://payos.vn/docs/
"""
import requests
import hmac
import hashlib
import json
from typing import Dict, Optional
from datetime import datetime


class PayOSService:
    """
    Service để tương tác với PayOS API
    """
    BASE_URL = "https://api-merchant.payos.vn"
    
    def __init__(self, client_id: str, api_key: str, checksum_key: str):
        self.client_id = client_id
        self.api_key = api_key
        self.checksum_key = checksum_key
    
    def create_payment_link(
        self,
        order_code: int,
        amount: int,
        description: str,
        return_url: str,
        cancel_url: str,
        buyer_name: Optional[str] = None,
        buyer_email: Optional[str] = None,
        buyer_phone: Optional[str] = None,
        items: Optional[list] = None
    ) -> Dict:
        """
        Tạo link thanh toán PayOS
        
        Args:
            order_code: Mã đơn hàng (unique)
            amount: Số tiền thanh toán
            description: Mô tả thanh toán
            return_url: URL redirect khi thanh toán thành công
            cancel_url: URL redirect khi hủy thanh toán
            buyer_name: Tên người mua
            buyer_email: Email người mua
            buyer_phone: Số điện thoại người mua
            items: Danh sách items (optional)
        
        Returns:
            Dict chứa thông tin payment link và QR code
        """
        url = f"{self.BASE_URL}/v2/payment-requests"
        
        payload = {
            "orderCode": order_code,
            "amount": amount,
            "description": description,
            "returnUrl": return_url,
            "cancelUrl": cancel_url
        }
        
        if buyer_name:
            payload["buyerName"] = buyer_name
        if buyer_email:
            payload["buyerEmail"] = buyer_email
        if buyer_phone:
            payload["buyerPhone"] = buyer_phone
        if items:
            payload["items"] = items
        
        # Tạo signature
        signature = self._create_signature(payload)
        payload["signature"] = signature
        
        headers = {
            "x-client-id": self.client_id,
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        return response.json()
    
    def get_payment_info(self, order_code: int) -> Dict:
        """
        Lấy thông tin thanh toán theo order code
        
        Args:
            order_code: Mã đơn hàng
        
        Returns:
            Dict chứa thông tin thanh toán
        """
        url = f"{self.BASE_URL}/v2/payment-requests/{order_code}"
        
        headers = {
            "x-client-id": self.client_id,
            "x-api-key": self.api_key
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        return response.json()
    
    def cancel_payment(self, order_code: int, reason: str = "User cancelled") -> Dict:
        """
        Hủy thanh toán
        
        Args:
            order_code: Mã đơn hàng
            reason: Lý do hủy
        
        Returns:
            Dict chứa kết quả hủy thanh toán
        """
        url = f"{self.BASE_URL}/v2/payment-requests/{order_code}/cancel"
        
        payload = {
            "cancellationReason": reason
        }
        
        headers = {
            "x-client-id": self.client_id,
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        return response.json()
    
    def verify_webhook_signature(self, webhook_data: Dict, received_signature: str) -> bool:
        """
        Verify webhook signature từ PayOS
        
        Args:
            webhook_data: Dữ liệu webhook nhận được
            received_signature: Signature trong header x-signature
        
        Returns:
            True nếu signature hợp lệ
        """
        # Tạo string từ webhook data
        data_str = json.dumps(webhook_data, separators=(',', ':'), ensure_ascii=False, sort_keys=True)
        
        # Tính signature
        expected_signature = hmac.new(
            self.checksum_key.encode(),
            data_str.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, received_signature)
    
    def _create_signature(self, payload: Dict) -> str:
        """
        Tạo signature cho request
        
        Args:
            payload: Data cần tạo signature
        
        Returns:
            Signature string
        """
        # Sort keys và tạo string theo format PayOS yêu cầu
        sorted_keys = sorted(payload.keys())
        data_str = "&".join([f"{key}={payload[key]}" for key in sorted_keys])
        
        signature = hmac.new(
            self.checksum_key.encode(),
            data_str.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return signature
