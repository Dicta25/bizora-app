import asyncio
import uuid
from sqlalchemy import select
from app.db.database import async_session
from app.db.models import User
from app.core.security import get_password_hash

async def seed_data():
    async with async_session() as session:
        # 1. Create/Update Admin
        # We'll use a standard format for the phone number
        admin_phone = "0558478446"
        res = await session.execute(select(User).filter(User.phone == admin_phone))
        db_admin = res.scalars().first()
        
        hashed_pw = get_password_hash("benedicta123")
        
        if db_admin:
            db_admin.is_superadmin = True
            db_admin.hashed_password = hashed_pw
            db_admin.business_name = "Bizora HQ"
            db_admin.business_type = "Super Admin"
            print(f"✅ UPDATED: Admin profile for {admin_phone}")
        else:
            new_admin = User(
                id=uuid.uuid4(),
                phone=admin_phone,
                email="admin@bizora.com",
                hashed_password=hashed_pw,
                business_name="Bizora HQ",
                business_type="Super Admin",
                location="Accra, GH",
                is_superadmin=True,
                subscription_plan="Enterprise"
            )
            session.add(new_admin)
            print(f"✅ CREATED: Admin profile for {admin_phone}")

        # 2. Create a Test User (for standard login)
        test_phone = "0241234567"
        res = await session.execute(select(User).filter(User.phone == test_phone))
        db_test = res.scalars().first()
        
        if not db_test:
            test_user = User(
                id=uuid.uuid4(),
                phone=test_phone,
                email="test@example.com",
                hashed_password=get_password_hash("1234"), # Simple PIN for testing
                business_name="Akua's Kente Store",
                business_type="Trader",
                location="Kantamanto, Accra",
                is_superadmin=False,
                subscription_plan="Pro"
            )
            session.add(test_user)
            print(f"✅ CREATED: Test User for {test_phone}")
        
        await session.commit()
        print("🚀 Seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
