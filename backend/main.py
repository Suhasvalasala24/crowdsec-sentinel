import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CrowdSec Sentinel Backend", version="0.1.0")

# Allow frontend
allowed = [
    os.getenv("FRONTEND_ORIGIN") or "http://localhost:8081",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from routers.alerts import router as alerts_router
from routers.rules import router as rules_router
app.include_router(alerts_router)
app.include_router(rules_router)

@app.get("/")
def root():
    return {
        "status": "ok",
        "app": "CrowdSec Sentinel Backend",
        "version": "0.1.0",
        "docs": "/docs",
    }
