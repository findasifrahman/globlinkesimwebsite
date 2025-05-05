from fastapi import FastAPI, Request
import logging
from databases import Database
from sqlalchemy import MetaData, Table, Column, String, DateTime, Numeric
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime
import os
from dotenv import load_dotenv
import uvicorn
import sys

# 🚀 Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# 🚀 Load environment variables from .env.local
load_dotenv('.env.local')

# 🚀 Initialize FastAPI app
app = FastAPI()

# 🚀 Database URL from Railway
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

logger.info(f"Connecting to database at {DATABASE_URL}")

# 🚀 Initialize Database
database = Database(DATABASE_URL)
metadata = MetaData()

# 🚀 Define Table
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

# 🚀 Start and stop database with app
@app.on_event("startup")
async def startup():
    logger.info("Starting payment webhook server...")
    await database.connect()
    logger.info("Database connected successfully")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down payment webhook server...")
    await database.disconnect()
    logger.info("Database disconnected successfully")

@app.post("/payssiongloblinkesimwebhhok")
async def hook(request: Request):
    payload = await request.json()
    logger.info(f"📩 Webhook received: {payload}")

    order_id = payload.get("order_id")
    transaction_id = payload.get("transaction_id")
    state = payload.get("state")
    pm_id = payload.get("pm_id")
    amount = payload.get("amount")
    currency = payload.get("currency")

    if not order_id:
        logger.error("Missing order_id in webhook payload")
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
        logger.info(f"Successfully processed webhook for order {order_id}")
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return {"error": str(e)}

# 🚀 Endpoint to view latest events
@app.get("/last-events")
async def get_last_events():
    query = payment_webhook_states.select().order_by(payment_webhook_states.c.created_at.desc()).limit(10)
    events = await database.fetch_all(query)
    return {"events": [dict(event) for event in events]}

if __name__ == "__main__":
    port = int(os.getenv("PORT_PAYMENT", 3001))
    logger.info(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")