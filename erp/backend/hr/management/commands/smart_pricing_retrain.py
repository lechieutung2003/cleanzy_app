from django.core.management.base import BaseCommand
import threading
import schedule
import time
from datetime import datetime
from hr.services.smart_pricing_service import SmartPricingTrainer
import logging

logger = logging.getLogger("smart_pricing.scheduler")


def retrain_job():
    """Job retrain model Smart Pricing."""
    try:
        now = datetime.now()
        msg = f"🕒 {now} - Starting retrain Smart Pricing"
        print(msg)
        logger.info(msg)

        trainer = SmartPricingTrainer()
        trainer.train_model()

        print("✅ Completed retrain Smart Pricing")
        logger.info("✅ Completed retrain Smart Pricing")
    except Exception as e:
        print(f"❌ Error retraining Smart Pricing: {e}")
        logger.exception("❌ Error retraining Smart Pricing")


def background_scheduler():
    """Run background schedule. Default 23:59 (system time)."""
    run_at = "23:59"
    schedule.every().day.at(run_at).do(retrain_job)
    print(f"⏰ Scheduler Smart Pricing started. Daily run at {run_at}")

    # Gọi retrain ngay khi khởi chạy
    print("🚀 Running initial Smart Pricing retrain at startup...")
    retrain_job()

    # while True:
    #     schedule.run_pending()
    #     time.sleep(60)


class Command(BaseCommand):
    help = "Run Smart Pricing retrain scheduler"

    def handle(self, *args, **options):
        print("🚀 Starting Smart Pricing retrain scheduler...")
        t = threading.Thread(target=background_scheduler, daemon=True)
        t.start()

        # Giữ cho tiến trình không thoát
        t.join()
