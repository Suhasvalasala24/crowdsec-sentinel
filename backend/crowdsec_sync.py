import os
import requests
import logging
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Config
CROWDSEC_API_URL = os.getenv("CROWDSEC_API_URL", "http://localhost:8080")
CROWDSEC_LOGIN = os.getenv("CROWDSEC_LOGIN", "backend")
CROWDSEC_PASSWORD = os.getenv("CROWDSEC_PASSWORD")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_jwt_token():
    """Authenticate with CrowdSec and get JWT token"""
    resp = requests.post(
        f"{CROWDSEC_API_URL}/v1/watchers/login",
        json={"machine_id": CROWDSEC_LOGIN, "password": CROWDSEC_PASSWORD},
        timeout=5,
    )
    resp.raise_for_status()
    return resp.json().get("token")


def sync_alerts():
    """Fetch alerts from CrowdSec and insert into Supabase"""
    try:
        token = get_jwt_token()
        headers = {"Authorization": f"Bearer {token}"}

        resp = requests.get(f"{CROWDSEC_API_URL}/v1/alerts", headers=headers, timeout=5)
        resp.raise_for_status()
        alerts = resp.json()

        inserted = 0
        for alert in alerts:
            data = {
                "source_ip": alert.get("source", {}).get("ip", "unknown"),
                "event": alert.get("scenario", "unknown"),
                "severity": alert.get("events", [{}])[0]
                .get("meta", {})
                .get("severity", "info"),
                "timestamp": alert.get("created_at"),
            }
            supabase.table("alerts").insert(data).execute()
            inserted += 1

        print(f"✅ Synced {inserted} alerts from CrowdSec → Supabase")
    except Exception as e:
        logging.error(f"❌ Sync failed: {e}")


if __name__ == "__main__":
    sync_alerts()
