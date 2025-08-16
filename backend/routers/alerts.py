from fastapi import APIRouter, HTTPException
import os
import requests
import logging

router = APIRouter()

# Config
LAPI_URL = "http://localhost:8080"
CROWDSEC_LOGIN = os.getenv("CROWDSEC_LOGIN", "backend")
CROWDSEC_PASSWORD = os.getenv("CROWDSEC_PASSWORD", "tUx6kDSVgYAKi5SyjJ193Jpiyj9BwMkAsQ4nJOjv1ideN6h9l1ecQfi1IEeQnRLN")


def get_lapi_session():
    """Authenticate to CrowdSec LAPI and return a requests.Session with JWT cookie."""
    session = requests.Session()
    login_payload = {
        "login": CROWDSEC_LOGIN,
        "password": CROWDSEC_PASSWORD
    }
    try:
        resp = session.post(f"{LAPI_URL}/v1/login", json=login_payload)
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        logging.error(f"LAPI login failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to login to CrowdSec LAPI")
    return session


@router.get("/alerts")
def get_alerts():
    """Fetch alerts from CrowdSec LAPI."""
    session = get_lapi_session()
    try:
        resp = session.get(f"{LAPI_URL}/v1/alerts")
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")
