import os
from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq

app = FastAPI()

# ---------- Health ----------
@app.get("/health")
@app.get("/health/")
def health():
    return {"status": "explanation-ai is running"}

# ---------- Request model ----------
class AlertInput(BaseModel):
    timestamp: str
    message: str

# ---------- Groq client ----------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_ID = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")  # ✅ safer default
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

SYSTEM_PROMPT = """You are a SOC analyst. Given a single log line, write:
1) A clear one-paragraph explanation in plain English of what likely happened.
2) Risk/Sensitivity (Low/Med/High).
3) Recommended next actions (bullet list).

Be concise, actionable, and avoid generic fluff. If the message is benign, say so and explain why.
"""

@app.post("/api/explain/")
async def explain(alert: AlertInput):
    if not client:
        # Fallback so the UI still shows something useful if key is missing
        return {
            "explanation": (
                f"[LOCAL FALLBACK] No GROQ_API_KEY configured. "
                f"Observed log at {alert.timestamp}: '{alert.message}'."
            ),
            "risk": "Unknown",
            "actions": [
                "Set GROQ_API_KEY for AI explanations.",
                "Rebuild the explanation-ai container."
            ],
        }

    try:
        print(f"[EXPLAIN-AI] Explaining: {alert.message}")

        completion = client.chat.completions.create(
            model=MODEL_ID,   # ✅ updated model
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Timestamp: {alert.timestamp}\nMessage: {alert.message}"}
            ],
            temperature=0.2,
            max_tokens=400,
        )

        text = completion.choices[0].message.content.strip()

        return {"explanation": text}

    except Exception as e:
        # Never bubble raw errors to frontend; include them in payload
        return {
            "explanation": (
                "The AI explanation service encountered an error while processing this log. "
                "Please check the explanation-ai container logs."
            ),
            "error": str(e),
            "model": MODEL_ID,
        }
