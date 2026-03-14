from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.db import models
from app.schemas import schemas
from uuid import UUID
from typing import List, Optional
from datetime import datetime

# --- USER ---
async def get_user(db: AsyncSession, user_id: UUID):
    result = await db.execute(select(models.User).filter(models.User.id == user_id))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(models.User).filter(models.User.email == email))
    return result.scalars().first()

async def get_user_by_phone(db: AsyncSession, phone: str):
    result = await db.execute(select(models.User).filter(models.User.phone == phone))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: schemas.UserCreate):
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def delete_user(db: AsyncSession, user_id: UUID):
    await db.execute(delete(models.User).where(models.User.id == user_id))
    await db.commit()

async def update_user_admin(db: AsyncSession, user_id: UUID, user_update: schemas.UserUpdate):
    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        return await get_user(db, user_id)
        
    await db.execute(
        update(models.User)
        .where(models.User.id == user_id)
        .values(**update_data)
    )
    await db.commit()
    return await get_user(db, user_id)

# --- PRODUCT ---
async def get_products(db: AsyncSession, user_id: UUID):
    result = await db.execute(select(models.Product).filter(models.Product.user_id == user_id))
    return result.scalars().all()

async def create_product(db: AsyncSession, product: schemas.ProductCreate, user_id: UUID):
    db_product = models.Product(**product.model_dump(), user_id=user_id)
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

async def update_product(db: AsyncSession, product_id: UUID, product: schemas.ProductUpdate, user_id: UUID):
    await db.execute(
        update(models.Product)
        .where(models.Product.id == product_id, models.Product.user_id == user_id)
        .values(**product.model_dump(exclude_unset=True))
    )
    await db.commit()
    return await get_product(db, product_id, user_id)

async def get_product(db: AsyncSession, product_id: UUID, user_id: UUID):
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id, models.Product.user_id == user_id))
    return result.scalars().first()

async def delete_product(db: AsyncSession, product_id: UUID, user_id: UUID):
    await db.execute(delete(models.Product).where(models.Product.id == product_id, models.Product.user_id == user_id))
    await db.commit()

# --- SALE ---
async def get_sales(db: AsyncSession, user_id: UUID):
    result = await db.execute(select(models.Sale).filter(models.Sale.user_id == user_id).order_by(models.Sale.date.desc()))
    return result.scalars().all()

async def record_sale(db: AsyncSession, sale: schemas.SaleCreate, user_id: UUID):
    # Atomic transaction for: 1. Record Sale, 2. Update Stock, 3. Update Customer Balance, 4. Stock History
    async with db.begin():
        # 1. Record Sale
        db_sale = models.Sale(**sale.model_dump(), user_id=user_id)
        db.add(db_sale)
        
        # 2. Update Product Stock
        result = await db.execute(select(models.Product).filter(models.Product.name == sale.product_name, models.Product.user_id == user_id))
        product = result.scalars().first()
        if product:
            product.stock = max(0, product.stock - sale.quantity)
            
            # 4. Stock History
            db_history = models.StockHistory(
                user_id=user_id,
                product_id=product.id,
                delta=-sale.quantity,
                reason="Sale",
                date=sale.date,
                customer_name=sale.customer_name
            )
            db.add(db_history)

        # 3. Update Customer Balance & Count
        if sale.customer_id:
            result = await db.execute(select(models.Customer).filter(models.Customer.id == sale.customer_id, models.Customer.user_id == user_id))
            customer = result.scalars().first()
            if customer:
                if sale.payment_method == "credit":
                    customer.balance += sale.total_price
                customer.purchase_count += 1
                customer.last_purchase_date = sale.date
                
        return db_sale

# --- EXPENSE ---
async def get_expenses(db: AsyncSession, user_id: UUID):
    result = await db.execute(select(models.Expense).filter(models.Expense.user_id == user_id).order_by(models.Expense.date.desc()))
    return result.scalars().all()

async def create_expense(db: AsyncSession, expense: schemas.ExpenseCreate, user_id: UUID):
    db_expense = models.Expense(**expense.model_dump(), user_id=user_id)
    db.add(db_expense)
    await db.commit()
    await db.refresh(db_expense)
    return db_expense

# --- CUSTOMER ---
async def get_customers(db: AsyncSession, user_id: UUID):
    result = await db.execute(select(models.Customer).filter(models.Customer.user_id == user_id))
    return result.scalars().all()

async def create_customer(db: AsyncSession, customer: schemas.CustomerCreate, user_id: UUID):
    db_customer = models.Customer(**customer.model_dump(), user_id=user_id)
    db.add(db_customer)
    await db.commit()
    await db.refresh(db_customer)
    return db_customer

