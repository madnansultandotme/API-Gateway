from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.models import UserCreate, UserResponse, Token
from app.utils.security import hash_password, verify_password, create_access_token
from app.database import get_db
from app.dependencies import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    db = get_db()
    
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "email": user.email,
        "password_hash": hash_password(user.password),
        "role": user.role,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    
    return UserResponse(
        id=str(result.inserted_id),
        email=user.email,
        role=user.role,
        is_active=True,
        created_at=user_doc["created_at"]
    )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    user = await db.users.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="User is suspended")
    
    access_token = create_access_token(data={"sub": str(user["_id"]), "role": user["role"]})
    
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        role=user["role"],
        is_active=user["is_active"],
        created_at=user["created_at"]
    )
