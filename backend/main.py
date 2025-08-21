from fastapi import FastAPI, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Load env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="CrowdSec Sentinel Backend")

# Allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# RULES ENDPOINTS
# ------------------------

@app.post("/rules/upload")
async def upload_rule(
    title: str = Form(...),
    description: str = Form(""),
    rule_content: str = Form(...),
    rule_type: str = Form(...),
    severity: str = Form(...),
    user_id: str = Form(...),
):
    """Upload a new rule into Supabase"""
    try:
        response = supabase.table("rules").insert({
            "user_id": user_id,
            "title": title,
            "description": description,
            "rule_content": rule_content,
            "rule_type": rule_type,
            "severity": severity,
        }).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/rules/list")
async def list_rules():
    """Fetch all public rules"""
    try:
        response = supabase.table("rules").select("*").eq("is_public", True).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rules/download/{rule_id}")
async def download_rule(rule_id: str, user_id: str = Form(...)):
    """Download a rule -> increments count & records user download"""
    try:
        # Update downloads count
        supabase.rpc("increment_rule_downloads", {"ruleid": rule_id}).execute()

        # Insert into downloads table
        supabase.table("rule_downloads").insert({
            "rule_id": rule_id,
            "user_id": user_id
        }).execute()

        # Fetch rule content
        response = supabase.table("rules").select("*").eq("id", rule_id).single().execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------
# SHARED DETECTIONS
# ------------------------

@app.post("/detections/upload")
async def upload_detection(
    user_id: str = Form(...),
    detection_type: str = Form(...),
    threat_data: str = Form(...),  # should be JSON string
    ip_address: str = Form(None),
    location: str = Form(None),
    confidence_score: float = Form(0.5),
):
    """Upload a shared detection"""
    try:
        response = supabase.table("shared_detections").insert({
            "user_id": user_id,
            "detection_type": detection_type,
            "threat_data": threat_data,
            "ip_address": ip_address,
            "location": location,
            "confidence_score": confidence_score
        }).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/detections/list")
async def list_detections():
    """Fetch all shared detections"""
    try:
        response = supabase.table("shared_detections").select("*").execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------
# ALERTS
# ------------------------

@app.get("/alerts/list")
async def list_alerts():
    """Fetch alerts stored in Supabase"""
    try:
        response = supabase.table("alerts").select("*").order("timestamp", desc=True).limit(50).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
