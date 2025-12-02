from django.db import migrations, models

class Migration(migrations.Migration):
    # sửa dependency về migration tồn tại (ví dụ '0001_initial')
    dependencies = [
        ('hr', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='img',
            field=models.CharField(max_length=255, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='history_order_score',
            field=models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True),
        ),
    ]