import os
from supabase import create_client
from datetime import datetime
import uuid
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase credentials not found in environment variables!")

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Create a fake alert
alert = {
    "id": str(uuid.uuid4()),
    "source_ip": "1.2.3.4",
    "event": "ssh-bf-test",
    "severity": "info",
    "timestamp": datetime.utcnow().isoformat() + "Z"
}

# Insert into Supabase
res = supabase.table("alerts").insert(alert).execute()
print("Inserted test alert:", res.data)
