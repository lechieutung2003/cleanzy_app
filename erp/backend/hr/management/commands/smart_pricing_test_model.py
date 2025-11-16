from django.core.management.base import BaseCommand
import numpy as np
import pickle

class CleaningPricingEnv:
    def __init__(self):
        self.base_rate_regular = 40000
        self.base_rate_deep = 50000
        self.actions = [-0.2, -0.1, 0, 0.1, 0.2]

def area_to_level(area_m2):
    if area_m2 < 30:
        return 0
    elif area_m2 < 60:
        return 1
    else:
        return 2

def suggest_price(agent, env, service_type, hour_peak, customer_history, area_m2):
    area_level = area_to_level(area_m2)
    state = (service_type, hour_peak, min(customer_history, 5), area_level)
    print("📘 State:", state)

    q_values = agent.Q.get(state, np.zeros(len(env.actions)))
    best_action_idx = np.argmax(q_values)
    delta = env.actions[best_action_idx]

    base_rate = env.base_rate_deep if service_type == 1 else env.base_rate_regular
    suggested_price = base_rate * (1 + delta)

    print("🔹 Q-values:", q_values)
    print("🔹 Best action index:", best_action_idx)
    print("🔹 Delta:", delta)
    print("🔹 Base rate:", base_rate)
    print("💰 Suggested price:", suggested_price)

    return suggested_price, delta


class Command(BaseCommand):
    help = "Test mô hình Q-learning đã train"

    def handle(self, *args, **options):
        with open("../ml_models/q_agent_pricing.pkl", "rb") as f:
            agent = pickle.load(f)

        env = CleaningPricingEnv()

        print("=== TEST Q-LEARNING MODEL ===")
        service_type = int(input("Nhập loại dịch vụ (0=Regular, 1=Deep): "))
        hour_peak = int(input("Giờ cao điểm? (0=Không, 1=Có): "))
        customer_history = int(input("Số lần khách đã đặt trước: "))
        area_m2 = float(input("Nhập diện tích phòng (m²): "))

        price, delta = suggest_price(agent, env, service_type, hour_peak, customer_history, area_m2)
        print(f"\n💡 Gợi ý giá: {price:.0f} VNĐ/h (điều chỉnh {delta*100:.0f}%)")
