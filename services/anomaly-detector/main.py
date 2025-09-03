# services/anomaly-detector/main.py

from fastapi import FastAPI
import threading
from kafka import KafkaConsumer
import json
import httpx
import os
import asyncio
import time

app = FastAPI()

KAFKA_TOPIC = "logs-topic"
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")

# Anomaly detection logic
async def handle_log(log: dict):
    is_anomaly = "error" in log.get("message", "").lower()

    if is_anomaly:
        alert = {
            "timestamp": log.get("timestamp"),
            "message": log.get("message"),
            "type": "Anomaly"
        }
        try:
            async with httpx.AsyncClient() as client:
                await client.post("http://alert-api:8001/api/analyze/", json=alert)  # ✅ FIXED
            print(f"[✓] Sent alert to alert-api: {alert['message']}")
        except Exception as e:
            print(f"[✗] Failed to send alert: {e}")
    else:
        print(f"[i] Log not flagged as anomaly: {log['message']}")

#  Kafka consumer on a separate thread
def start_kafka_consumer():
    print("🔄 Starting Kafka consumer for anomaly detection...")
    retries = 0
    consumer = None

    while retries < 10:
        try:
            consumer = KafkaConsumer(
                KAFKA_TOPIC,
                bootstrap_servers=KAFKA_BROKER,
                auto_offset_reset="earliest",
                enable_auto_commit=True,
                group_id="anomaly-detector-group",
                value_deserializer=lambda m: json.loads(m.decode("utf-8"))
            )
            print("✅ Connected to Kafka broker")
            break
        except Exception as e:
            print(f"❌ Kafka connection failed (attempt {retries + 1}/10): {e}")
            retries += 1
            time.sleep(5)

    if not consumer:
        print("🚨 Failed to connect to Kafka after retries. Exiting thread.")
        return

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    for message in consumer:
        log = message.value
        print(f"[📥] Received log: {log}")
        loop.run_until_complete(handle_log(log))

#  Run Kafka consumer on startup
@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=start_kafka_consumer, daemon=True)
    thread.start()

#  Health check
@app.get("/health")
def health():
    return {"status": "anomaly-detector is running"}

#  Manual log analyzer for testing
@app.post("/api/analyze/")
async def analyze(log: dict):
    await handle_log(log)
    return {
        "anomaly": "error" in log.get("message", "").lower(),
        "source": "manual POST /api/analyze"
    }
