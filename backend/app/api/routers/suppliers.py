from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user_id
from app.schemas import schemas
from app.crud import crud
from uuid import UUID
from typing import List

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

@router.get("/", response_model=List[schemas.Supplier])
async def read_suppliers(user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.get_suppliers(db, user_id=user_id)

@router.post("/", response_model=schemas.Supplier)
async def create_supplier(supplier: schemas.SupplierCreate, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.create_supplier(db, supplier=supplier, user_id=user_id)
