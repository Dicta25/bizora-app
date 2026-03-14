from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_superadmin
from app.schemas import schemas
from app.crud import crud
from uuid import UUID
from typing import List, Any
import psutil
import time

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/health")
async def get_system_health(
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    # Test DB connection
    try:
        from sqlalchemy import text
        start_time = time.time()
        await db.execute(text("SELECT 1"))
        db_latency = round((time.time() - start_time) * 1000, 2)
        db_status = "Healthy"
    except Exception:
        db_latency = 0
        db_status = "Unreachable"

    return {
        "cpu_usage": psutil.cpu_percent(),
        "memory_usage": psutil.virtual_memory().percent,
        "disk_usage": psutil.disk_usage('/').percent,
        "db_status": db_status,
        "db_latency_ms": db_latency,
        "uptime_seconds": time.time() - psutil.boot_time(),
        "api_version": "1.0.0",
        "environment": "development"
    }

@router.get("/stats")
async def get_global_stats(
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    return await crud.get_global_stats(db)

@router.get("/users", response_model=List[schemas.User])
async def get_all_users(
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    return await crud.get_all_users(db)

@router.put("/users/{user_id}/plan", response_model=schemas.User)
async def update_user_plan(
    user_id: UUID,
    update: schemas.UserUpdate,
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    return await crud.update_user_admin(db, user_id=user_id, user_update=update)

@router.get("/sales", response_model=List[Any])
async def get_all_sales(
    limit: int = 100,
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    return await crud.get_all_sales(db, limit=limit)

@router.get("/broadcasts", response_model=List[schemas.Broadcast])
async def get_broadcasts(
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    # Need crud.get_broadcasts
    return []

@router.post("/broadcasts", response_model=schemas.Broadcast)
async def create_broadcast(
    broadcast: schemas.BroadcastCreate,
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    # Need crud.create_broadcast
    return await crud.create_user(db, broadcast) # Placeholder

@router.get("/audit-logs", response_model=List[schemas.AuditLog])
async def get_audit_logs(
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    # Need crud.get_audit_logs
    return []

@router.get("/tickets", response_model=List[schemas.SupportTicket])
async def get_support_tickets(
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    # This will need a crud.get_support_tickets
    return []

@router.post("/create-admin", response_model=schemas.User)
async def create_super_admin(
    admin_in: schemas.UserCreate,
    password: str,
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    # Check if admin exists
    if admin_in.email:
        db_user = await crud.get_user_by_email(db, email=admin_in.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Admin email already registered")
    
    # Force admin flags
    admin_dict = admin_in.model_dump()
    admin_dict["is_superadmin"] = True
    admin_dict["business_name"] = admin_dict.get("business_name") or "Bizora Staff"
    admin_dict["business_type"] = "Internal Admin"
    
    # Hash password
    from app.core import security
    admin_dict["hashed_password"] = security.get_password_hash(password)
    
    from app.db import models
    new_admin = models.User(**admin_dict)
    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)
    return new_admin

@router.post("/onboard", response_model=schemas.User)
async def onboard_business(
    user: schemas.UserCreate,
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    db_user = await crud.get_user(db, user_id=user.id)
    if db_user:
        raise HTTPException(status_code=400, detail="Profile already exists for this ID")
    
    # Hash default dev password so they can login
    user_dict = user.model_dump()
    from app.core import security
    user_dict["hashed_password"] = security.get_password_hash("default_otp_pass")
    
    from app.db import models
    db_user = models.User(**user_dict)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.get("/users/{user_id}", response_model=schemas.User)
async def get_user_detail(
    user_id: UUID,
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    user = await crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users/{user_id}/stats")
async def get_business_stats(
    user_id: UUID,
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    return await crud.get_user_stats(db, user_id=user_id)

@router.get("/users/{user_id}/products", response_model=List[schemas.Product])
async def get_business_products(
    user_id: UUID,
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    return await crud.get_user_products_admin(db, user_id=user_id)

@router.delete("/users/{user_id}")
async def delete_business(
    user_id: UUID,
    admin_id: UUID = Depends(get_current_superadmin),
    db: AsyncSession = Depends(get_db)
):
    await crud.delete_user(db, user_id=user_id)
    return {"status": "success"}
