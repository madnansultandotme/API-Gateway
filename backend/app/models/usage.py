from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class UsageLog(BaseModel):
    user_id: str
    api_key_id: str
    endpoint: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status_code: int

class UsageStats(BaseModel):
    total_requests: int
    successful_requests: int
    failed_requests: int
    requests_by_endpoint: dict
    requests_by_day: dict
