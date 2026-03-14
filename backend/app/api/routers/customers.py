from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user_id
from app.schemas import schemas
from app.crud import crud
from uuid import UUID
from typing import List

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("/", response_model=List[schemas.Customer])
async def read_customers(user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.get_customers(db, user_id=user_id)

@router.post("/", response_model=schemas.Customer)
async def create_customer(customer: schemas.CustomerCreate, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.create_customer(db, customer=customer, user_id=user_id)

@router.put("/{customer_id}", response_model=schemas.Customer)
async def update_customer(customer_id: UUID, customer: schemas.CustomerUpdate, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    db_customer = await crud.get_customer(db, customer_id=customer_id, user_id=user_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return await crud.update_customer(db, customer_id=customer_id, customer=customer, user_id=user_id)
