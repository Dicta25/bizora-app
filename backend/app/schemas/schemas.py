from pydantic import BaseModel, ConfigDict, Field, AliasGenerator
from pydantic.alias_generators import to_camel
from uuid import UUID
from datetime import datetime
from typing import Optional, List

# Base config for all schemas to use camelCase in JSON
class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            serialization_alias=to_camel,
        ),
        populate_by_name=True,
        from_attributes=True
    )

# User Schemas
class UserBase(BaseSchema):
    phone: Optional[str] = None
    email: Optional[str] = None
    business_name: Optional[str] = Field(None, validation_alias="businessName")
    business_type: Optional[str] = Field(None, validation_alias="businessType")
    location: Optional[str] = None
    is_superadmin: bool = Field(False, validation_alias="isSuperadmin")
    subscription_plan: str = "Free"
    subscription_expiry: Optional[datetime] = None

class UserCreate(UserBase):
    id: UUID # From Supabase Auth

class UserUpdate(BaseSchema):
    phone: Optional[str] = None
    email: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    location: Optional[str] = None
    is_superadmin: Optional[bool] = None
    subscription_plan: Optional[str] = None
    subscription_expiry: Optional[datetime] = None

class User(UserBase):
    id: UUID
    created_at: datetime

# Product Schemas
class ProductBase(BaseSchema):
    name: str
    stock: int = 0
    price: float
    restock_level: int = 5
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseSchema):
    name: Optional[str] = None
    stock: Optional[int] = None
    price: Optional[float] = None
    restock_level: Optional[int] = None
    image_url: Optional[str] = None

class Product(ProductBase):
    id: UUID
    user_id: UUID
    created_at: datetime

# Customer Schemas
class CustomerBase(BaseSchema):
    name: str
    phone: Optional[str] = None
    balance: float = 0.0
    purchase_count: int = 0
    last_purchase_date: Optional[datetime] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseSchema):
    name: Optional[str] = None
    phone: Optional[str] = None
    balance: Optional[float] = None
    purchase_count: Optional[int] = None
    last_purchase_date: Optional[datetime] = None

class Customer(CustomerBase):
    id: UUID
    user_id: UUID
    created_at: datetime

# Sale Schemas
class SaleBase(BaseSchema):
    product_name: str
    quantity: int
    price_per_unit: float
    total_price: float
    payment_method: str
    date: datetime = datetime.utcnow()
    customer_id: Optional[UUID] = None
    customer_name: Optional[str] = None

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: UUID
    user_id: UUID

# Expense Schemas
class ExpenseBase(BaseSchema):
    amount: float
    description: str
    category: str
    date: datetime = datetime.utcnow()

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: UUID
    user_id: UUID

# Supplier Schemas
class SupplierBase(BaseSchema):
    name: str
    phone: str
    products: Optional[str] = None
    location: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: UUID
    user_id: UUID

# Stock History Schemas
class StockHistoryBase(BaseSchema):
    product_id: UUID
    delta: int
    reason: str
    date: datetime = datetime.utcnow()
    customer_name: Optional[str] = None

class StockHistory(StockHistoryBase):
    id: UUID
    user_id: UUID

# Broadcast Schemas
class BroadcastBase(BaseSchema):
    title: str
    message: str
    channel: str = "sms"
    audience_filter: str = "All"
    recipient_count: int = 0
    status: str = "Sent"

class BroadcastCreate(BroadcastBase):
    pass

class Broadcast(BroadcastBase):
    id: UUID
    admin_id: Optional[UUID]
    sent_at: datetime

# Audit Log Schemas
class AuditLogBase(BaseSchema):
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    business_name: Optional[str] = None

class AuditLog(AuditLogBase):
    id: UUID
    user_id: Optional[UUID]
    created_at: datetime

# Support Ticket Schemas
class SupportTicketBase(BaseSchema):
    subject: str
    message: str
    ticket_type: str = "Bug"
    priority: str = "Medium"
    status: str = "Open"

class SupportTicketCreate(SupportTicketBase):
    pass

class SupportTicket(SupportTicketBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    business_name: Optional[str] = None # Added for UI convenience

# System Setting Schemas
class SystemSettingBase(BaseSchema):
    key: str
    value: str
    description: Optional[str] = None

class SystemSettingUpdate(BaseSchema):
    value: str

class SystemSetting(SystemSettingBase):
    id: int
    updated_at: datetime
