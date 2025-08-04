from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import httpx
from datetime import datetime
import os
import time

# === DATABASE SETUP ===
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:neuro@db:5432/alerts_db")
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime)
    message = Column(String)

# === WAIT FOR DB READY ===
for attempt in range(10):
    try:
        print(f"🔁 Attempt {attempt + 1}: Connecting to the database...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database connection successful. Tables created.")
        break
    except OperationalError as e:
        print(f"❌ Database not ready yet: {e}")
        time.sleep(3)
else:
    print("🚨 Could not connect to database after 10 attempts. Exiting.")
    exit(1)

# === FASTAPI ===
app = FastAPI()

class AlertInput(BaseModel):
    timestamp: str
    message: str

@app.get("/health/")
def health():
    return {"status": "alert-api is running"}

@app.post("/api/analyze/")
async def analyze(alert_input: AlertInput):
    print(f"[ALERT-API] Received alert: {alert_input.dict()}")
    db = SessionLocal()
    try:
        try:
            alert = Alert(
                timestamp=datetime.fromisoformat(alert_input.timestamp),
                message=alert_input.message
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            print(f"[DB] Stored alert ID {alert.id}")
        except Exception as e:
            print(f"❌ Failed to store alert in DB: {e}")
            return {"error": f"DB write failed: {e}"}

        # Call Explanation AI
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://explanation-ai:8003/api/explain/",
                    json=alert_input.dict()
                )
                explanation = response.json()
                print(f"[EXPLAIN] Received explanation: {explanation}")
        except Exception as e:
            explanation = {"error": f"Failed to fetch explanation: {str(e)}"}
            print(f"❌ Explanation service failed: {e}")

        return {
            "msg": "Alert stored",
            "alert": alert_input.dict(),
            "explanation": explanation
        }
    finally:
        db.close()

@app.get("/api/logs/")
def get_logs():
    db = SessionLocal()
    try:
        alerts = db.query(Alert).order_by(Alert.timestamp.desc()).all()
        print(f"[LOGS] Returning {len(alerts)} alerts from DB")
        return [
            {
                "timestamp": alert.timestamp.isoformat(),
                "message": alert.message
            }
            for alert in alerts
        ]
    finally:
        db.close()

@app.get("/api/detect/")
def detect():
    db = SessionLocal()
    try:
        alert = db.query(Alert).order_by(Alert.timestamp.desc()).first()
        if alert:
            return {"alert": {
                "timestamp": alert.timestamp.isoformat(),
                "message": alert.message
            }}
        return {"alert": "No alerts yet"}
    finally:
        db.close()
