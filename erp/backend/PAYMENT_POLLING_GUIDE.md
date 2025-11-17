# Payment Polling Guide

## Frontend/Mobile Implementation

### JavaScript/React Example:

```javascript
// Sau khi tạo đơn và nhận được order_code
const orderCode = response.data.payment.order_code;

// Function để check payment status
async function checkPaymentStatus(orderCode) {
  try {
    const response = await fetch(`/api/payments/status/${orderCode}/`);
    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error("Error checking payment:", error);
    return null;
  }
}

// Auto polling
function startPaymentPolling(orderCode, onSuccess) {
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes (60 * 5s)

  const interval = setInterval(async () => {
    attempts++;

    // Check status
    const status = await checkPaymentStatus(orderCode);

    console.log(`Checking payment... (${attempts}/${maxAttempts})`);

    if (status === "PAID") {
      clearInterval(interval);
      console.log("✅ Payment successful!");
      onSuccess();
    } else if (status === "CANCELLED") {
      clearInterval(interval);
      console.log("❌ Payment cancelled");
      alert("Thanh toán đã bị hủy");
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
      console.log("⏰ Timeout");
      alert("Hết thời gian chờ thanh toán. Vui lòng kiểm tra lại đơn hàng.");
    }
  }, 5000); // Check every 5 seconds

  return interval; // Return để có thể clear nếu cần
}

// Usage:
// 1. Sau khi tạo đơn
const orderResponse = await createOrder(orderData);

if (orderResponse.payment) {
  // 2. Hiển thị QR code
  showQRCode(orderResponse.payment.qr_code);

  // 3. Start polling
  startPaymentPolling(orderResponse.payment.order_code, () => {
    // Success callback
    hideQRCode();
    showSuccessMessage("Thanh toán thành công!");
    navigateToOrderDetail(orderResponse.id);
  });
}
```

### React Native Example:

```javascript
import { useState, useEffect, useRef } from "react";

function usePaymentPolling(orderCode, onSuccess) {
  const intervalRef = useRef(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const startPolling = () => {
    setIsPolling(true);
    setAttempts(0);

    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/payments/status/${orderCode}/`
        );
        const data = await response.json();

        setAttempts((prev) => prev + 1);

        if (data.status === "PAID") {
          stopPolling();
          onSuccess();
        } else if (attempts >= 60) {
          stopPolling();
          Alert.alert("Hết thời gian", "Vui lòng kiểm tra lại đơn hàng");
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  };

  useEffect(() => {
    return () => stopPolling(); // Cleanup
  }, []);

  return { startPolling, stopPolling, isPolling, attempts };
}

// Usage in component:
function PaymentScreen({ orderCode, navigation }) {
  const { startPolling, stopPolling, attempts } = usePaymentPolling(
    orderCode,
    () => {
      // Success
      Alert.alert("Thành công", "Thanh toán thành công!");
      navigation.navigate("OrderDetail");
    }
  );

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, []);

  return (
    <View>
      <QRCode value={qrCodeData} />
      <Text>Đang chờ thanh toán... ({attempts}/60)</Text>
    </View>
  );
}
```

---

## Backend Update Script

Có thể tạo cron job hoặc scheduled task để tự động check:

```python
# erp/backend/management/commands/check_pending_payments.py
from django.core.management.base import BaseCommand
from payments.models import Payment
from payments.services.payos_service import PayOSService
from django.conf import settings

class Command(BaseCommand):
    help = 'Check and update pending payments from PayOS'

    def handle(self, *args, **options):
        # Lấy tất cả payments đang PENDING
        pending_payments = Payment.objects.filter(
            status='PENDING',
            payment_method='BANK_TRANSFER'
        ).select_related('order')

        self.stdout.write(f"Found {pending_payments.count()} pending payments")

        payos = PayOSService(
            client_id=settings.PAYOS_CLIENT_ID,
            api_key=settings.PAYOS_API_KEY,
            checksum_key=settings.PAYOS_CHECKSUM_KEY
        )

        for payment in pending_payments:
            try:
                result = payos.get_payment_info(payment.order_code)

                if result.get('code') == '00' and 'data' in result:
                    payos_status = result['data'].get('status')

                    if payos_status == 'PAID' and payment.status != 'PAID':
                        payment.mark_as_paid(
                            transaction_id=result['data'].get('reference'),
                            webhook_data=result
                        )
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'✅ Payment {payment.id} updated to PAID'
                            )
                        )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Error checking {payment.id}: {str(e)}')
                )
```

Chạy định kỳ:

```bash
# Mỗi 30s check một lần
while true; do python manage.py check_pending_payments; sleep 30; done
```

---

## 2. Alternatives to ngrok

### **LocalTunnel (Free, no signup)**

```bash
npm install -g localtunnel
lt --port 8008
```

### **Cloudflare Tunnel (Free)**

```bash
# Install
winget install cloudflare.cloudflared

# Run
cloudflared tunnel --url http://localhost:8008
```

### **Visual Studio Dev Tunnels (Free, built-in)**

```bash
# Install
dotnet tool install --global Microsoft.VisualStudio.DevTunnel.Cli

# Create tunnel
devtunnel create
devtunnel port create 8008
devtunnel host
```

---

## 📋 Recommendation

**Cho Development:**
✅ **Dùng Polling** - Đơn giản, không setup, hoạt động ngay

**Cho Production:**
✅ **Dùng Webhook** - Real-time, chính xác, tiết kiệm resources

Bạn muốn tôi implement polling cho frontend không? 🚀
