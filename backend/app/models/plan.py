from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class PlanCreate(BaseModel):
    name: str
    monthly_limit: int
    rate_limit_per_minute: int
    allowed_services: List[str]

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    monthly_limit: Optional[int] = None
    rate_limit_per_minute: Optional[int] = None
    allowed_services: Optional[List[str]] = None

class PlanResponse(BaseModel):
    id: str
    name: str
    monthly_limit: int
    rate_limit_per_minute: int
    allowed_services: List[str]
    created_at: datetime

class PlanInDB(BaseModel):
    name: str
    monthly_limit: int
    rate_limit_per_minute: int
    allowed_services: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
