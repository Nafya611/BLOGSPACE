FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install gunicorn for production
RUN pip install gunicorn

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p /app/media /app/BLOG/staticfiles

# Set Django project directory as working directory
WORKDIR /app/BLOG

# Collect static files
RUN python manage.py collectstatic --noinput

# Create a startup script
RUN echo '#!/bin/bash\ncd /app/BLOG\npython manage.py migrate --noinput\npython manage.py collectstatic --noinput\nexec gunicorn BLOG.wsgi:application --bind 0.0.0.0:$PORT' > /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health/ || exit 1

# Start application
CMD ["/app/start.sh"]
