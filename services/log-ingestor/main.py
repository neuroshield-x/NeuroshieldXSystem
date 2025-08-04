from fastapi import FastAPI
import httpx

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "log-ingestor is running"}

@app.post("/api/ingest")
async def ingest(log: dict):
    result = {}
    explanation = {}

    try:
        async with httpx.AsyncClient() as client:
            # Step 1: Send to anomaly-detector
            response = await client.post("http://anomaly-detector:8002/api/analyze", json=log)
            result = response.json()

            # Step 2: Send to alert-api to be stored (so UI can see it)
            await client.post("http://alert-api:8001/analyze", json=log)

    except Exception as e:
        return {"error": f"Failed during log forwarding: {str(e)}"}

    return {
        "message": "Log ingested and forwarded",
        "analysis_result": result
    }
