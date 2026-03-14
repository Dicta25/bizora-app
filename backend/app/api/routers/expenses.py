from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user_id
from app.schemas import schemas
from app.crud import crud
from uuid import UUID
from typing import List

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.get("/", response_model=List[schemas.Expense])
async def read_expenses(user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.get_expenses(db, user_id=user_id)

@router.post("/", response_model=schemas.Expense)
async def create_expense(expense: schemas.ExpenseCreate, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await crud.create_expense(db, expense=expense, user_id=user_id)
