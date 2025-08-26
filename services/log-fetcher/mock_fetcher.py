import os
import time
import json
import random
import requests
from datetime import datetime

INGEST_URL = os.getenv("INGEST_URL", "http://log-ingestor:8004/api/ingest/")
FETCH_INTERVAL = int(os.getenv("FETCH_INTERVAL", "5"))

MESSAGES = [
    "User login successful",
    "Disk usage at 75%",
    "🔥 error: CPU overload detected",
    "Unauthorized access error in firewall logs",
    "Memory usage stable at 60%",
    "error: database connection timeout",
    "New admin user created",
    "Firewall blocked suspicious IP 192.168.1.50"
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
    while True:
        msg = random.choice(MESSAGES)
        payload = {
            "timestamp": now_iso(),
            "message": msg
        }
        send_to_log_ingestor(payload)
        time.sleep(FETCH_INTERVAL)

if __name__ == "__main__":
    loop()
