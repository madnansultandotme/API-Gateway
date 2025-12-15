from fastapi import APIRouter, HTTPException, Depends
from app.models import UserResponse
from app.database import get_db
from app.dependencies import require_admin
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/users", response_model=List[UserResponse])
async def list_users(_: dict = Depends(require_admin)):
    db = get_db()
    users = await db.users.find().to_list(1000)
    
    return [
        UserResponse(
            id=str(u["_id"]),
            email=u["email"],
            role=u["role"],
            is_active=u["is_active"],
            created_at=u["created_at"]
        ) for u in users
    ]

@router.post("/users/{user_id}/suspend")
async def suspend_user(user_id: str, _: dict = Depends(require_admin)):
    db = get_db()
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Also deactivate all their API keys
    await db.api_keys.update_many(
        {"user_id": user_id},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "User suspended"}

@router.post("/users/{user_id}/activate")
async def activate_user(user_id: str, _: dict = Depends(require_admin)):
    db = get_db()
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User activated"}

@router.get("/keys", response_model=list)
async def list_all_keys(_: dict = Depends(require_admin)):
    db = get_db()
    keys = await db.api_keys.find().to_list(1000)
    
    return [
        {
            "id": str(k["_id"]),
            "user_id": k["user_id"],
            "name": k["name"],
            "prefix": k["prefix"],
            "allowed_services": k["allowed_services"],
            "is_active": k["is_active"],
            "created_at": k["created_at"],
            "expires_at": k.get("expires_at")
        } for k in keys
    ]

@router.post("/keys/{key_id}/revoke")
async def admin_revoke_key(key_id: str, _: dict = Depends(require_admin)):
    db = get_db()
    
    result = await db.api_keys.update_one(
        {"_id": ObjectId(key_id)},
        {"$set": {"is_active": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return {"message": "API key revoked"}
