from fastapi import APIRouter, HTTPException, Depends
from app.models import APIKeyCreate, APIKeyResponse, APIKeyCreated
from app.utils.security import generate_api_key
from app.database import get_db
from app.dependencies import get_current_user
from datetime import datetime, timedelta
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/api/keys", tags=["API Keys"])

@router.post("/", response_model=APIKeyCreated)
async def create_api_key(key_data: APIKeyCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    full_key, prefix, key_hash = generate_api_key()
    
    expires_at = None
    if key_data.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=key_data.expires_in_days)
    
    key_doc = {
        "user_id": current_user["id"],
        "name": key_data.name,
        "key_hash": key_hash,
        "prefix": prefix,
        "allowed_services": key_data.allowed_services,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at
    }
    
    result = await db.api_keys.insert_one(key_doc)
    
    return APIKeyCreated(
        id=str(result.inserted_id),
        name=key_data.name,
        prefix=prefix,
        key=full_key,
        allowed_services=key_data.allowed_services,
        is_active=True,
        created_at=key_doc["created_at"],
        expires_at=expires_at
    )

@router.get("/", response_model=List[APIKeyResponse])
async def list_api_keys(current_user: dict = Depends(get_current_user)):
    db = get_db()
    keys = await db.api_keys.find({"user_id": current_user["id"]}).to_list(100)
    
    return [
        APIKeyResponse(
            id=str(k["_id"]),
            name=k["name"],
            prefix=k["prefix"],
            allowed_services=k["allowed_services"],
            is_active=k["is_active"],
            created_at=k["created_at"],
            expires_at=k.get("expires_at")
        ) for k in keys
    ]

@router.delete("/{key_id}")
async def revoke_api_key(key_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    result = await db.api_keys.update_one(
        {"_id": ObjectId(key_id), "user_id": current_user["id"]},
        {"$set": {"is_active": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return {"message": "API key revoked"}

@router.post("/{key_id}/rotate", response_model=APIKeyCreated)
async def rotate_api_key(key_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    old_key = await db.api_keys.find_one({"_id": ObjectId(key_id), "user_id": current_user["id"]})
    if not old_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    # Revoke old key
    await db.api_keys.update_one({"_id": ObjectId(key_id)}, {"$set": {"is_active": False}})
    
    # Create new key
    full_key, prefix, key_hash = generate_api_key()
    
    key_doc = {
        "user_id": current_user["id"],
        "name": old_key["name"],
        "key_hash": key_hash,
        "prefix": prefix,
        "allowed_services": old_key["allowed_services"],
        "is_active": True,
        "created_at": datetime.utcnow(),
        "expires_at": old_key.get("expires_at")
    }
    
    result = await db.api_keys.insert_one(key_doc)
    
    return APIKeyCreated(
        id=str(result.inserted_id),
        name=key_doc["name"],
        prefix=prefix,
        key=full_key,
        allowed_services=key_doc["allowed_services"],
        is_active=True,
        created_at=key_doc["created_at"],
        expires_at=key_doc.get("expires_at")
    )
