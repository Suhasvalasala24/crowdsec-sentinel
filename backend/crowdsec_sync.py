import os
import time
from datetime import datetime
from supabase import create_client
import requests
from dotenv import load_dotenv
import logging
import uuid

# -------------------------------
# Load environment variables
# -------------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
CROWDSEC_API_URL = os.getenv("CROWDSEC_API_URL", "http://127.0.0.1:8080")
CROWDSEC_LOGIN = os.getenv("CROWDSEC_LOGIN")
CROWDSEC_PASSWORD = os.getenv("CROWDSEC_PASSWORD")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase credentials missing in .env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# -------------------------------
# Logging
# -------------------------------
if not os.path.exists("logs"):
    os.makedirs("logs")

logging.basicConfig(
    filename='logs/backend.log',
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
)
logger = logging.getLogger("crowdsec-sync")

# -------------------------------
# CrowdSec functions
# -------------------------------
def get_lapi_token():
    """Login to CrowdSec LAPI and get JWT token"""
    try:
        resp = requests.post(
            f"{CROWDSEC_API_URL}/v1/watchers/login",
            json={"machine_id": CROWDSEC_LOGIN, "password": CROWDSEC_PASSWORD},
            timeout=5
        )
        resp.raise_for_status()
        token = resp.json().get("token")
        logger.info("✅ Authenticated with CrowdSec LAPI")
        return token
    except Exception as e:
        logger.error(f"❌ Failed to login to LAPI: {e}")
        return None

def fetch_alerts(token):
    """Fetch alerts from CrowdSec LAPI"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{CROWDSEC_API_URL}/v1/alerts", headers=headers, timeout=5)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"❌ Failed to fetch alerts: {e}")
        return []

# -------------------------------
# Supabase push
# -------------------------------
def push_to_supabase(alerts):
    """Push new alerts to Supabase safely"""
    for alert in alerts:
        # Generate a safe UUID
        raw_id = alert.get("uuid") or alert.get("id") or str(alert.get("created_at"))
        try:
            alert_id = str(uuid.UUID(str(raw_id)))
        except (ValueError, TypeError):
            alert_id = str(uuid.uuid4())

        # Event
        event = alert.get("scenario") or alert.get("event") or "unknown"

        # Source IP
        source = alert.get("source")
        source_ip = source.get("ip") if isinstance(source, dict) else "unknown"

        # Severity
        severity = "info"
        meta = alert.get("meta")
        if isinstance(meta, dict):
            severity = meta.get("severity") or "info"
        elif isinstance(meta, list):
            for item in meta:
                if isinstance(item, dict) and "severity" in item:
                    severity = item.get("severity") or "info"
                    break

        # Timestamp
        timestamp = alert.get("created_at") or datetime.utcnow().isoformat() + "Z"

        # Skip if exists
        try:
            existing = supabase.table("alerts").select("*").eq("id", alert_id).execute()
            if existing.data:
                continue
        except Exception as e:
            logger.warning(f"⚠ Failed to check existing alert {alert_id}: {e}")

        # Insert
        row = {
            "id": alert_id,
            "event": event,
            "source_ip": source_ip,
            "severity": severity,
            "timestamp": timestamp
        }
        try:
            res = supabase.table("alerts").insert(row).execute()
            logger.info(f"✅ Inserted alert: {row}")
            print(f"✅ Inserted alert: {row}")
        except Exception as e:
            logger.error(f"❌ Failed to insert alert {alert_id}: {e}")

# -------------------------------
# Main loop
# -------------------------------
def main():
    print("⏳ Starting real-time CrowdSec → Supabase sync...")
    token = get_lapi_token()
    if not token:
        return

    last_alerts = set()
    while True:
        alerts = fetch_alerts(token)
        # Filter new alerts
        new_alerts = [a for a in alerts if (a.get("uuid") or a.get("id")) not in last_alerts]
        if new_alerts:
            push_to_supabase(new_alerts)
            last_alerts.update(a.get("uuid") or a.get("id") for a in new_alerts)
        time.sleep(5)  # check every 5 seconds

if __name__ == "__main__":
    main()
