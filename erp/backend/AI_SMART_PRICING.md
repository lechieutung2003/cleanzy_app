# Quy trình đề xuất giá Smart Pricing - Giải thích chi tiết

## 📊 Tổng quan quy trình

```
┌─────────────────┐
│  Thu thập data  │ → Khách chấp nhận/từ chối giá
└────────┬────────┘
         ↓
┌─────────────────┐
│  Training ML    │ → Q-learning học pattern
└────────┬────────┘
         ↓
┌─────────────────┐
│  Prediction API │ → Đề xuất giá cho order mới
└─────────────────┘
```

---

## 1️⃣ Thu thập dữ liệu (Data Collection)

### Các yếu tố đầu vào:

| Yếu tố | Ý nghĩa | Ví dụ |
|--------|---------|-------|
| **service_type_id** | Loại dịch vụ | 0=Regular, 1=Deep Clean |
| **area_m2** | Diện tích căn hộ | 60 m² |
| **hours_peak** | Giờ cao điểm | True/False |
| **customer_history_score** | Điểm khách hàng | 0-5 (0=mới, 5=VIP) |
| **base_rate** | Giá cơ bản | area × unit_price |
| **price_adjustment** | Mức điều chỉnh | -20% đến +20% |
| **proposed_price** | Giá đề xuất | base_rate × (1 + adjustment) |
| **accepted_status** | Khách có chấp nhận? | True/False |
| **reward** | Phần thưởng ML | proposed_price - base_rate (nếu accepted) |

### Ví dụ cụ thể:

```python
# Order 1: Deep Clean, 60m², giờ bình thường, khách mới
service_type_id = 1      # Deep Clean
area_m2 = 60
hours_peak = False
customer_history_score = 0

# Tính giá cơ bản
unit_price = 59,000      # Deep Clean = 59k/m²
base_rate = 60 × 59,000 = 3,540,000 VND

# AI đề xuất tăng giá 5%
price_adjustment = 0.05
proposed_price = 3,540,000 × 1.05 = 3,717,000 VND

# Khách chấp nhận → Reward = 177,000 VND
accepted_status = True
reward = 3,717,000 - 3,540,000 = 177,000
```

---

## 2️⃣ Training Model (Q-Learning)

### **Khái niệm Q-Learning:**

Q-Learning là thuật toán **Reinforcement Learning** (học tăng cường) dạng:
- **State**: Tình huống hiện tại
- **Action**: Hành động có thể làm (điều chỉnh giá)
- **Reward**: Phần thưởng nhận được
- **Q-value**: Giá trị kỳ vọng của mỗi action ở mỗi state

### **State (Trạng thái):**

State được định nghĩa bởi **4 yếu tố**:

```python
state = (service_type_id, hours_peak, customer_history_score, area_level)
```

**Ví dụ:**
```python
# Deep Clean, giờ bình thường, khách mới, diện tích trung bình
state = (1, 0, 0, 1)

# Regular, giờ cao điểm, khách VIP, diện tích lớn
state = (0, 1, 5, 2)
```

### **Action (Hành động):**

5 mức điều chỉnh giá có thể:

```python
ACTIONS = [-0.2, -0.1, 0.0, 0.1, 0.2]
```

| Action | Ý nghĩa | Ví dụ (base = 3,540,000) |
|--------|---------|--------------------------|
| -0.2 | Giảm 20% | 2,832,000 VND |
| -0.1 | Giảm 10% | 3,186,000 VND |
| 0.0 | Không đổi | 3,540,000 VND |
| 0.1 | Tăng 10% | 3,894,000 VND |
| 0.2 | Tăng 20% | 4,248,000 VND |

### **Reward (Phần thưởng):**

```python
if accepted_status == True:
    reward = proposed_price - base_rate  # Profit thu được
else:
    reward = 0  # Không profit
```

**Ý nghĩa:**
- Khách chấp nhận → Reward dương → AI học rằng action này tốt
- Khách từ chối → Reward = 0 → AI học rằng action này chưa tốt

### **Q-Value Update:**

Công thức Q-learning:

```python
Q(state, action) ← Q(state, action) + α[reward + γ·max(Q(next_state, a')) - Q(state, action)]
```

**Tham số:**
- **α (alpha)** = 0.1: Learning rate (tốc độ học)
- **γ (gamma)** = 0.9: Discount factor (trọng số tương lai)
- **ε (epsilon)** = 0.2: Exploration rate (tỉ lệ thử nghiệm)

---

## 3️⃣ Prediction (Dự đoán giá)

### **Quy trình dự đoán:**

