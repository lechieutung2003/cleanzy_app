from django.core.management.base import BaseCommand
from hr.services.smart_pricing_service import SmartPricingTrainer


class Command(BaseCommand):
    help = 'Train Smart Pricing Q-Learning model với reward function mới'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting Smart Pricing Model Training...'))
        
        trainer = SmartPricingTrainer()
        trainer.train_model()
        
        self.stdout.write(self.style.SUCCESS('✅ Training completed!'))
