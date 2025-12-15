from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SubscriptionCreate(BaseModel):
    user_id: str
    plan_id: str

class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    plan_id: str
    usage_count: int
    reset_at: datetime
    created_at: datetime

class SubscriptionInDB(BaseModel):
    user_id: str
    plan_id: str
    usage_count: int = 0
    reset_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
