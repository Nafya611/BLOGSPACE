FROM python:3.11-alpine3.21

# Prevent .pyc files and enable stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/venv/bin:$PATH"

# Create working directory
WORKDIR /app

# Install dependencies
RUN apk update && \
    apk add --no-cache \
    postgresql-client \
    libpq \
    libpq-dev \
    gcc \
    musl-dev \
    python3-dev \
    build-base \
    && python -m venv /venv && \
    /venv/bin/pip install --upgrade pip

# Copy requirements and install them
COPY ./requirements.txt /tmp/requirements.txt
RUN /venv/bin/pip install -r /tmp/requirements.txt

# Copy your app source code
COPY ./BLOG /app

# Cleanup build dependencies to keep image small
RUN apk del build-base gcc musl-dev python3-dev libpq-dev

# Add user
RUN adduser --disabled-password --no-create-home django-user

# Use the created non-root user
USER django-user

# Expose the app port
EXPOSE 8000
