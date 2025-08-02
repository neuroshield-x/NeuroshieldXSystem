from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "explanation-ai is running"}

@app.post("/api/explain")
def explain(alert: dict):
    # Placeholder explanation logic
    return {"explanation": "This is a mock explanation for the alert."}
