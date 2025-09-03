from fastapi import FastAPI
from pydantic import BaseModel
from kafka import KafkaProducer
import json
import os
import time
import threading
from datetime import datetime
from collections import deque

app = FastAPI()

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = "logs-topic"

# ✅ buffer to store recent logs for dashboard
BUFFER = deque(maxlen=500)

# ✅ Input model
class LogInput(BaseModel):
    timestamp: str
    message: str

# ✅ Kafka connection with retry logic
def connect_to_kafka():
    max_retries = 10
    for attempt in range(max_retries):
        try:
            producer = KafkaProducer(
                bootstrap_servers=KAFKA_BROKER,
                value_serializer=lambda v: json.dumps(v).encode("utf-8")
            )
            print("✅ Connected to Kafka broker")
            return producer
        except Exception as e:
            print(f"❌ Kafka connection failed (attempt {attempt + 1}/{max_retries}): {e}")
            time.sleep(5)
    print("🚨 Failed to connect to Kafka after retries.")
    return None

producer = connect_to_kafka()

# ✅ Health check
@app.get("/api/ingest/health")
def health():
    return {"status": "log-ingestor is running"}

# ✅ POST endpoint for manual log ingestion
@app.post("/api/ingest/")
async def ingest(log: LogInput):
    if not producer:
        return {"error": "Kafka producer not initialized"}
    try:
        log_data = log.dict()
        producer.send(KAFKA_TOPIC, log_data)
        producer.flush()
        BUFFER.append(log_data)  # keep it for /api/logs
        print(f"[📤] Sent log to Kafka: {log_data}")
        return {"status": "Log sent to Kafka"}
    except Exception as e:
        print(f"❌ Failed to send to Kafka: {str(e)}")
        return {"error": f"Failed to send to Kafka: {str(e)}"}

# ✅ Auto-generate logs for testing
def auto_log_generator():
    messages = [
        "severity=LOW User login successful",
        "severity=MEDIUM Disk usage at 85%",
        "severity=HIGH 🔥 error: CPU overload detected",
        "severity=MEDIUM Firewall blocked IP 192.168.0.1",
        "severity=HIGH 🚨 Unauthorized access error in firewall logs"
    ]

    while True:
        time.sleep(10)
        if producer:
            log_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "message": messages[int(time.time()) % len(messages)]
            }
            producer.send(KAFKA_TOPIC, log_data)
            producer.flush()
            BUFFER.append(log_data)  # also store auto logs
            print(f"[🧪AUTO] Sent log to Kafka: {log_data}")

# ✅ Serve buffered logs for dashboard
@app.get("/api/logs")
def get_logs():
    return list(BUFFER)

@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=auto_log_generator, daemon=True)
    thread.start()
