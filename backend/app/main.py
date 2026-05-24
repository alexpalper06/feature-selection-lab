from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router
from app.core.database import init_db
from contextlib import asynccontextmanager


# https://fastapi.tiangolo.com/advanced/events/
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables on first run (dev convenience). Can use alembic migrations in the future for production."""
    init_db()
    yield


app = FastAPI(
    title="Feature Selector Lab",
    version="0.1.0",
    description="API for dataset management and feature selection analysis.",
    lifespan=lifespan,
)

# CORS  allows the React dev server (port 5173) to call this API.
# In production, replace the wildcard with your actual domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routes
app.include_router(router)

"""
This is deprecated, use lifespan instead
@app.on_event("startup")
def on_startup():
    Create DB tables on first run (dev convenience).
    Replace with Alembic migrations when moving to production.
    init_db()
"""


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
