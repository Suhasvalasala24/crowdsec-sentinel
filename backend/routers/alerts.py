from fastapi import APIRouter, Request, HTTPException
from supabase import create_client
import os, logging
from dotenv import load_dotenv
from datetime import datetime
import uuid
import requests

# Load .env
load_dotenv()

router = APIRouter()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("❌ Missing Supabase configuration in .env")
    raise Exception("Supabase URL or Key not set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# CrowdSec config
CROWDSEC_API_URL = os.getenv("CROWDSEC_API_URL", "http://127.0.0.1:8080")
CROWDSEC_LOGIN = os.getenv("CROWDSEC_LOGIN")
CROWDSEC_PASSWORD = os.getenv("CROWDSEC_PASSWORD")


def get_lapi_session():
    """Authenticate to CrowdSec LAPI and return session with JWT cookie."""
    session = requests.Session()
    payload = {"login": CROWDSEC_LOGIN, "password": CROWDSEC_PASSWORD}
    try:
        resp = session.post(f"{CROWDSEC_API_URL}/v1/login", json=payload)
        resp.raise_for_status()
        return session
    except requests.exceptions.RequestException as e:
        logger.error(f"LAPI login failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to login to CrowdSec LAPI")


def parse_meta(meta_list):
    """Convert CrowdSec meta list into a dict {key: value}"""
    if isinstance(meta_list, list):
        return {m.get("key"): m.get("value") for m in meta_list if isinstance(m, dict)}
    return {}


@router.get("/alerts")
def get_alerts():
    """Fetch alerts from Supabase."""
    try:
        res = supabase.table("alerts").select("*").execute()
        return res.data
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")


@router.post("/alerts")
async def receive_alerts(request: Request):
    """Receive alerts from CrowdSec notifier and insert safely into Supabase."""
    try:
        payload = await request.json()

        # Handle both dict and list payloads
        alerts = payload if isinstance(payload, list) else [payload]

        logger.info(f"📥 Received {len(alerts)} alerts from CrowdSec")

        inserted = 0
        for alert in alerts:
            try:
                alert_uuid = alert.get("uuid") or str(uuid.uuid4())
                scenario = alert.get("scenario") or alert.get("event") or "unknown"

                # parse meta list
                meta_dict = parse_meta(alert.get("meta"))

                source_ip = (
                    (alert.get("source") or {}).get("ip")
                    or meta_dict.get("source_ip")
                    or "unknown"
                )
                severity = meta_dict.get("severity", "info")
                timestamp = alert.get("created_at") or datetime.utcnow().isoformat() + "Z"

                # Skip duplicates
                existing = supabase.table("alerts").select("id").eq("id", alert_uuid).execute()
                if existing.data:
                    logger.debug(f"⚠️ Skipping duplicate alert: {alert_uuid}")
                    continue

                row = {
                    "id": alert_uuid,
                    "source_ip": source_ip,
                    "event": scenario,
                    "severity": severity,
                    "timestamp": timestamp,
                }

                supabase.table("alerts").insert(row).execute()
                inserted += 1
                logger.info(f"✅ Inserted alert into Supabase: {row}")

            except Exception as inner_e:
                logger.error(f"⚠️ Skipped alert due to error: {inner_e} | Raw alert: {alert}")

        return {"status": "success", "inserted": inserted, "total_received": len(alerts)}

    except Exception as e:
        logger.error(f"❌ Error processing alerts: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error processing alerts")
