from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "anomaly-detector is running"}

@app.post("/api/analyze")
def analyze(log: dict):
    # Placeholder logic for anomaly detection
    return {"anomaly": False, "details": "Log is clean"}
