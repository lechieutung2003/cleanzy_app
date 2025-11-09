"""
Payment models for PayOS integration
"""
from django.db import models
from django.utils import timezone
from base.models import TimeStampedModel
import logging

logger = logging.getLogger(__name__)


class Payment(TimeStampedModel):
    """
    Model lưu thông tin thanh toán
    """
    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Tiền mặt'),
        ('BANK_TRANSFER', 'Chuyển khoản ngân hàng'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Chờ thanh toán'),
        ('PAID', 'Đã thanh toán'),
        ('CANCELLED', 'Đã hủy'),
        ('EXPIRED', 'Hết hạn'),
    ]
    
    # Link với Order
    order = models.ForeignKey(
        'hr.Order',
        on_delete=models.CASCADE,
        related_name='payments'
    )
    
    # PayOS order code (chỉ có khi BANK_TRANSFER)
    order_code = models.BigIntegerField(
        unique=True,
        null=True,
        blank=True,
        help_text="Order code từ PayOS (timestamp milliseconds)"
    )
    
    # Thông tin thanh toán
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Số tiền thanh toán"
    )
    
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='CASH'
    )
    
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING'
    )
    
    # Thông tin PayOS (chỉ có khi BANK_TRANSFER)
    payment_url = models.URLField(
        blank=True,
        null=True,
        help_text="Link thanh toán từ PayOS"
    )
    
    qr_code = models.TextField(
        blank=True,
        null=True,
        help_text="QR code string từ PayOS"
    )
    
    account_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Số tài khoản ngân hàng"
    )
    
    account_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Tên tài khoản ngân hàng"
    )
    
    # Thông tin giao dịch
    transaction_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Mã giao dịch từ ngân hàng"
    )
    
    paid_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Thời gian thanh toán thành công"
    )
    
    cancelled_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Thời gian hủy thanh toán"
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Mô tả thanh toán"
    )
    
    webhook_data = models.JSONField(
        blank=True,
        null=True,
        help_text="Raw data từ PayOS webhook"
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Ghi chú thêm"
    )
    
    class Meta:
        db_table = 'payments_payment'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_code']),
            models.Index(fields=['order', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Payment {self.order_code or self.id} - {self.get_status_display()}"
    
    def mark_as_paid(self, transaction_id=None, webhook_data=None):
        """Đánh dấu thanh toán thành công"""
        self.status = 'PAID'
        self.paid_at = timezone.now()
        if transaction_id:
            self.transaction_id = transaction_id
        if webhook_data:
            self.webhook_data = webhook_data
        self.save()
        
        # Cập nhật order status sang PAID (đã thanh toán)
        if self.order.status == 'PENDING_PAYMENT':
            self.order.status = 'PAID'
            self.order.save()
            logger.info(f"Order {self.order.id} status updated from PENDING_PAYMENT to PAID")
    
    def mark_as_cancelled(self, reason=None):
        """Hủy thanh toán"""
        self.status = 'CANCELLED'
        self.cancelled_at = timezone.now()
        if reason:
            self.notes = reason
        self.save()
