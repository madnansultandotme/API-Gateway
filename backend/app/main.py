from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, close_db
from app.routers import auth, api_keys, plans, subscriptions, usage, services, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(
    title="API Platform",
    description="Multi-tenant API Gateway with Usage Tracking",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(api_keys.router)
app.include_router(plans.router)
app.include_router(subscriptions.router)
app.include_router(usage.router)
app.include_router(services.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "API Platform is running", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
