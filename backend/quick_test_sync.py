#!/usr/bin/env python3
import uuid
from datetime import datetime
import logging
from supabase import create_client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("supabase-test")

# Create a single test alert
test_alert = {
    "id": str(uuid.uuid4()),
    "event": "test-event",
    "source_ip": "1.2.3.4",
    "severity": "info",
    "timestamp": datetime.utcnow().isoformat() + "Z"
}

try:
    res = supabase.table("alerts").insert(test_alert).execute()
    logger.info(f"Inserted test alert: {test_alert}, response={res.data}")
except Exception as e:
    logger.error(f"Failed to insert test alert: {e}")
