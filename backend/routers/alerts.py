from fastapi import APIRouter
from models.alert_model import Alert

router = APIRouter()

@router.post("/alert")
def create_alert(alert: Alert):
    return {"status": "received", "ip": alert.ip, "reason": alert.reason}
