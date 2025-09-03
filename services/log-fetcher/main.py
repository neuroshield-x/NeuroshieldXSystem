import os
import time
import json
import random
import requests
from datetime import datetime

INGEST_URL = os.getenv("INGEST_URL", "http://log-ingestor:8004/api/ingest/")
FETCH_INTERVAL = int(os.getenv("FETCH_INTERVAL", "5"))

# services/log-fetcher/mock_fetcher.py

MESSAGES = [
    "severity=LOW User login successful",
    "severity=LOW New admin user created",
    "severity=LOW Memory usage stable at 60%",
    "severity=MEDIUM Disk usage at 85%",
    "severity=MEDIUM Firewall blocked suspicious IP 192.168.1.50",
    "severity=MEDIUM Unauthorized access attempt in firewall logs",
    "severity=HIGH 🔥 error: CPU overload detected",
    "severity=HIGH error: database connection timeout"
]


def now_iso() -> str:
    return datetime.utcnow().isoformat()

def send_to_log_ingestor(payload: dict):
    try:
        res = requests.post(INGEST_URL, json=payload, timeout=10)
        print(f"📤 Sent log → {res.status_code}: {payload['message']}")
    except Exception as e:
        print(f"❌ Send error: {e}")

def loop():
    print(f"▶️ mock-fetcher starting | INGEST_URL={INGEST_URL} | INTERVAL={FETCH_INTERVAL}s")
    i = 0
    while True:
        msg = MESSAGES[i % len(MESSAGES)]
        i += 1
        payload = {"timestamp": now_iso(), "message": msg}
        send_to_log_ingestor(payload)
        time.sleep(FETCH_INTERVAL)


if __name__ == "__main__":
    loop()
