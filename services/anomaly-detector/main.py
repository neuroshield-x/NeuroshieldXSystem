from fastapi import FastAPI
import httpx

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "anomaly-detector is running"}

@app.post("/api/analyze")
async def analyze(log: dict):
    # Dummy anomaly detection
    is_anomaly = "error" in log.get("message", "").lower()

    if is_anomaly:
        alert = {
            "timestamp": log.get("timestamp"),
            "message": log.get("message"),
            "type": "Anomaly",
        }

        # Send alert to alert-api
        try:
            async with httpx.AsyncClient() as client:
                await client.post("http://alert-api:8001/analyze", json=alert)
        except Exception as e:
            return {"anomaly": True, "error": f"Failed to report alert: {str(e)}"}

    return {
        "anomaly": is_anomaly,
        "details": "Anomaly detected" if is_anomaly else "Log is clean"
    }
