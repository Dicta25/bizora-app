from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core import security
from app.schemas import schemas
from app.crud import crud
from uuid import UUID
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.User)
async def register(user_in: schemas.UserCreate, password: str, db: AsyncSession = Depends(get_db)):
    # Check if user exists by phone or email
    if user_in.email:
        db_user = await crud.get_user_by_email(db, email=user_in.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    if user_in.phone:
        db_user = await crud.get_user_by_phone(db, phone=user_in.phone)
        if db_user:
            raise HTTPException(status_code=400, detail="Phone already registered")

    # Hash the password and create user
    user_dict = user_in.model_dump()
    user_dict["hashed_password"] = security.get_password_hash(password)
    
    from app.db import models
    db_user = models.User(**user_dict)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # Standard OAuth2 form uses 'username' field - we'll treat it as phone or email
    user = await crud.get_user_by_email(db, email=form_data.username)
    if not user:
        user = await crud.get_user_by_phone(db, phone=form_data.username)
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
async def read_user_me(user_id: UUID = Depends(security.get_current_user_id), db: AsyncSession = Depends(get_db)):
    db_user = await crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User profile not found")
    return db_user