async def update_customer(db: AsyncSession, customer_id: UUID, customer: schemas.CustomerUpdate, user_id: UUID):
    await db.execute(
        update(models.Customer)
        .where(models.Customer.id == customer_id, models.Customer.user_id == user_id)
        .values(**customer.model_dump(exclude_unset=True))
    )
    await db.commit()
    return await get_customer(db, customer_id, user_id)

async def get_customer(db: AsyncSession, customer_id: UUID, user_id: UUID):
    result = await db.execute(select(models.Customer).filter(models.Customer.id == customer_id, models.Customer.user_id == user_id))
    return result.scalars().first()

# --- SUPPLIER ---
async def get_suppliers(db: AsyncSession, user_id: UUID):
    result = await db.execute(select(models.Supplier).filter(models.Supplier.user_id == user_id))
    return result.scalars().all()

async def create_supplier(db: AsyncSession, supplier: schemas.SupplierCreate, user_id: UUID):
    db_supplier = models.Supplier(**supplier.model_dump(), user_id=user_id)
    db.add(db_supplier)
    await db.commit()
    await db.refresh(db_supplier)
    return db_supplier

# --- ADMIN (GLOBAL) ---
async def get_all_users(db: AsyncSession):
    result = await db.execute(select(models.User).order_by(models.User.created_at.desc()))
    return result.scalars().all()

async def get_global_stats(db: AsyncSession):
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    # 1. Basic Counts
    user_count_res = await db.execute(select(func.count(models.User.id)))
    user_count = user_count_res.scalar() or 0
    
    sales_total_res = await db.execute(select(func.sum(models.Sale.total_price)))
    sales_total = float(sales_total_res.scalar() or 0.0)
    
    sales_count_res = await db.execute(select(func.count(models.Sale.id)))
    sales_count = sales_count_res.scalar() or 0
    
    # 2. Activity (Last 7 days)
    activity_data = []
    for i in range(6, -1, -1):
        target_date = datetime.utcnow().date() - timedelta(days=i)
        next_day = target_date + timedelta(days=1)
        
        # Count unique users who made a sale on this day
        daily_active_res = await db.execute(
            select(func.count(func.distinct(models.Sale.user_id)))
            .filter(models.Sale.date >= target_date, models.Sale.date < next_day)
        )
        activity_data.append({
            "name": target_date.strftime("%a"),
            "active": daily_active_res.scalar() or 0
        })

    # 3. Critical Alerts (e.g. Low Stock across system)
    low_stock_res = await db.execute(
        select(func.count(models.Product.id))
        .filter(models.Product.stock <= models.Product.restock_level, models.Product.stock > 0)
    )
    
    return {
        "totalUsers": user_count,
        "totalRevenue": sales_total,
        "totalSalesCount": sales_count,
        "systemHealth": "ok",
        "activity": activity_data,
        "alertsCount": low_stock_res.scalar() or 0
    }

async def get_user_stats(db: AsyncSession, user_id: UUID):
    from sqlalchemy import func

    sales_total_res = await db.execute(select(func.sum(models.Sale.total_price)).filter(models.Sale.user_id == user_id))
    sales_count_res = await db.execute(select(func.count(models.Sale.id)).filter(models.Sale.user_id == user_id))
    product_count_res = await db.execute(select(func.count(models.Product.id)).filter(models.Product.user_id == user_id))

    return {
        "totalRevenue": float(sales_total_res.scalar() or 0.0),
        "totalSalesCount": sales_count_res.scalar() or 0,
        "totalProducts": product_count_res.scalar() or 0
    }

async def get_user_products_admin(db: AsyncSession, user_id: UUID):
    result = await db.execute(select(models.Product).filter(models.Product.user_id == user_id))
    return result.scalars().all()

async def get_all_sales(db: AsyncSession, limit: int = 100):
    # Joining with User to get the business name for the ledger
    query = (
        select(models.Sale, models.User.business_name)
        .join(models.User, models.Sale.user_id == models.User.id)
        .order_by(models.Sale.date.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    
    # We'll return a list of dictionaries that include the business name
    sales = []
    for row in result.all():
        sale_dict = schemas.Sale.model_validate(row[0]).model_dump()
        sale_dict["businessName"] = row[1]
        sales.append(sale_dict)
    return sales

# --- STOCK HISTORY ---
async def get_stock_history(db: AsyncSession, user_id: UUID, product_id: Optional[UUID] = None):
    query = select(models.StockHistory).filter(models.StockHistory.user_id == user_id)
    if product_id:
        query = query.filter(models.StockHistory.product_id == product_id)
    result = await db.execute(query.order_by(models.StockHistory.date.desc()))
    return result.scalars().all()
