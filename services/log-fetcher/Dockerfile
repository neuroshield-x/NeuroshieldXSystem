FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY mock_fetcher.py /app/

RUN pip install --no-cache-dir requests

CMD ["python", "mock_fetcher.py"]
