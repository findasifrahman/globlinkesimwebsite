from fastapi import FastAPI, Request, APIRouter
import logging
from databases import Database
from sqlalchemy import MetaData, Table, Column, String, DateTime, Numeric
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime
import os
import uvicorn
import sys

# 🚀 Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# 🚀 Initialize FastAPI app
app = FastAPI()

# Create a router for webhook endpoints
webhook_router = APIRouter(prefix="/api/webhooks")

# 🚀 Database URL from Railway
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

logger.info(f"Connecting to database at {DATABASE_URL}")

# 🚀 Initialize Database
database = Database(DATABASE_URL)
metadata = MetaData()

# 🚀 Define Tables
payment_webhook_states = Table(
    "payment_webhook_states",
    metadata,
    Column("id", String, primary_key=True),
    Column("order_id", String),
    Column("status", String),
    Column("transaction_id", String),
    Column("pm_id", String),
    Column("amount", Numeric(10, 2)),
    Column("currency", String),
    Column("created_at", DateTime),
    Column("updated_at", DateTime),
    Column("user_id", String),
)

# Store eSIM webhook events temporarily
esim_events = []

# 🚀 Start and stop database with app
@app.on_event("startup")
async def startup():
    logger.info("Starting webhook server...")
    await database.connect()
    logger.info("Database connected successfully")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down webhook server...")
    await database.disconnect()
    logger.info("Database disconnected successfully")

# Payment Webhook Endpoint
@webhook_router.post("/payment")
async def payment_hook(request: Request):
    payload = await request.json()
    logger.info(f"📩 Payment Webhook received: {payload}")

    order_id = payload.get("order_id")
    transaction_id = payload.get("transaction_id")
    state = payload.get("state")
    pm_id = payload.get("pm_id")
    amount = payload.get("amount")
    currency = payload.get("currency")

    if not order_id:
        logger.error("Missing order_id in payment webhook payload")
        return {"error": "order_id missing"}

    now = datetime.utcnow()

    # 🚀 Build UPSERT query
    upsert_query = insert(payment_webhook_states).values(
        id=transaction_id,
        order_id=order_id,
        status=state,
        transaction_id=transaction_id,
        pm_id=pm_id,
        amount=amount,
        currency=currency,
        created_at=now,
        updated_at=now,
        user_id=None,
    ).on_conflict_do_update(
        index_elements=['id'],
        set_={
            "status": state,
            "updated_at": now,
            "transaction_id": transaction_id,
            "amount": amount,
            "currency": currency,
            "pm_id": pm_id
        }
    )

    try:
        await database.execute(upsert_query)
        logger.info(f"Successfully processed payment webhook for order {order_id}")
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error processing payment webhook: {str(e)}")
        return {"error": str(e)}

# eSIM Webhook Endpoint
@webhook_router.post("/esim")
async def esim_hook(request: Request):
    payload = await request.json()
    esim_events.append(payload)
    logger.info(f"📩 eSIM Webhook received: {payload}")
    return {"status": "ok"}

# Endpoints to view latest events
@webhook_router.get("/payment/last-events")
async def get_payment_last_events():
    query = payment_webhook_states.select().order_by(payment_webhook_states.c.created_at.desc()).limit(10)
    events = await database.fetch_all(query)
    return {"events": [dict(event) for event in events]}

@webhook_router.get("/esim/last-events")
def get_esim_last_events():
    return {"events": esim_events[-10:]}  # return latest 10

# Include the router in the app
app.include_router(webhook_router)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))  # Use the same port as Next.js
    logger.info(f"Starting combined webhook server on port {port}")
    try:
        uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
    except Exception as e:
        logger.error(f"Failed to start webhook server: {str(e)}")
        sys.exit(1) 