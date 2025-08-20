import requests
import os

CROWDSEC_API_URL = os.getenv("CROWDSEC_API_URL")
CROWDSEC_LOGIN = os.getenv("CROWDSEC_LOGIN")
CROWDSEC_PASSWORD = os.getenv("CROWDSEC_PASSWORD")

def get_lapi_token():
    """Authenticate to CrowdSec LAPI and return a session with token cookie."""
    session = requests.Session()
    login_payload = {"login": CROWDSEC_LOGIN, "password": CROWDSEC_PASSWORD}
    resp = session.post(f"{CROWDSEC_API_URL}/v1/login", json=login_payload)
    
    if resp.status_code != 200:
        raise Exception(f"Login failed: {resp.status_code} {resp.text}")
    
    return session

def fetch_alerts():
    """Fetch alerts from CrowdSec LAPI."""
    session = get_lapi_token()
    resp = session.get(f"{CROWDSEC_API_URL}/v1/alerts", cookies=session.cookies)
    
    if resp.status_code != 200:
        raise Exception(f"Error fetching alerts: {resp.status_code} {resp.text}")
    
    return resp.json()