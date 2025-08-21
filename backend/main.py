from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import requests
from dotenv import load_dotenv
from supabase import create_client
from routers import alerts  # import the alerts router

# Load environment variables
load_dotenv()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "*"  # allow all for dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CrowdSec LAPI config
CROWDSEC_API_URL = os.getenv("CROWDSEC_API_URL", "http://localhost:8080")
CROWDSEC_LOGIN = os.getenv("CROWDSEC_LOGIN")
CROWDSEC_PASSWORD = os.getenv("CROWDSEC_PASSWORD")

# Supabase config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("❌ Missing Supabase configuration. Check your .env file.")
    raise Exception("Supabase URL or Key not set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Include alerts router
app.include_router(alerts.router)


@app.get("/")
def root():
    return {"message": "✅ Backend running with FastAPI + Supabase + CrowdSec!"}


@app.get("/alerts/crowdsec")
def get_alerts_from_crowdsec():
    """Fetch alerts from CrowdSec LAPI and insert into Supabase"""
    try:
        # Login to CrowdSec LAPI
        login_resp = requests.post(
            f"{CROWDSEC_API_URL}/v1/watchers/login",
            json={"machine_id": CROWDSEC_LOGIN, "password": CROWDSEC_PASSWORD},
            timeout=5,
        )
        login_resp.raise_for_status()
        token = login_resp.json().get("token")
        if not token:
            raise Exception("No token received from CrowdSec API")

        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{CROWDSEC_API_URL}/v1/alerts", headers=headers, timeout=5)
        resp.raise_for_status()
        alerts_data = resp.json()

        inserted = 0
        for alert in alerts_data:
            events = alert.get("events", [])
            for event in events:
                meta_list = event.get("meta", [])
                if isinstance(meta_list, list):
                    for meta in meta_list:
                        if not isinstance(meta, dict):
                            continue
                        row = {
                            "source_ip": meta.get("source_ip", alert.get("source", {}).get("ip", "unknown")),
                            "target_user": meta.get("target_user"),
                            "event": alert.get("scenario", "unknown"),
                            "severity": meta.get("severity", "info"),
                            "timestamp": meta.get("timestamp"),
                            "message": alert.get("message"),
                        }
                        supabase.table("alerts").insert(row).execute()
                        inserted += 1

        return {"fetched": len(alerts_data), "inserted": inserted}

    except Exception as e:
        logger.error(f"❌ Error fetching alerts: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")


@app.get("/alerts")
def get_alerts_from_supabase():
    """Fetch stored alerts from Supabase"""
    try:
        response = supabase.table("alerts").select("*").order("timestamp", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"❌ Error fetching from Supabase: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch from Supabase")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
