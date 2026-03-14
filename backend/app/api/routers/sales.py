from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user_id
from app.schemas import schemas
from app.crud import crud
from uuid import UUID
from typing import List

router = APIRouter(prefix="/sales", tags=["sales"])

@router.get("/", response_model=List[schemas.Sale])
async def read_sales(user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.get_sales(db, user_id=user_id)

@router.post("/", response_model=schemas.Sale)
async def create_sale(sale: schemas.SaleCreate, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.record_sale(db, sale=sale, user_id=user_id)
