from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "explanation-ai is running"}

@app.post("/api/explain")
def explain(alert: dict):
    message = alert.get("message", "")
    return {
        "explanation": f"This alert is likely due to suspicious log entry: '{message}'"
    }
