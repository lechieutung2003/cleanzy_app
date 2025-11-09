"""
PayOS Service for payment processing
Documentation: https://payos.vn/docs/
"""
import requests
import hmac
import hashlib
import json
import logging
from typing import Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


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
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            # Check status code
            if response.status_code != 200:
                # PayOS trả về lỗi
                try:
                    error_data = response.json()
                    return {
                        "code": error_data.get("code", response.status_code),
                        "desc": error_data.get("desc", response.text),
                        "success": False
                    }
                except:
                    return {
                        "code": response.status_code,
                        "desc": response.text or "Unknown error from PayOS",
                        "success": False
                    }
            
            # Parse response
            result = response.json()
            
            logger.info(f"PayOS raw response: status={response.status_code}, body={result}")
            
            if result is None:
                return {
                    "code": "EMPTY_RESPONSE",
                    "desc": "PayOS returned empty response",
                    "success": False
                }
            
            return result
            
        except requests.Timeout:
            return {
                "code": "TIMEOUT",
                "desc": "Request to PayOS timed out",
                "success": False
            }
        except requests.ConnectionError:
            return {
                "code": "CONNECTION_ERROR",
                "desc": "Cannot connect to PayOS",
                "success": False
            }
        except Exception as e:
            return {
                "code": "UNKNOWN_ERROR",
                "desc": str(e),
                "success": False
            }
    
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
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code != 200:
                try:
                    error_data = response.json()
                    return {
                        "code": error_data.get("code", response.status_code),
                        "desc": error_data.get("desc", response.text),
                        "success": False
                    }
                except:
                    return {
                        "code": response.status_code,
                        "desc": response.text or "Unknown error from PayOS",
                        "success": False
                    }
            
            result = response.json()
            return result if result else {
                "code": "EMPTY_RESPONSE",
                "desc": "PayOS returned empty response",
                "success": False
            }
            
        except Exception as e:
            return {
                "code": "ERROR",
                "desc": str(e),
                "success": False
            }
    
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
        # PayOS chỉ yêu cầu signature cho các field chính, KHÔNG bao gồm:
        # - signature (vì đang tạo)
        # - items (optional field)
        # - buyerName, buyerEmail, buyerPhone (optional fields)
        
        # Chỉ lấy các field bắt buộc để tạo signature
        signature_fields = ['amount', 'cancelUrl', 'description', 'orderCode', 'returnUrl']
        sorted_keys = sorted([k for k in payload.keys() if k in signature_fields])
        
        # Convert values to string
        parts = []
        for key in sorted_keys:
            value = payload[key]
            # Nếu là list hoặc dict, convert sang JSON string
            if isinstance(value, (list, dict)):
                value_str = json.dumps(value, separators=(',', ':'), ensure_ascii=False)
            else:
                value_str = str(value)
            parts.append(f"{key}={value_str}")
        
        data_str = "&".join(parts)
        
        logger.info(f"Signature data string: {data_str}")
        
        signature = hmac.new(
            self.checksum_key.encode(),
            data_str.encode(),
            hashlib.sha256
        ).hexdigest()
        
        logger.info(f"Generated signature: {signature}")
        
        return signature
