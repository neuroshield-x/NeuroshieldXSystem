from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "alert-api is running"}

@app.post("/analyze")
def analyze(log: dict):
    # Placeholder: store log in DB (to do later)
    return {"msg": "Log received", "log": log}

@app.get("/api/logs")
def get_logs():
    # Placeholder: return fake logs
    return [{"timestamp": "2025-08-02", "message": "Test log"}]

@app.get("/api/detect")
def detect():
    # Placeholder: mock AI alert
    return {"alert": "Suspicious activity detected"}
