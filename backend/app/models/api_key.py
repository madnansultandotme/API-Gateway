from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class APIKeyCreate(BaseModel):
    name: str
    allowed_services: List[str] = []
    expires_in_days: Optional[int] = None

class APIKeyResponse(BaseModel):
    id: str
    name: str
    prefix: str
    allowed_services: List[str]
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime] = None

class APIKeyCreated(APIKeyResponse):
    key: str  # Only returned once on creation

class APIKeyInDB(BaseModel):
    user_id: str
    name: str
    key_hash: str
    prefix: str
    allowed_services: List[str]
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
