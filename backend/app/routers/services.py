from fastapi import APIRouter, HTTPException, Depends, Header
from app.database import get_db
from app.utils.security import hash_api_key
from datetime import datetime
from bson import ObjectId
import random
import httpx

router = APIRouter(prefix="/api/services", tags=["API Services"])

# Sample data for services
WEATHER_DATA = [
    {"city": "New York", "temp": 72, "condition": "Sunny"},
    {"city": "London", "temp": 58, "condition": "Cloudy"},
    {"city": "Tokyo", "temp": 68, "condition": "Rainy"},
    {"city": "Sydney", "temp": 82, "condition": "Clear"},
    {"city": "Paris", "temp": 65, "condition": "Partly Cloudy"},
]

CURRENCY_RATES = {
    "USD": 1.0, "EUR": 0.85, "GBP": 0.73, "JPY": 110.0, "AUD": 1.35,
    "CAD": 1.25, "CHF": 0.92, "CNY": 6.45, "INR": 74.5, "MXN": 20.1
}

RANDOM_FACTS = [
    "Honey never spoils.",
    "Octopuses have three hearts.",
    "Bananas are berries, but strawberries aren't.",
    "A day on Venus is longer than a year on Venus.",
    "The Eiffel Tower can grow 6 inches in summer.",
]

async def validate_api_key(x_api_key: str = Header(..., alias="X-API-Key")):
    db = get_db()
    key_hash = hash_api_key(x_api_key)
    
    api_key = await db.api_keys.find_one({"key_hash": key_hash})
    
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    if not api_key["is_active"]:
        raise HTTPException(status_code=401, detail="API key is revoked")
    
    if api_key.get("expires_at") and api_key["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=401, detail="API key has expired")
    
    # Check subscription and quota
    sub = await db.subscriptions.find_one({"user_id": api_key["user_id"]})
    if sub:
        plan = await db.plans.find_one({"_id": ObjectId(sub["plan_id"])})
        if plan and sub["usage_count"] >= plan["monthly_limit"]:
            raise HTTPException(status_code=429, detail="Monthly quota exceeded")
    
    return api_key

async def log_usage(api_key: dict, endpoint: str, status_code: int):
    db = get_db()
    
    await db.usage_logs.insert_one({
        "user_id": api_key["user_id"],
        "api_key_id": str(api_key["_id"]),
        "endpoint": endpoint,
        "timestamp": datetime.utcnow(),
        "status_code": status_code
    })
    
    # Increment subscription usage
    await db.subscriptions.update_one(
        {"user_id": api_key["user_id"]},
        {"$inc": {"usage_count": 1}}
    )

@router.get("/weather")
async def get_weather(city: str = None, api_key: dict = Depends(validate_api_key)):
    endpoint = "/api/services/weather"
    
    if "weather" not in api_key["allowed_services"] and api_key["allowed_services"]:
        await log_usage(api_key, endpoint, 403)
        raise HTTPException(status_code=403, detail="Service not allowed for this API key")
    
    if city:
        data = next((w for w in WEATHER_DATA if w["city"].lower() == city.lower()), None)
        if not data:
            data = {"city": city, "temp": random.randint(50, 90), "condition": random.choice(["Sunny", "Cloudy", "Rainy"])}
    else:
        data = random.choice(WEATHER_DATA)
    
    await log_usage(api_key, endpoint, 200)
    return data

@router.get("/currency")
async def get_currency(base: str = "USD", target: str = "EUR", api_key: dict = Depends(validate_api_key)):
    endpoint = "/api/services/currency"
    
    if "currency" not in api_key["allowed_services"] and api_key["allowed_services"]:
        await log_usage(api_key, endpoint, 403)
        raise HTTPException(status_code=403, detail="Service not allowed for this API key")
    
    base_rate = CURRENCY_RATES.get(base.upper(), 1.0)
    target_rate = CURRENCY_RATES.get(target.upper(), 1.0)
    
    rate = target_rate / base_rate
    
    await log_usage(api_key, endpoint, 200)
    return {"base": base.upper(), "target": target.upper(), "rate": round(rate, 4)}

@router.get("/random-fact")
async def get_random_fact(api_key: dict = Depends(validate_api_key)):
    endpoint = "/api/services/random-fact"
    
    if "random-fact" not in api_key["allowed_services"] and api_key["allowed_services"]:
        await log_usage(api_key, endpoint, 403)
        raise HTTPException(status_code=403, detail="Service not allowed for this API key")
    
    await log_usage(api_key, endpoint, 200)
    return {"fact": random.choice(RANDOM_FACTS)}

@router.get("/ip-lookup")
async def ip_lookup(ip: str = None, api_key: dict = Depends(validate_api_key)):
    endpoint = "/api/services/ip-lookup"
    
    if "ip-lookup" not in api_key["allowed_services"] and api_key["allowed_services"]:
        await log_usage(api_key, endpoint, 403)
        raise HTTPException(status_code=403, detail="Service not allowed for this API key")
    
    # Mock IP data
    data = {
        "ip": ip or "8.8.8.8",
        "country": "United States",
        "city": "Mountain View",
        "isp": "Google LLC",
        "timezone": "America/Los_Angeles"
    }
    
    await log_usage(api_key, endpoint, 200)
    return data

@router.get("/available")
async def list_available_services():
    """List all available API services (public endpoint)"""
    return {
        "services": [
            {"name": "weather", "endpoint": "/api/services/weather", "description": "Get weather data"},
            {"name": "currency", "endpoint": "/api/services/currency", "description": "Currency exchange rates"},
            {"name": "random-fact", "endpoint": "/api/services/random-fact", "description": "Get random facts"},
            {"name": "ip-lookup", "endpoint": "/api/services/ip-lookup", "description": "IP geolocation lookup"},
        ]
    }
