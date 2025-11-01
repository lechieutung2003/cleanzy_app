from django.db import models
from base.models import TimeStampedModel
from .customer import Customer, ServiceType
from businesses.models.employee import Employee
from hr.models.skill import Skill


class SmartPricing(TimeStampedModel):
    service_type = models.ForeignKey(ServiceType, on_delete=models.CASCADE,default=1)
    hours_peak = models.BooleanField(default=False)  
    customer_history_score = models.PositiveIntegerField(default=0)  
    area_m2 = models.DecimalField(default=0,max_digits=7, decimal_places=2)
    base_rate = models.DecimalField(default=0,max_digits=20, decimal_places=2)  
    proposed_price = models.DecimalField(default=0,max_digits=12, decimal_places=2) 
    price_adjustment = models.DecimalField(default=0,max_digits=5, decimal_places=2)  
    accepted_status = models.BooleanField(default=False)  
    reward = models.DecimalField(default=0,max_digits=10, decimal_places=2)  

    class Meta:
        db_table = "hr_smart_pricing"

    def __str__(self):
        return f"SmartPricing({self.service_type}, {self.proposed_price} VND)"
