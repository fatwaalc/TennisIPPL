FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python packages
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application code
COPY . .

# Create uploads and outputs directories
RUN mkdir -p backend/uploads backend/outputs

# Expose port
EXPOSE 8080

# Run the application with Gunicorn using PORT env var
CMD gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 2 --timeout 300 --chdir backend app:app
