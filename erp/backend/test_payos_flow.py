"""
Test PayOS Payment Flow
- Create payment link with QR code
- Display QR for scanning
- Auto check payment status
"""
import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8008"

def create_payment():
    """Create payment and get QR code"""
    print("\n" + "="*60)
    print("🚀 STEP 1: Creating Payment Link")
    print("="*60)
    
    url = f"{BASE_URL}/api/payments/create/"
    
    data = {
        "amount": 10000,  # 10,000 VND for testing (tăng từ 2,000 lên 10,000)
        "description": "Test payment - Cleanzy App",
        "order_id": f"TEST_{int(time.time())}"
    }
    
    print(f"\n📤 POST {url}")
    print(f"📦 Data: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        # Note: Remove Authorization header if endpoint doesn't require auth
        response = requests.post(url, json=data)
        
        print(f"\n📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Payment Created Successfully!")
            print(f"\n{'='*60}")
            print(f"💰 Amount: {result.get('amount'):,} VND")
            print(f"📝 Description: {result.get('description')}")
            print(f"🔢 Order Code: {result.get('order_code')}")
            print(f"{'='*60}")
            print(f"\n🏦 Bank Account Info:")
            print(f"   Account Number: {result.get('account_number')}")
            print(f"   Account Name: {result.get('account_name')}")
            print(f"   Bank: {result.get('bank_name', 'N/A')}")
            print(f"{'='*60}")
            print(f"\n🌐 Payment URL:")
            print(f"   {result.get('payment_url')}")
            print(f"\n📱 QR Code from PayOS:")
            print(f"   Raw: {result.get('qr_code')[:80]}...")
            print(f"\n⚠️  IMPORTANT: Phải dùng QR code từ PayOS, không dùng VietQR tự tạo!")
            print(f"   → Mở Payment URL trên để lấy QR đúng")
            print(f"   → Hoặc decode QR string để hiển thị")
            print(f"{'='*60}")
            print(f"\n👉 Mở Payment URL trong browser và quét QR code từ trang đó")
            print(f"👉 KHÔNG quét QR tự tạo từ VietQR (sẽ thiếu mã giao dịch)")
            print(f"{'='*60}")
            
            return result.get('order_code')
        else:
            print(f"\n❌ Failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return None


def check_payment_status(order_code):
    """Check payment status"""
    url = f"{BASE_URL}/api/payments/status/{order_code}/"
    
    try:
        response = requests.get(url)
        
        if response.status_code == 200:
            result = response.json()
            status = result.get('status')
            
            if status == 'PAID':
                print(f"\n✅ PAYMENT SUCCESSFUL!")
                print(f"   Status: {status}")
                print(f"   Amount: {result.get('amount'):,} VND")
                if result.get('transactions'):
                    print(f"   Transactions: {len(result.get('transactions'))} found")
                return True
            elif status == 'PENDING':
                return False
            elif status == 'CANCELLED':
                print(f"\n❌ Payment was cancelled")
                return None
            else:
                print(f"\n⚠️  Unknown status: {status}")
                return False
        else:
            print(f"\n⚠️  Check failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"\n⚠️  Check error: {str(e)}")
        return False


def auto_check_payment(order_code, timeout=300):
    """Auto check payment status every 5 seconds"""
    print(f"\n{'='*60}")
    print(f"⏳ Auto-checking payment status...")
    print(f"   Will check every 5 seconds for up to {timeout} seconds")
    print(f"   Press Ctrl+C to stop")
    print(f"{'='*60}")
    
    start_time = time.time()
    check_count = 0
    
    try:
        while True:
            elapsed = time.time() - start_time
            if elapsed > timeout:
                print(f"\n⏰ Timeout reached ({timeout}s)")
                print(f"   Payment not confirmed")
                break
            
            check_count += 1
            current_time = datetime.now().strftime("%H:%M:%S")
            print(f"\n[{current_time}] Check #{check_count} - Elapsed: {int(elapsed)}s", end="")
            
            result = check_payment_status(order_code)
            
            if result is True:
                # Payment successful
                print(f"\n\n{'='*60}")
                print(f"🎉 PAYMENT CONFIRMED!")
                print(f"   Took {int(elapsed)} seconds")
                print(f"   Total checks: {check_count}")
                print(f"{'='*60}")
                break
            elif result is None:
                # Payment cancelled
                break
            else:
                # Still pending
                print(f" - Status: PENDING")
                time.sleep(5)
                
    except KeyboardInterrupt:
        print(f"\n\n⚠️  Stopped by user")
        print(f"   Elapsed: {int(time.time() - start_time)}s")
        print(f"   Total checks: {check_count}")


def main():
    print("\n" + "="*60)
    print("💳 PayOS Payment Testing")
    print("="*60)
    
    # Step 1: Create payment
    order_code = create_payment()
    
    if not order_code:
        print("\n❌ Failed to create payment. Exiting...")
        return
    
    # Wait a bit for user to see the info
    print(f"\n⏱️  Starting auto-check in 3 seconds...")
    time.sleep(3)
    
    # Step 2: Auto check payment
    auto_check_payment(order_code, timeout=300)  # 5 minutes timeout
    
    print(f"\n{'='*60}")
    print(f"✨ Test completed!")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
