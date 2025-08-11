from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import logging

app = FastAPI()

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

CROWDSEC_API_URL = os.getenv("CROWDSEC_API_URL", "http://localhost:8080")
CROWDSEC_LOGIN = os.getenv("CROWDSEC_LOGIN", "backend")
CROWDSEC_PASSWORD = os.getenv("CROWDSEC_PASSWORD", "tUx6kDSVgYAKi5SyjJ193Jpiyj9BwMkAsQ4nJOjv1ideN6h9l1ecQfi1IEeQnRLN")

def get_jwt_token():
    try:
        login_resp = requests.post(
            f"{CROWDSEC_API_URL}/v1/login",
            json={"machine_id": CROWDSEC_LOGIN, "password": CROWDSEC_PASSWORD},
        )
        login_resp.raise_for_status()
        token = login_resp.json().get("token")
        if not token:
            raise Exception("No token received from login")
        return token
    except Exception as e:
        logging.error(f"Login failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to login to CrowdSec API")

@app.get("/alerts")
def get_alerts():
    try:
        token = get_jwt_token()
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{CROWDSEC_API_URL}/v1/alerts", headers=headers)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")
