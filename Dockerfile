FROM python:3.11-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/venv/bin:$PATH"
ENV RENDER=true

# Create working directory
WORKDIR /app

# Install system dependencies
RUN apk update && \
    apk add --no-cache \
    postgresql-client \
    postgresql-dev \
    gcc \
    musl-dev \
    linux-headers \
    curl \
    && python -m venv /venv

# Upgrade pip
RUN /venv/bin/pip install --upgrade pip

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN /venv/bin/pip install -r requirements.txt

# Copy project files
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p /app/media /app/BLOG/staticfiles && \
    chmod +x start.sh

# Add non-root user
RUN adduser --disabled-password --no-create-home django-user && \
    chown -R django-user:django-user /app

# Switch to non-root user
USER django-user

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health/ || exit 1

# Start application
CMD ["./start.sh"]
