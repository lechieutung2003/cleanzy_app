"""
Check payment status directly from PayOS API
"""
import requests
import json
import sys

# Nhập order_code từ test trước (hoặc lấy từ command line argument)
if len(sys.argv) > 1:
    order_code = sys.argv[1]
else:
    print("\n💡 Order code là số hiển thị trong output test:")
    print("   Ví dụ: 🔢 Order Code: 1762617786786")
    print("\n📝 Cách dùng:")
    print(f"   python {sys.argv[0]} 1762617786786")
    print("   Hoặc nhập order code bên dưới:\n")
    order_code = input("Nhập order_code: ").strip()

url = f"http://localhost:8008/api/payments/status/{order_code}/"

print(f"\n📤 Checking: {url}\n")

try:
    response = requests.get(url)
    print(f"📊 Status Code: {response.status_code}\n")
    
    if response.status_code == 200:
        result = response.json()
        print("📥 Response:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        status = result.get('status')
        print(f"\n{'='*60}")
        if status == 'PAID':
            print("✅ PAYMENT SUCCESSFUL!")
            print(f"   Amount: {result.get('amount'):,} VND")
            if result.get('transactions'):
                print(f"   Transactions: {len(result.get('transactions'))}")
                for i, tx in enumerate(result.get('transactions'), 1):
                    print(f"\n   Transaction {i}:")
                    print(f"     Reference: {tx.get('reference')}")
                    print(f"     Amount: {tx.get('amount'):,} VND")
                    print(f"     Date: {tx.get('transactionDateTime')}")
        elif status == 'PENDING':
            print("⏳ Payment still pending")
        elif status == 'CANCELLED':
            print("❌ Payment cancelled")
        else:
            print(f"❓ Unknown status: {status}")
        print('='*60)
    else:
        print(f"❌ Error: {response.text}")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
