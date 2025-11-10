# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    WS_PORT=8765 \
    HTTP_PORT=8080 \
    STATIC_DIR=/app/www

WORKDIR /app

# Install build deps (remove later if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

EXPOSE 8080 8765

# Entrypoint runs combined HTTP + WS server
ENTRYPOINT ["python", "serve.py"]
