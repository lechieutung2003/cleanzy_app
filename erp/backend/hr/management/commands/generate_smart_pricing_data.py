from django.core.management.base import BaseCommand
import pandas as pd
from hr.models.smartpricing import Smart_Pricing
from hr.models.customer import ServiceType
from django.db import transaction

class Command(BaseCommand):
    help = "Sinh dữ liệu mô phỏng và lưu vào SmartPricing"

    def handle(self, *args, **options):
        df = pd.read_csv("./utils/pricing_simulation_data.csv")

        service_type_map = {
            0: ServiceType.objects.get_or_create(
                name="Regular Cleaning",
                defaults={
                    "price_per_m2": 40000,
                    "cleaning_rate_m2_per_h": 40,
                }
            )[0],
            1: ServiceType.objects.get_or_create(
                name="Deep Cleaning",
                defaults={
                    "price_per_m2": 50000,
                    "cleaning_rate_m2_per_h": 30,
                }
            )[0],
        }

        with transaction.atomic():
            objs = [
                Smart_Pricing(
                    service_type_id=row["service_type"],
                    hours_peak=row["hour_peak"],
                    customer_history_score=row["customer_history"],
                    area_m2=row["area"],
                    base_rate=row["base_rate"],
                    proposed_price=row["proposed_price"],
                    price_adjustment=row["price_adjustment"],
                    accepted_status=row["acceptance"],
                    reward=row["reward"],
                )
                for _, row in df.iterrows()
            ]
            Smart_Pricing.objects.bulk_create(objs, batch_size=500)

        self.stdout.write(self.style.SUCCESS("✅ Đã tạo dữ liệu SmartPricing mô phỏng thành công!"))
