from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.api_keys.create_index("prefix", unique=True)
    await db.api_keys.create_index("user_id")
    await db.usage_logs.create_index([("user_id", 1), ("timestamp", -1)])
    await db.usage_logs.create_index([("api_key_id", 1), ("timestamp", -1)])
    await db.subscriptions.create_index("user_id", unique=True)

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db
