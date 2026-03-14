import asyncio
import uuid
from sqlalchemy import select
from app.db.database import async_session
from app.db.models import User
from app.core.security import get_password_hash

async def create_admin():
    async with async_session() as session:
        # Check if user already exists
        res = await session.execute(select(User).filter(User.phone == "0558478446"))
        db_user = res.scalars().first()
        
        hashed_pw = get_password_hash("benedicta123")
        
        if db_user:
            db_user.is_superadmin = True
            db_user.hashed_password = hashed_pw
            db_user.business_name = "Bizora HQ"
            db_user.business_type = "Super Admin"
            print(f"✅ FORCED: Updated existing user {db_user.phone} to SUPER ADMIN")
        else:
            new_admin = User(
                id=uuid.uuid4(),
                phone="0558478446",
                email="benedicta@gmail.com",
                hashed_password=hashed_pw,
                business_name="Bizora HQ",
                business_type="Super Admin",
                location="Accra, GH",
                is_superadmin=True,
                subscription_plan="Enterprise"
            )
            session.add(new_admin)
            print(f"✅ Created new Admin profile for {new_admin.phone}")
        
        await session.commit()

if __name__ == "__main__":
    asyncio.run(create_admin())
