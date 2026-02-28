# ── Backend Dockerfile ──────────────────────────────────────────────
# Python 3.11 slim keeps the image small
FROM python:3.11-slim

# Prevent .pyc files and enable unbuffered stdout (better logs)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (layer-cached unless requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Create a directory for the SQLite database volume mount
RUN mkdir -p /app/data

# Expose FastAPI port
EXPOSE 8000

# Start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
