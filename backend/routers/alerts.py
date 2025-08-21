# routers/alerts.py
from fastapi import APIRouter, Request, HTTPException
from supabase import create_client
import os, logging
from dotenv import load_dotenv
from datetime import datetime

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
    logger.error("❌ Missing Supabase configuration. Check your .env file.")
    raise Exception("Supabase URL or Key not set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@router.post("/alerts")
async def receive_alerts(request: Request):
    """Receive alerts from CrowdSec notifier and insert safely into Supabase"""
    try:
        data = await request.json()
        if not isinstance(data, list):
            data = [data]

        inserted = 0
        for alert in data:
            alert_uuid = alert.get("uuid")
            scenario = alert.get("scenario", "unknown")
            source_ip = alert.get("source", {}).get("ip", "unknown")
            severity = "info"
            timestamp = alert.get("created_at")

            # Fill timestamp if missing
            if not timestamp:
                timestamp = datetime.utcnow().isoformat() + "Z"

            # Check if alert already exists
            existing = supabase.table("alerts").select("*").eq("id", alert_uuid).execute()
            if existing.data:
                logger.info(f"⚠️ Alert {alert_uuid} already exists. Skipping insert.")
                continue

            row = {
                "id": alert_uuid,
                "source_ip": source_ip,
                "event": scenario,
                "severity": severity,
                "timestamp": timestamp,
            }

            # Insert into Supabase
            supabase.table("alerts").insert(row).execute()
            inserted += 1
            logger.info(f"✅ Inserted alert: {row}")

        return {"status": "success", "inserted": inserted}

    except Exception as e:
        logger.error(f"❌ Error saving alert: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error processing alert")
