# PayOS Payment Integration

PayOS integration cho thanh toán trong ứng dụng Cleanzy.

## Cấu hình

### 1. Đăng ký tài khoản PayOS

1. Truy cập: https://payos.vn/
2. Đăng ký tài khoản doanh nghiệp
3. Xác thực thông tin
4. Lấy thông tin API từ Dashboard:
   - Client ID
   - API Key
   - Checksum Key

### 2. Cấu hình Backend

Thêm vào file `config.env`:

```env
# PayOS Payment Gateway Configuration
PAYOS_CLIENT_ID=your_client_id_here
PAYOS_API_KEY=your_api_key_here
PAYOS_CHECKSUM_KEY=your_checksum_key_here
FRONTEND_URL=http://localhost:3000
```

### 3. API Endpoints

#### Tạo link thanh toán

```http
POST /api/payments/create/
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500000,
  "description": "Payment for order #123",
  "order_id": "123"
}
```

**Response:**

```json
{
  "payment_url": "https://pay.payos.vn/web/...",
  "qr_code": "https://img.vietqr.io/...",
  "order_code": 1234567890123,
  "account_number": "...",
  "account_name": "...",
  "amount": 500000,
  "description": "..."
}
```

#### Kiểm tra trạng thái thanh toán

```http
GET /api/payments/status/<order_code>/
Authorization: Bearer <token>
```

**Response:**

```json
{
  "status": "PAID",
  "amount": 500000,
  "order_code": 1234567890123,
  "transactions": [...]
}
```

#### Hủy thanh toán

```http
POST /api/payments/cancel/<order_code>/
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "User cancelled"
}
```

#### Webhook (PayOS sẽ gọi endpoint này)

```http
POST /api/payments/webhook/payos/
x-signature: <signature>
Content-Type: application/json

{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 1234567890,
    "amount": 500000,
    ...
  },
  "signature": "..."
}
```

### 4. Cấu hình Webhook trên PayOS Dashboard

1. Đăng nhập vào PayOS Dashboard
2. Vào Settings > Webhook
3. Thêm URL webhook: `https://your-domain.com/api/payments/webhook/payos/`
4. Lưu cấu hình

### 5. Testing

Để test local với webhook, bạn có thể dùng:

- **ngrok**: `ngrok http 8000`
- **localtunnel**: `lt --port 8000`

Sau đó cập nhật webhook URL trên PayOS Dashboard với public URL.

## Flow thanh toán

1. **Mobile app** gọi `/api/payments/create/` để tạo link thanh toán
2. Backend trả về `payment_url` và `qr_code`
3. User quét QR hoặc mở `payment_url` để thanh toán
4. Sau khi thanh toán thành công, PayOS gửi webhook đến backend
5. Backend xử lý webhook và cập nhật trạng thái đơn hàng
6. Mobile app có thể gọi `/api/payments/status/<order_code>/` để check trạng thái

## Status Codes

- `PENDING`: Đang chờ thanh toán
- `PAID`: Đã thanh toán thành công
- `CANCELLED`: Đã hủy
- `EXPIRED`: Hết hạn

## Lưu ý bảo mật

1. **Không commit** Client ID, API Key, Checksum Key lên Git
2. Luôn **verify webhook signature** trước khi xử lý
3. Sử dụng **HTTPS** cho production
4. **Rate limit** các API endpoints
5. **Log** tất cả các giao dịch để audit

## Troubleshooting

### Webhook không nhận được

- Kiểm tra URL webhook trên PayOS Dashboard
- Kiểm tra firewall/security group
- Xem logs: `tail -f /var/log/django/payments.log`

### Signature không hợp lệ

- Kiểm tra `PAYOS_CHECKSUM_KEY` trong config
- Kiểm tra format data gửi lên

### Payment link bị lỗi

- Kiểm tra `PAYOS_CLIENT_ID` và `PAYOS_API_KEY`
- Kiểm tra amount (phải > 0)
- Kiểm tra order_code (phải unique)

## Support

- PayOS Docs: https://payos.vn/docs/
- PayOS Support: support@payos.vn
