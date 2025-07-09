FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Copy and set permissions for startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create necessary directories
RUN mkdir -p /app/media /app/BLOG/staticfiles

# Set environment variable for Django settings
ENV DJANGO_SETTINGS_MODULE=BLOG.settings

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health/ || exit 1

# Start application
CMD ["/app/start.sh"]
