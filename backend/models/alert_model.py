from pydantic import BaseModel

class Alert(BaseModel):
    ip: str
    reason: str
