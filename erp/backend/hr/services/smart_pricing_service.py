import pandas as pd
from hr.models.smartpricing import Smart_Pricing
import pickle
import numpy as np
import random
import os
import logging
from tqdm import tqdm
import matplotlib.pyplot as plt

logger = logging.getLogger(__name__)


class QAgent:
    """Q-learning agent (tabular)."""
    def __init__(self, action_size, alpha=0.1, gamma=0.9, epsilon=0.2):
        self.Q = {}  # dict: state -> list of Q for each action
        self.action_size = action_size
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon

    def get_Q(self, state):
        """Return Q-list for state, initialize to zeros if missing."""
        if state not in self.Q:
            self.Q[state] = [0.0] * self.action_size
        return self.Q[state]

    def choose_action(self, state):
        """Epsilon-greedy action selection."""
        if random.random() < self.epsilon:
            return random.randrange(self.action_size)
        return int(np.argmax(self.get_Q(state)))

    def learn(self, state, action, reward, next_state):
        """Q-learning update."""
        current_q = self.get_Q(state)[action]
        next_max = max(self.get_Q(next_state))
        new_q = current_q + self.alpha * (reward + self.gamma * next_max - current_q)
        self.Q[state][action] = new_q


class SmartPricingTrainer:
    """
    Trainer for Smart Pricing Q-agent.

    - Thêm area_m2 vào dữ liệu và encode thành area_level để dùng làm 1 phần của state.
    - Tính base_rate = unit_price_per_m2 * area_m2.
    - Nếu có accepted_status trong DB, reward sẽ được (proposed_price - base_rate) khi accepted, ngược lại = 0.
    - Hỗ trợ incremental learning: load Q-table cũ nếu có.
    """
    MODEL_PATH = "../ml_models/q_agent_pricing.pkl"
    DATA_CSV = "../ml_models/pricing_training_data.csv"
    ACTIONS = [-0.2, -0.1, 0.0, 0.1, 0.2]
    MIN_SAMPLES = 100  # tối thiểu mẫu

    # đơn giá theo m2 (phù hợp với dữ liệu mô phỏng / thực tế)
    UNIT_PRICE_REGULAR = 40000
    UNIT_PRICE_DEEP = 59000

    def export_data_from_db(self):
        """Export data from DB to CSV, overwrite cũ. Trả về DataFrame hoặc None."""
        try:
            qs = Smart_Pricing.objects.all().values(
                'service_type_id',
                'hours_peak',
                'customer_history_score',
                'area_m2',
                'price_adjustment',
                'reward',
                'accepted_status',
                'created_at'
            )
            df = pd.DataFrame(qs)

            if df.empty:
                print("Database doesn't have SmartPricing data")
                return None

            os.makedirs(os.path.dirname(self.DATA_CSV), exist_ok=True)

            # xóa file cũ nếu có
            if os.path.exists(self.DATA_CSV):
                os.remove(self.DATA_CSV)
                print(f"Removed old data file: {self.DATA_CSV}")

            df.to_csv(self.DATA_CSV, index=False)
            print(f"Exported {len(df)} records to {self.DATA_CSV}")
            return df

        except Exception as e:
            logger.exception("Error exporting data: %s", e)
            print(f"Error exporting data: {e}")
            return None

    def load_data(self):
        """Load CSV đã export."""
        if not os.path.exists(self.DATA_CSV):
            print(f"File {self.DATA_CSV} doesn't exist")
            return pd.DataFrame()
        df = pd.read_csv(self.DATA_CSV)
        print(f"Loaded {len(df)} training samples from CSV")
        return df

    def _area_level(self, area):
        """Bucket hóa diện tích để rời rạc hóa state.
        Ngưỡng này có thể điều chỉnh tùy đặc thù dữ liệu.
        """
        try:
            area = float(area)
        except Exception:
            # nếu NaN/không hợp lệ -> đặt vào nhóm trung bình
            return 1

        if area < 40:
            return 0
        elif area < 80:
            return 1
        else:
            return 2

    def _compute_base_rate(self, service_type_id, area_m2):
        """Tính base_rate = unit_price_per_m2 * area_m2"""
        try:
            area = float(area_m2)
        except Exception:
            area = 0.0
        unit = self.UNIT_PRICE_DEEP if int(service_type_id) == 1 else self.UNIT_PRICE_REGULAR
        return area * unit

    def _recompute_reward(self, row):
        """
        Tính reward dựa vào base_rate và price_adjustment nếu cần.
        Nếu DB đã có reward hợp lệ, có thể giữ; nhưng để nhất quán ta ưu tiên tính lại
        theo accepted_status (nếu cột accepted_status có giá trị 0/1).
        """
        base_rate = self._compute_base_rate(row.get('service_type_id', 0), row.get('area_m2', 0))
        try:
            delta = float(row.get('price_adjustment', 0.0))
        except Exception:
            delta = 0.0
        proposed_price = base_rate * (1 + delta)
        accepted = int(row.get('accepted_status', 0)) if pd.notna(row.get('accepted_status', None)) else None

        if accepted is None:
            # nếu không có accepted_status, fallback về cột reward nếu có
            try:
                return float(row.get('reward', 0.0))
            except Exception:
                return 0.0
        else:
            return (proposed_price - base_rate) if accepted == 1 else 0.0

    def train_model(self):
        """Quy trình train:
        1) Export data
        2) Load data, chuẩn hoá, tạo state có area_level
        3) Train QAgent
        4) Lưu model
        """
        # 1) Export
        df = self.export_data_from_db()
        if df is None or df.empty:
            print("No data to train. Skipping this retrain.")
            return

        # 2) Kiểm tra số lượng mẫu
        if len(df) < self.MIN_SAMPLES:
            print(f"At least {self.MIN_SAMPLES} samples are required, but only {len(df)} are available. Not enough to train.")
            return

        # 2b) Clean / đảm bảo các cột quan trọng tồn tại
        expected_cols = ['service_type_id', 'hours_peak', 'customer_history_score', 'area_m2', 'price_adjustment', 'reward', 'accepted_status']
        for c in expected_cols:
            if c not in df.columns:
                df[c] = 0

        # Chuẩn hoá kiểu dữ liệu cơ bản
        df['service_type_id'] = df['service_type_id'].fillna(0).astype(int)
        df['hours_peak'] = df['hours_peak'].fillna(0).astype(int)
        df['customer_history_score'] = df['customer_history_score'].fillna(0).astype(int)
        df['area_m2'] = df['area_m2'].fillna(0).astype(float)
        df['price_adjustment'] = df['price_adjustment'].fillna(0).astype(float)
        # reward và accepted_status giữ nguyên để tính lại nếu cần

        # 3) Tạo các cột phụ: area_level và base_rate, recomputed_reward
        df['area_level'] = df['area_m2'].apply(self._area_level)
        df['base_rate'] = df.apply(lambda r: self._compute_base_rate(r['service_type_id'], r['area_m2']), axis=1)
        # Tính lại reward để nhất quán (nếu DB có accepted_status, dùng nó)
        df['computed_reward'] = df.apply(lambda r: self._recompute_reward(r), axis=1)

        # 4) Initialize agent
        agent = QAgent(action_size=len(self.ACTIONS))

        # Load old model nếu có để tiếp tục học (incremental)
        if os.path.exists(self.MODEL_PATH):
            try:
                with open(self.MODEL_PATH, 'rb') as f:
                    old_agent = pickle.load(f)
                    if hasattr(old_agent, 'Q'):
                        agent.Q = old_agent.Q
                        print("Loaded old Q-table to continue learning")
                    else:
                        print("Old model doesn't contain Q attribute, training from scratch.")
            except Exception as e:
                print(f"Can't load old model: {e}. Training from scratch.")

        epochs = 50
        print(f"Starting training for {epochs} epochs...")
        avg_rewards = []

        # 5) Training loop: dùng sequence từ các bản ghi (lấy từng cặp (i, i+1) như bạn làm)
        for epoch in tqdm(range(epochs), desc="Training progress"):
            df_shuffled = df.sample(frac=1, random_state=epoch).reset_index(drop=True)
            epoch_rewards = []

            for i in range(len(df_shuffled) - 1):
                row = df_shuffled.iloc[i]
                next_row = df_shuffled.iloc[i + 1]

                # Build state và next_state gồm area_level
                state = (
                    int(row['service_type_id']),
                    int(row['hours_peak']),
                    min(int(row['customer_history_score']), 5),
                    int(row['area_level'])
                )

                next_state = (
                    int(next_row['service_type_id']),
                    int(next_row['hours_peak']),
                    min(int(next_row['customer_history_score']), 5),
                    int(next_row['area_level'])
                )

                # map price_adjustment -> action index (closest)
                delta = float(row['price_adjustment'])
                action_idx = min(range(len(self.ACTIONS)),
                                 key=lambda j: abs(self.ACTIONS[j] - delta))

                # reward: dùng computed_reward đã tính lại
                reward = float(row.get('computed_reward', 0.0))

                # learn
                agent.learn(state, action_idx, reward, next_state)
                epoch_rewards.append(reward)

            avg_r = np.mean(epoch_rewards)
            avg_rewards.append(avg_r)

            if (epoch + 1) % 10 == 0:
                print(f" Epoch {epoch + 1}/{epochs} completed")

                # In 3 Q-values cao nhất
                top_states = sorted(agent.Q.items(), key=lambda kv: max(kv[1]), reverse=True)[:3]
                print("🔹 Top learned states:")
                for s, qvals in top_states:
                    print(f"   State {s}: Q = {[round(v, 2) for v in qvals]}")

        # 6) Save model
        os.makedirs(os.path.dirname(self.MODEL_PATH), exist_ok=True)
        try:
            with open(self.MODEL_PATH, 'wb') as f:
                pickle.dump(agent, f)
            print(f"Model training completed and saved at {self.MODEL_PATH}")
            print(f"Q-table size: {len(agent.Q)} states")
        except Exception as e:
            logger.exception("Failed to save model: %s", e)
            print(f"Failed to save model: {e}")

        # (Tùy chọn) Vẽ đồ thị reward qua từng epoch
        plt.figure(figsize=(8, 4))
        plt.plot(avg_rewards, label="Average Reward per Epoch")
        plt.xlabel("Epoch")
        plt.ylabel("Avg Reward")
        plt.title("Smart Pricing Training Progress")
        plt.legend()
        plt.show()
