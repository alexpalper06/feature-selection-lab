# Backend Dockerfile - FastAPI with scikit-learn
FROM python:3.11-slim

# Non-root user for security
RUN addgroup --system appuser && adduser --system --ingroup appuser appuser
# Create non-root user
#RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install system dependencies required for scikit-learn, psycopg2, and other packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*


# Copy requirements and install Python dependencies
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Fix permissions
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port for FastAPI
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1

# Run FastAPI with uvicorn
#CMD ["fastapi", "run",  "app/main.py", "--host", "0.0.0.0", "--port", "8000" "--workers", "4"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
