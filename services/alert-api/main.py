from fastapi import FastAPI
import httpx

app = FastAPI()

# In-memory alert log (for PoC only — replace with DB/Kafka later)
alerts = [
    {
        "timestamp": "2025-08-04T12:00:00Z",
        "message": "error: CPU overload"
    },
    {
        "timestamp": "2025-08-04T12:05:00Z",
        "message": "warning: login delay"
    },
    {
        "timestamp": "2025-08-04T12:10:00Z",
        "message": "info: scheduled scan complete"
    }
]


@app.get("/health")
def health():
    return {"status": "alert-api is running"}

@app.post("/analyze")
async def analyze(log: dict):
    alerts.append(log)  # Store alert in memory

    # Get explanation from explanation-ai service
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post("http://explanation-ai:8003/api/explain", json=log)
            explanation = response.json()
    except Exception as e:
        explanation = {"error": f"Failed to fetch explanation: {str(e)}"}

    return {
        "msg": "Alert received",
        "alert": log,
        "explanation": explanation
    }

@app.get("/api/logs")
def get_logs():
    return alerts

@app.get("/api/detect")
def detect():
    if alerts:
        return {"alert": alerts[-1]}
    return {"alert": "No alerts yet"}
