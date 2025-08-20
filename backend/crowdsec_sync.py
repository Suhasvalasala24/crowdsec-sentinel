from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from crowdsec_lapi import fetch_alerts  # your existing LAPI client

# Load environment variables from .env
load_dotenv()

# Load Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase credentials not found in environment variables!")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize FastAPI app
app = FastAPI()


def push_crowdsec_alerts_to_supabase():
    """Fetch alerts from CrowdSec LAPI and push to Supabase."""
    try:
        alerts = fetch_alerts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")

    count = 0
    for alert in alerts:
        data = {
            "source_ip": alert.get("ip") or alert.get("source_ip") or "",
            "event": alert.get("scenario") or alert.get("event") or "",
            "timestamp": alert.get("created_at") or alert.get("timestamp") or ""
        }

        try:
            res = supabase.table("alerts").insert(data).execute()
            if hasattr(res, "status_code") and res.status_code in (200, 201):
                count += 1
        except Exception as e:
            print(f"Failed to insert alert: {data}, error: {e}")

    return count


@app.post("/sync-alerts")
def sync_alerts():
    """Endpoint to sync alerts from CrowdSec to Supabase."""
    count = push_crowdsec_alerts_to_supabase()
    return {"message": f"{count} alerts synced to Supabase"}


@app.get("/alerts")
def get_alerts():
    """Endpoint to fetch all alerts from Supabase."""
    try:
        res = supabase.table("alerts").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")
