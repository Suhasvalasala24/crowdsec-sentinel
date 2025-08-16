import requests

LAPI_URL = "http://127.0.0.1:8080"
LOGIN = "backend"
PASSWORD = "d2QMXGwT2DnI8zrTuhssoPEEOj7uvWUcN0WVkOiCTaepWRx81I6FNmy72wckDWi2"

def get_lapi_token():
    """Authenticate to CrowdSec LAPI and return a session with token cookie."""
    session = requests.Session()
    login_payload = {"login": LOGIN, "password": PASSWORD}
    resp = session.post(f"{LAPI_URL}/v1/login", json=login_payload)
    
    if resp.status_code != 200:
        raise Exception(f"Login failed: {resp.status_code} {resp.text}")
    
    return session

def fetch_alerts():
    """Fetch alerts from CrowdSec LAPI."""
    session = get_lapi_token()
    resp = session.get(f"{LAPI_URL}/v1/alerts")
    
    if resp.status_code != 200:
        raise Exception(f"Error fetching alerts: {resp.status_code} {resp.text}")
    
    return resp.json()
