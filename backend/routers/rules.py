from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from datetime import datetime, timezone
from db import supabase

router = APIRouter()

@router.post("/rules/upload")
async def upload_rule(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    """
    Upload a new rule into Supabase 'rules' table.
    """
    try:
        if file and file.filename:
            data = (await file.read()).decode("utf-8", errors="replace")
        elif content:
            data = content
        else:
            raise HTTPException(status_code=422, detail="Provide either 'content' or 'file'.")

        row = {
            "name": name,
            "description": description,
            "tags": tags,
            "content": data,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        supabase.table("rules").insert(row).execute()
        return {"status": "success", "name": name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save rule: {e}")
