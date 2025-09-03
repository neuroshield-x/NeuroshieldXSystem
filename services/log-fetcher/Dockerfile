# services/log-fetcher/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install deps
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the (renamed) entrypoint
COPY main.py /app/

# Helpful for logs
ENV PYTHONUNBUFFERED=1

# Run the generator (no web server needed)
CMD ["python", "-u", "main.py"]
