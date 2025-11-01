import pandas as pd
from erp.backend.hr.models.smartpricing import SmartPricing
import pickle
import numpy as np
import random
import os
import logging

logger = logging.getLogger(__name__)


class QAgent:
    """Q-learning agent"""
    def __init__(self, action_size, alpha=0.1, gamma=0.9, epsilon=0.2):
        self.Q = {}
        self.action_size = action_size
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon

    def get_Q(self, state):
        if state not in self.Q:
            self.Q[state] = [0.0] * self.action_size
        return self.Q[state]

    def choose_action(self, state):
        if random.random() < self.epsilon:
            return random.randrange(self.action_size)
        return int(np.argmax(self.get_Q(state)))

    def learn(self, state, action, reward, next_state):
        current_q = self.get_Q(state)[action]
        next_max = max(self.get_Q(next_state))
        new_q = current_q + self.alpha * (reward + self.gamma * next_max - current_q)
        self.Q[state][action] = new_q


class SmartPricingTrainer:
    MODEL_PATH = "../../ml_models/q_agent_pricing.pkl"
    DATA_CSV = "../../ml_models/pricing_training_data.csv"
    ACTIONS = [-0.2, -0.1, 0.0, 0.1, 0.2]
    MIN_SAMPLES = 100  # At least 100 samples to train

    def export_data_from_db(self):
        """Automatically export data from DB to CSV (overwrite old data)."""
        try:
            qs = SmartPricing.objects.all().values(
                'service_type_id',  # FK → Get ID
                'hours_peak',
                'customer_history_score',
                'price_adjustment',
                'reward',
                'accepted_status',
                'created_at'
            )
            df = pd.DataFrame(qs)

            if df.empty:
                print("⚠️ Database doesn't have SmartPricing data")
                return None

            # Create directory if not exists
            os.makedirs(os.path.dirname(self.DATA_CSV), exist_ok=True)

            # 🧹 Delete old CSV file before saving new one
            if os.path.exists(self.DATA_CSV):
                os.remove(self.DATA_CSV)
                print(f"🧹 Removed old data file: {self.DATA_CSV}")

            # 💾 Save new data
            df.to_csv(self.DATA_CSV, index=False)
            print(f"📊 Exported {len(df)} records to {self.DATA_CSV}")
            return df

        except Exception as e:
            logger.exception(f"❌ Error exporting data: {e}")
            print(f"❌ Error exporting data: {e}")
            return None

    def load_data(self):
        """Load data from CSV (exported)"""
        if not os.path.exists(self.DATA_CSV):
            print(f"⚠️ File {self.DATA_CSV} doesn't exist")
            return pd.DataFrame()
        
        df = pd.read_csv(self.DATA_CSV)
        print(f"📂 Loaded {len(df)} training samples from CSV")
        return df

    def train_model(self):
        """
        Complete process:
        1. Export latest data from DB
        2. Train Q-learning from real data
        3. Save model
        """
        # Step 1: Export fresh data
        df = self.export_data_from_db()
        if df is None or df.empty:
            print("⚠️ No data to train. Skipping this retrain.")
            return

        if len(df) < self.MIN_SAMPLES:
            print(f"⚠️ At least {self.MIN_SAMPLES} samples are required, but only {len(df)} are available. Not enough to train.")
            return

        # Step 2: Train Q-learning
        agent = QAgent(action_size=len(self.ACTIONS))

        # Load model if exists (incremental learning)
        if os.path.exists(self.MODEL_PATH):
            try:
                with open(self.MODEL_PATH, 'rb') as f:
                    old_agent = pickle.load(f)
                    agent.Q = old_agent.Q  
                    print("📥 Loaded old Q-table to continue learning")
            except Exception as e:
                print(f"⚠️ Can't load old model: {e}. Training from scratch.")

        epochs = 50
        print(f"🎓 Starting training for {epochs} epochs...")

        for epoch in range(epochs):
            df_shuffled = df.sample(frac=1).reset_index(drop=True)
            
            for i in range(len(df_shuffled) - 1):
                row = df_shuffled.iloc[i]
                next_row = df_shuffled.iloc[i + 1]

                # Create state from real data (according to SmartPricing model)
                state = (
                    int(row['service_type_id']),  # FK ID (map to 0/1 if needed)
                    int(row['hours_peak']),
                    min(int(row['customer_history_score']), 5)
                )
                
                next_state = (
                    int(next_row['service_type_id']),
                    int(next_row['hours_peak']),
                    min(int(next_row['customer_history_score']), 5)
                )

                # Find action closest to actual price_adjustment
                delta = float(row['price_adjustment'])
                action_idx = min(range(len(self.ACTIONS)), 
                               key=lambda j: abs(self.ACTIONS[j] - delta))
                
                reward = float(row['reward'])

                # Learn from real data
                agent.learn(state, action_idx, reward, next_state)
            
            if (epoch + 1) % 10 == 0:
                print(f"  ⏳ Epoch {epoch + 1}/{epochs} completed")

        # Step 3: Save new model
        os.makedirs(os.path.dirname(self.MODEL_PATH), exist_ok=True)
        with open(self.MODEL_PATH, 'wb') as f:
            pickle.dump(agent, f)

        print(f"✅ Model training completed and saved at {self.MODEL_PATH}")
        print(f"📊 Q-table size: {len(agent.Q)} states")