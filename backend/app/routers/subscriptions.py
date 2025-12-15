from fastapi import APIRouter, HTTPException, Depends
from app.models import SubscriptionCreate, SubscriptionResponse
from app.database import get_db
from app.dependencies import require_admin, get_current_user
from datetime import datetime, timedelta
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

def get_next_reset_date():
    now = datetime.utcnow()
    if now.month == 12:
        return datetime(now.year + 1, 1, 1)
    return datetime(now.year, now.month + 1, 1)

@router.post("/", response_model=SubscriptionResponse)
async def assign_plan(sub: SubscriptionCreate, _: dict = Depends(require_admin)):
    db = get_db()
    
    # Verify user exists
    user = await db.users.find_one({"_id": ObjectId(sub.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify plan exists
    plan = await db.plans.find_one({"_id": ObjectId(sub.plan_id)})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Check existing subscription
    existing = await db.subscriptions.find_one({"user_id": sub.user_id})
    
    if existing:
        # Update existing subscription
        await db.subscriptions.update_one(
            {"user_id": sub.user_id},
            {"$set": {"plan_id": sub.plan_id, "usage_count": 0, "reset_at": get_next_reset_date()}}
        )
        updated = await db.subscriptions.find_one({"user_id": sub.user_id})
        return SubscriptionResponse(
            id=str(updated["_id"]),
            user_id=updated["user_id"],
            plan_id=updated["plan_id"],
            usage_count=updated["usage_count"],
            reset_at=updated["reset_at"],
            created_at=updated["created_at"]
        )
    
    sub_doc = {
        "user_id": sub.user_id,
        "plan_id": sub.plan_id,
        "usage_count": 0,
        "reset_at": get_next_reset_date(),
        "created_at": datetime.utcnow()
    }
    
    result = await db.subscriptions.insert_one(sub_doc)
    
    return SubscriptionResponse(
        id=str(result.inserted_id),
        **sub_doc
    )

@router.get("/my", response_model=SubscriptionResponse)
async def get_my_subscription(current_user: dict = Depends(get_current_user)):
    db = get_db()
    sub = await db.subscriptions.find_one({"user_id": current_user["id"]})
    
    if not sub:
        raise HTTPException(status_code=404, detail="No subscription found")
    
    return SubscriptionResponse(
        id=str(sub["_id"]),
        user_id=sub["user_id"],
        plan_id=sub["plan_id"],
        usage_count=sub["usage_count"],
        reset_at=sub["reset_at"],
        created_at=sub["created_at"]
    )

@router.get("/", response_model=List[SubscriptionResponse])
async def list_subscriptions(_: dict = Depends(require_admin)):
    db = get_db()
    subs = await db.subscriptions.find().to_list(1000)
    
    return [
        SubscriptionResponse(
            id=str(s["_id"]),
            user_id=s["user_id"],
            plan_id=s["plan_id"],
            usage_count=s["usage_count"],
            reset_at=s["reset_at"],
            created_at=s["created_at"]
        ) for s in subs
    ]
