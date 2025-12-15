from fastapi import APIRouter, Depends, Query
from app.models import UsageStats
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Optional

router = APIRouter(prefix="/api/usage", tags=["Usage"])

@router.get("/my", response_model=UsageStats)
async def get_my_usage(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    start_date = datetime.utcnow() - timedelta(days=days)
    
    logs = await db.usage_logs.find({
        "user_id": current_user["id"],
        "timestamp": {"$gte": start_date}
    }).to_list(10000)
    
    total = len(logs)
    successful = sum(1 for l in logs if 200 <= l["status_code"] < 300)
    failed = total - successful
    
    by_endpoint = {}
    by_day = {}
    
    for log in logs:
        ep = log["endpoint"]
        by_endpoint[ep] = by_endpoint.get(ep, 0) + 1
        
        day = log["timestamp"].strftime("%Y-%m-%d")
        by_day[day] = by_day.get(day, 0) + 1
    
    return UsageStats(
        total_requests=total,
        successful_requests=successful,
        failed_requests=failed,
        requests_by_endpoint=by_endpoint,
        requests_by_day=by_day
    )

@router.get("/global", response_model=UsageStats)
async def get_global_usage(
    days: int = Query(30, ge=1, le=365),
    _: dict = Depends(require_admin)
):
    db = get_db()
    start_date = datetime.utcnow() - timedelta(days=days)
    
    logs = await db.usage_logs.find({
        "timestamp": {"$gte": start_date}
    }).to_list(100000)
    
    total = len(logs)
    successful = sum(1 for l in logs if 200 <= l["status_code"] < 300)
    failed = total - successful
    
    by_endpoint = {}
    by_day = {}
    
    for log in logs:
        ep = log["endpoint"]
        by_endpoint[ep] = by_endpoint.get(ep, 0) + 1
        
        day = log["timestamp"].strftime("%Y-%m-%d")
        by_day[day] = by_day.get(day, 0) + 1
    
    return UsageStats(
        total_requests=total,
        successful_requests=successful,
        failed_requests=failed,
        requests_by_endpoint=by_endpoint,
        requests_by_day=by_day
    )

@router.get("/user/{user_id}", response_model=UsageStats)
async def get_user_usage(
    user_id: str,
    days: int = Query(30, ge=1, le=365),
    _: dict = Depends(require_admin)
):
    db = get_db()
    start_date = datetime.utcnow() - timedelta(days=days)
    
    logs = await db.usage_logs.find({
        "user_id": user_id,
        "timestamp": {"$gte": start_date}
    }).to_list(10000)
    
    total = len(logs)
    successful = sum(1 for l in logs if 200 <= l["status_code"] < 300)
    failed = total - successful
    
    by_endpoint = {}
    by_day = {}
    
    for log in logs:
        ep = log["endpoint"]
        by_endpoint[ep] = by_endpoint.get(ep, 0) + 1
        
        day = log["timestamp"].strftime("%Y-%m-%d")
        by_day[day] = by_day.get(day, 0) + 1
    
    return UsageStats(
        total_requests=total,
        successful_requests=successful,
        failed_requests=failed,
        requests_by_endpoint=by_endpoint,
        requests_by_day=by_day
    )
