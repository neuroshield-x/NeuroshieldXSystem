FROM python:3.10-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk update && apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    build-base \
    postgresql-dev \
    linux-headers \
    libxml2-dev \
    libxslt-dev \
    jpeg-dev \
    zlib-dev \
    libjpeg \
    libjpeg-turbo-dev \
    bash \
    curl

# Install pip packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY . .

# Start FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
