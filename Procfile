# For Docker deployment on Render
web: cd BLOG && python manage.py runserver 0.0.0.0:8000

# Alternative with Gunicorn (recommended for production)
# web: cd BLOG && gunicorn BLOG.wsgi:application --bind 0.0.0.0:8000

# For migrations (manual)
release: cd BLOG && python manage.py migrate
