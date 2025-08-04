from fastapi import FastAPI
from routers import alerts  # Import the alerts router from routers folder

app = FastAPI(
    title="CrowdSec Sentinel Backend",
    description="API backend for the CrowdSec Sentinel Dashboard",
    version="1.0.0"
)

# Register API routes
app.include_router(alerts.router)

@app.get("/")
def read_root():
    return {"message": "CrowdSec Sentinel Backend is running"}


