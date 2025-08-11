from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import logging
from requests.auth import HTTPBasicAuth

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use environment variables or hardcode your login and password here
CROWDSEC_LOGIN = os.getenv("CROWDSEC_LOGIN", "backend")
CROWDSEC_PASSWORD = os.getenv("CROWDSEC_PASSWORD", "tUx6kDSVgYAKi5SyjJ193Jpiyj9BwMkAsQ4nJOjv1ideN6h9l1ecQfi1IEeQnRLN")

@app.get("/alerts")
def get_alerts():
    try:
        resp = requests.get(
            "http://localhost:8080/v1/alerts",
            auth=HTTPBasicAuth(CROWDSEC_LOGIN, CROWDSEC_PASSWORD)
        )
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")
