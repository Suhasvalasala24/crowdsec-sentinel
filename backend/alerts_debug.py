from fastapi import FastAPI, Request
import logging, json

app = FastAPI()

@app.post("/alerts")
async def receive_alerts(request: Request):
    try:
        payload = await request.json()
        logging.error("📥 RAW CROWDSEC ALERT:\n%s", json.dumps(payload, indent=2))
        return {"status": "ok", "received": True}
    except Exception as e:
        logging.error(f"❌ Failed to read alert: {e}")
        return {"status": "error", "detail": str(e)}
