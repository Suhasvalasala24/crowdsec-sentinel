from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import logging

app = FastAPI()

# Allow frontend origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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
CROWDSEC_PASSWORD = os.getenv(
    "CROWDSEC_PASSWORD",
    "d2QMXGwT2DnI8zrTuhssoPEEOj7uvWUcN0WVkOiCTaepWRx81I6FNmy72wckDWi2"
)

def get_jwt_token():
    try:
        # Use /v1/watchers/login for machine authentication
        login_resp = requests.post(
            f"{CROWDSEC_API_URL}/v1/watchers/login",
            json={"machine_id": CROWDSEC_LOGIN, "password": CROWDSEC_PASSWORD},
            timeout=5
        )
        login_resp.raise_for_status()
        token = login_resp.json().get("token")
        if not token:
            raise Exception("No token received from CrowdSec API")
        return token
    except Exception as e:
        logging.error(f"Login failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to login to CrowdSec API")

@app.get("/alerts")
def get_alerts():
    try:
        token = get_jwt_token()
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{CROWDSEC_API_URL}/v1/alerts", headers=headers, timeout=5)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")