"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""


import os
import logging
import threading
import schedule
import time
import sys
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
application = get_wsgi_application()

logger = logging.getLogger("smart_pricing.scheduler")


def retrain_job():
    """Job retrain model Smart Pricing."""
    try:
        from datetime import datetime
        from hr.services.smart_pricing_service import SmartPricingTrainer

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
    run_at = os.environ.get("SMART_PRICING_RETRAIN_AT", "23:59")  # HH:MM
    schedule.every().day.at(run_at).do(retrain_job)
    logger.info("⏰ Scheduler Smart Pricing started. Daily run at %s", run_at)

    # 🔥 Gọi retrain ngay khi server khởi động
    print("🚀 Running initial Smart Pricing retrain at startup...")
    retrain_job()

    # Sau đó tiếp tục vòng lặp kiểm tra schedule như cũ
    while True:
        print("🌀 Checking schedule pending jobs...")
        schedule.run_pending()
        time.sleep(60)


def _is_management_context() -> bool:
    if os.environ.get("DJANGO_MANAGEMENT_COMMAND") == "1":
        return True

    argv = [a.lower() for a in sys.argv]
    if any("pytest" in a or "py.test" in a for a in argv):
        return True

    mgmt_markers = ("manage.py", "django-admin")
    is_manage_invocation = any(any(m in a for m in mgmt_markers) for a in argv)
    mgmt_commands = {
        "migrate", "makemigrations", "shell", "collectstatic", "createsuperuser",
        "loaddata", "dumpdata", "changepassword", "dbshell", "check", "test",
    }
    if is_manage_invocation and any(cmd in argv for cmd in mgmt_commands):
        return True

    return False


def _should_start_scheduler() -> bool:
    if _is_management_context():
        print("⏭️ Skipping scheduler because running in management/test context")
        return False

    if os.environ.get("CLEANZY_SCHEDULER_ENABLED", "0") != "1":
        print("⚠️ Scheduler not started: CLEANZY_SCHEDULER_ENABLED != 1")
        return False

    run_main = os.environ.get("RUN_MAIN")
    if run_main is None:
        print("🏁 Scheduler running in production context (RUN_MAIN not set)")
        return True
    print(f"RUN_MAIN={run_main}")
    return run_main == "true"


# Start background scheduler if conditions are met
if _should_start_scheduler():
    print("🚀 Starting Smart Pricing background scheduler thread...")
    threading.Thread(
        target=background_scheduler,
        name="smart-pricing-scheduler",
        daemon=True,
    ).start()
else:
    print("⏸️ Scheduler not started (conditions not met)")
