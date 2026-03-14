from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import auth, products, sales, expenses, customers, suppliers, admin
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# Simple request logger to help debug
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"DEBUG: Incoming {request.method} to {request.url.path}")
    response = await call_next(request)
    print(f"DEBUG: Response status: {response.status_code}")
    return response

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content="", media_type="image/x-icon")

# Set up CORS - Standard for Bearer Token Auth
# Using * with allow_credentials=False is very robust for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