```python
# Bước 1: Tạo state từ thông tin order
service_type_id = 1
area_m2 = 60
hours_peak = False
customer_history_score = 3

# Bước 2: Phân loại diện tích
def _area_level(area):
    if area < 40:      return 0  # Nhỏ
    elif area < 80:    return 1  # Trung bình
    else:              return 2  # Lớn

area_level = _area_level(60)  # → 1

# Bước 3: Tạo state tuple
state = (1, 0, 3, 1)
#        │  │  │  └─ area_level = 1 (trung bình)
#        │  │  └──── customer_history_score = 3
#        │  └─────── hours_peak = 0 (False)
#        └────────── service_type_id = 1 (Deep Clean)

# Bước 4: Tính base_rate
unit_price = 59000  # Deep Clean
base_rate = 60 × 59000 = 3,540,000 VND

# Bước 5: Lấy Q-values từ trained model
Q_values = agent.Q[state]
# Ví dụ: [-50000, -20000, 10000, 150000, 80000]
#            ↑       ↑       ↑      ↑       ↑
#           -20%    -10%     0%    +10%    +20%

# Bước 6: Chọn action có Q-value cao nhất
best_action_idx = argmax(Q_values)  # → 3 (index của +10%)
price_adjustment = ACTIONS[3]       # → 0.1

# Bước 7: Tính giá đề xuất
proposed_price = 3,540,000 × (1 + 0.1) = 3,894,000 VND
```

---

## 4️⃣ Ví dụ thực tế chi tiết

### **Scenario 1: Khách mới, căn hộ lớn, giờ cao điểm**

```python
# Input
service_type_id = 1       # Deep Clean
area_m2 = 100
hours_peak = True         # Giờ cao điểm
customer_history_score = 0  # Khách mới

# Processing
state = (1, 1, 0, 2)      # Deep, peak, new customer, large area
base_rate = 100 × 59000 = 5,900,000 VND

# AI đã học được rằng:
# - Giờ cao điểm + khách mới → nên giảm giá để thu hút
# - Nhưng diện tích lớn → có thể tăng nhẹ

# Giả sử Q-values = [-100k, 50k, 100k, 200k, 150k]
# → Chọn action +10%

proposed_price = 5,900,000 × 1.1 = 6,490,000 VND
```

### **Scenario 2: Khách VIP, căn hộ nhỏ, giờ bình thường**

```python
# Input
service_type_id = 0       # Regular Clean
area_m2 = 35
hours_peak = False
customer_history_score = 5  # Khách VIP

# Processing
state = (0, 0, 5, 0)      # Regular, normal, VIP, small area
base_rate = 35 × 40000 = 1,400,000 VND

# AI đã học được:
# - Khách VIP thường chấp nhận giá cao
# - Diện tích nhỏ → có thể tăng giá đáng kể

# Giả sử Q-values = [-50k, -20k, 10k, 100k, 250k]
# → Chọn action +20%

proposed_price = 1,400,000 × 1.2 = 1,680,000 VND
```

---

## 5️⃣ Tại sao AI đề xuất giá này?

### **Các yếu tố AI xem xét:**

1. **Lịch sử chấp nhận:**
   - Nếu state này đã có nhiều lần khách chấp nhận với +10% → Q-value của +10% cao
   - Nếu +20% bị từ chối nhiều → Q-value của +20% thấp

2. **Tối ưu profit:**
   - Không phải lúc nào cũng tăng giá cao nhất
   - Cân bằng giữa **profit margin** và **acceptance rate**

3. **Pattern learning:**
   - Khách VIP (score 4-5) → chấp nhận giá cao hơn
   - Giờ cao điểm → nên giảm giá để cạnh tranh
   - Diện tích lớn → có thể tăng giá vì khối lượng công việc

---

## 6️⃣ Confidence Level

API trả về `confidence` để chỉ độ tin cậy:

```python
if state in agent.Q:
    confidence = 'high'    # State đã học nhiều lần
else:
    confidence = 'medium'  # State mới, chưa học
    price_adjustment = 0.0 # Dùng giá cơ bản an toàn
```

---

## 7️⃣ Feedback Loop (Vòng lặp cải thiện)

```
Order mới
   ↓
API đề xuất giá (ví dụ: 3,894,000)
   ↓
Khách chấp nhận/từ chối
   ↓
Lưu vào Smart_Pricing table
   ↓
Scheduler retrain model (23:59 hàng đêm)
   ↓
Model cải thiện → Đề xuất tốt hơn cho order tiếp theo
```

---

## 8️⃣ Response API mẫu

```json
{
  "base_rate": 3540000.0,
  "proposed_price": 3894000.0,
  "price_adjustment": 0.1,
  "confidence": "high",
  "message": "Giá được đề xuất bởi AI"
}
```

**Giải thích:**
- `base_rate`: Giá cơ bản tính theo công thức `area × unit_price`
- `proposed_price`: Giá AI đề xuất = `base_rate × (1 + adjustment)`
- `price_adjustment`: Mức điều chỉnh AI chọn (+10% trong ví dụ)
- `confidence`: Độ tin cậy của dự đoán

---

## 📝 Tóm tắt công thức

```python
# Công thức tính giá
unit_price = 59000 if service_type_id == 1 else 40000
base_rate = area_m2 × unit_price
proposed_price = base_rate × (1 + price_adjustment)

# Công thức reward (để training)
if accepted_status == True:
    reward = proposed_price - base_rate
else:
    reward = 0

# Công thức Q-learning
Q_new = Q_old + α × (reward + γ × max(Q_next) - Q_old)
```

Hy vọng giải thích này giúp bạn hiểu rõ cách AI đề xuất giá! 🚀