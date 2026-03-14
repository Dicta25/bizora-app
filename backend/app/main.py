from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import auth, products, sales, expenses, customers, suppliers, admin
from app.core.config import settings

from fastapi.responses import Response

app = FastAPI(title=settings.PROJECT_NAME)

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content="", media_type="image/x-icon")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(expenses.router)
app.include_router(customers.router)
app.include_router(suppliers.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "Bizora API is running"}
