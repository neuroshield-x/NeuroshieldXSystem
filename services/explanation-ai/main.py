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

# ---------- Groq client & models ----------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PREFERRED_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
FALLBACK_MODEL = os.getenv("GROQ_FALLBACK_MODEL", "llama-3.1-8b-instant")

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

SYSTEM_PROMPT = """You are a SOC analyst. Given a single log line, write:
1) A clear one-paragraph explanation in plain English of what likely happened.
2) Risk/Sensitivity (Low/Med/High).
3) Recommended next actions (bullet list).

Be concise, actionable, and avoid generic fluff. If the message is benign, say so and explain why.
"""

def call_groq(model_id: str, content: str):
    return client.chat.completions.create(
        model=model_id,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": content},
        ],
        temperature=0.2,
        max_tokens=300,   # reduced to save quota
    )

@app.post("/api/explain/")
async def explain(alert: AlertInput):
    if not client:
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

    content = f"Timestamp: {alert.timestamp}\nMessage: {alert.message}"
    try:
        print(f"[EXPLAIN-AI] Explaining with {PREFERRED_MODEL}: {alert.message}")
        resp = call_groq(PREFERRED_MODEL, content)
        text = resp.choices[0].message.content.strip()
        return {"explanation": text, "model_used": PREFERRED_MODEL}

    except Exception as e:
        msg = str(e)
        print(f"[EXPLAIN-AI][ERROR] {msg}", flush=True)

        # If rate limited, try fallback
        if "rate_limit" in msg or "429" in msg:
            try:
                print(f"[EXPLAIN-AI] Falling back to {FALLBACK_MODEL}")
                resp = call_groq(FALLBACK_MODEL, content)
                text = resp.choices[0].message.content.strip()
                return {"explanation": text, "model_used": FALLBACK_MODEL}
            except Exception as e2:
                print(f"[EXPLAIN-AI][ERROR fallback] {e2}", flush=True)

        return {
            "explanation": (
                "AI explanation temporarily unavailable (provider error or rate limit)."
            ),
            "error": msg,
            "model": PREFERRED_MODEL,
        }
