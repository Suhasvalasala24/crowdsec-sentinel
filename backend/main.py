from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import logging
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Allow frontend origins (adjust if deployed online)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://your-frontend-url.repl.co",  # ✅ Add your deployed frontend URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CrowdSec LAPI configuration
CROWDSEC_API_URL = os.getenv("CROWDSEC_API_URL", "http://localhost:8080")
CROWDSEC_LOGIN = os.getenv("CROWDSEC_LOGIN", "backend")
CROWDSEC_PASSWORD = os.getenv("CROWDSEC_PASSWORD",
                              "your_machine_password_here")

# Supabase config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error(
        "❌ Missing Supabase configuration. Check your .env file or Replit Secrets."
    )
    raise Exception("Supabase URL or Key not set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_jwt_token():
    """Login to CrowdSec LAPI and return a JWT token"""
    try:
        login_resp = requests.post(
            f"{CROWDSEC_API_URL}/v1/watchers/login",
            json={
                "machine_id": CROWDSEC_LOGIN,
                "password": CROWDSEC_PASSWORD
            },
            timeout=5,
        )
        login_resp.raise_for_status()
        token = login_resp.json().get("token")
        if not token:
            raise Exception("No token received from CrowdSec API")
        return token
    except Exception as e:
        logging.error(f"❌ CrowdSec login failed: {e}")
        raise HTTPException(status_code=500,
                            detail="Failed to login to CrowdSec API")


@app.get("/")
def root():
    return {"message": "✅ Backend running with FastAPI + Supabase + CrowdSec!"}


@app.get("/alerts/crowdsec")
def get_alerts_from_crowdsec():
    """Fetch alerts from CrowdSec and save them to Supabase"""
    try:
        token = get_jwt_token()
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{CROWDSEC_API_URL}/v1/alerts",
                            headers=headers,
                            timeout=5)
        resp.raise_for_status()
        alerts = resp.json()

        # Save alerts into Supabase
        for alert in alerts:
            data = {
                "source_ip": alert.get("source", {}).get("ip", "unknown"),
                "event": alert.get("scenario", "unknown"),
                "severity": alert.get("scenario", "low"),  # fallback
            }
            supabase.table("alerts").insert(data).execute()

        return {"fetched": len(alerts), "alerts": alerts}
    except requests.exceptions.RequestException as e:
        logging.error(f"❌ Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")


@app.get("/alerts")
def get_alerts_from_supabase():
    """Fetch stored alerts from Supabase"""
    try:
        response = supabase.table("alerts").select("*").order(
            "timestamp", desc=True).execute()
        return response.data
    except Exception as e:
        logging.error(f"❌ Error fetching from Supabase: {e}")
        raise HTTPException(status_code=500,
                            detail="Failed to fetch from Supabase")
