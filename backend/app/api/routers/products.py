from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user_id
from app.schemas import schemas
from app.crud import crud
from uuid import UUID
from typing import List

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[schemas.Product])
async def read_products(user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.get_products(db, user_id=user_id)

@router.post("/", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.create_product(db, product=product, user_id=user_id)

@router.put("/{product_id}", response_model=schemas.Product)
async def update_product(product_id: UUID, product: schemas.ProductUpdate, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    db_product = await crud.get_product(db, product_id=product_id, user_id=user_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return await crud.update_product(db, product_id=product_id, product=product, user_id=user_id)

@router.delete("/{product_id}")
async def delete_product(product_id: UUID, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    await crud.delete_product(db, product_id=product_id, user_id=user_id)
    return {"status": "success"}

@router.get("/history", response_model=List[schemas.StockHistory])
async def read_all_stock_history(user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.get_stock_history(db, user_id=user_id)

@router.get("/{product_id}/history", response_model=List[schemas.StockHistory])
async def read_product_history(product_id: UUID, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.get_stock_history(db, user_id=user_id, product_id=product_id)
