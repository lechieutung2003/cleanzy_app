import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def random_time_between(start_hour=8, end_hour=20):
    hour = random.randint(start_hour, end_hour)
    minute = random.choice([0, 15, 30, 45])
    return f"{hour:02d}:{minute:02d}"

def generate_cleanup_data(n=1000):
    records = []
    for i in range(n):
        service_type = random.choice(["Regular Cleaning", "Deep Cleaning"])
        area_m2 = random.choice([20, 30, 40, 50, 70, 100])
        start_time = random_time_between(8,20)
        day_of_week = random.choice(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"])
        location_zone = random.choice(["Hai Chau","Ngu Hanh Son","Lien Chieu","Thanh Khe","Cam Le", "Son Tra"])
        staff_available = random.randint(1,20)
        avg_rating = round(random.uniform(3.0,5.0),2)
        
        # BasePrice example
        if service_type=="Regular Cleaning":
            base_price = 40000
        else:
            base_price = 50000
        
        # DemandFactor example: peak hours 17-20 or weekends
        if day_of_week in ["Sat","Sun"] or int(start_time.split(":")[0])>=17:
            demand_factor = 1.2
        else:
            demand_factor = 1.0
        
        # Supply factor
        if staff_available < 5:
            supply_factor = 1.2
        else:
            supply_factor = 1.0
        
        # Quality factor
        if avg_rating >= 4.5:
            quality_factor = 1.2
        else:
            quality_factor = 1.0
        
        suggested_price = base_price * demand_factor * supply_factor * quality_factor * area_m2
        
        records.append({
            "service_type": service_type,
            "area_m2": area_m2,
            "start_time": start_time,
            "day_of_week": day_of_week,
            "location_zone": location_zone,
            "staff_available": staff_available,
            "avg_rating": avg_rating,
            "base_price": base_price,
            "suggested_price": int(suggested_price)
        })
    return pd.DataFrame(records)

df = generate_cleanup_data(1000)
print(df.head())
df.to_csv("cleanup_service_data.csv", index=False)
