from fastapi import APIRouter, HTTPException, Depends
from app.models import PlanCreate, PlanUpdate, PlanResponse
from app.database import get_db
from app.dependencies import require_admin, get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/api/plans", tags=["Plans"])

@router.post("/", response_model=PlanResponse)
async def create_plan(plan: PlanCreate, _: dict = Depends(require_admin)):
    db = get_db()
    
    plan_doc = {
        "name": plan.name,
        "monthly_limit": plan.monthly_limit,
        "rate_limit_per_minute": plan.rate_limit_per_minute,
        "allowed_services": plan.allowed_services,
        "created_at": datetime.utcnow()
    }
    
    result = await db.plans.insert_one(plan_doc)
    
    return PlanResponse(
        id=str(result.inserted_id),
        **plan_doc
    )

@router.get("/", response_model=List[PlanResponse])
async def list_plans(_: dict = Depends(get_current_user)):
    db = get_db()
    plans = await db.plans.find().to_list(100)
    
    return [
        PlanResponse(
            id=str(p["_id"]),
            name=p["name"],
            monthly_limit=p["monthly_limit"],
            rate_limit_per_minute=p["rate_limit_per_minute"],
            allowed_services=p["allowed_services"],
            created_at=p["created_at"]
        ) for p in plans
    ]

@router.get("/{plan_id}", response_model=PlanResponse)
async def get_plan(plan_id: str, _: dict = Depends(get_current_user)):
    db = get_db()
    plan = await db.plans.find_one({"_id": ObjectId(plan_id)})
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return PlanResponse(
        id=str(plan["_id"]),
        name=plan["name"],
        monthly_limit=plan["monthly_limit"],
        rate_limit_per_minute=plan["rate_limit_per_minute"],
        allowed_services=plan["allowed_services"],
        created_at=plan["created_at"]
    )

@router.put("/{plan_id}", response_model=PlanResponse)
async def update_plan(plan_id: str, plan: PlanUpdate, _: dict = Depends(require_admin)):
    db = get_db()
    
    update_data = {k: v for k, v in plan.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.plans.update_one(
        {"_id": ObjectId(plan_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    updated = await db.plans.find_one({"_id": ObjectId(plan_id)})
    
    return PlanResponse(
        id=str(updated["_id"]),
        name=updated["name"],
        monthly_limit=updated["monthly_limit"],
        rate_limit_per_minute=updated["rate_limit_per_minute"],
        allowed_services=updated["allowed_services"],
        created_at=updated["created_at"]
    )

@router.delete("/{plan_id}")
async def delete_plan(plan_id: str, _: dict = Depends(require_admin)):
    db = get_db()
    
    result = await db.plans.delete_one({"_id": ObjectId(plan_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return {"message": "Plan deleted"}
