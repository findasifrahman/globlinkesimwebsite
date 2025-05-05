from fastapi import FastAPI, Request
import logging
from databases import Database
from sqlalchemy import MetaData, Table, Column, String, DateTime, Numeric
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime
import os
from dotenv import load_dotenv
import uvicorn

# 🚀 Load environment variables from .env.local
load_dotenv('.env.local')

# 🚀 Initialize FastAPI app
app = FastAPI()

# 🚀 Configure Logging
logging.basicConfig(level=logging.INFO)

# 🚀 Database URL from Railway
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# 🚀 Initialize Database
database = Database(DATABASE_URL)
latest_events = []  # stores webhook events temporarily

@app.post("/globlinkesimwebhook")
async def hook(request: Request):
    payload = await request.json()
    latest_events.append(payload)
    logging.info(f"📩 Webhook: {payload}")
    return {"status": "ok"}

@app.get("/last-events")
def get_last_events():
    return {"events": latest_events[-10:]}  # return latest 10

if __name__ == "__main__":
    port = int(os.getenv("PORT_ESIM", 3002))
    uvicorn.run(app, host="0.0.0.0", port=port)
