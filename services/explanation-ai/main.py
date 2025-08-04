from fastapi import FastAPI, Request
from pydantic import BaseModel

app = FastAPI()


# Health check endpoint
@app.get("/health/")
def health():
    return {"status": "explanation-ai is running"}


# Define a Pydantic model for strong typing (optional but recommended)
class AlertInput(BaseModel):
    timestamp: str
    message: str


# Explanation endpoint
@app.post("/api/explain/")
async def explain(alert: AlertInput):
    message = alert.message
    print(f"[EXPLAIN-AI] Explaining: {message}")
    return {
        "explanation": f"This alert is likely due to suspicious log entry: '{message}'"
    }
