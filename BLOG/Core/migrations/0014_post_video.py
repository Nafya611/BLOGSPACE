# Generated by Django 5.2.4 on 2025-07-20 13:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Core', '0013_user_profile_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='video',
            field=models.URLField(blank=True, max_length=500, null=True),
        ),
    ]
