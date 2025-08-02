from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "log-ingestor is running"}

@app.post("/api/ingest")
def ingest(log: dict):
    # Placeholder for future Kafka or DB integration
    return {"message": "Log ingested successfully", "log": log}
