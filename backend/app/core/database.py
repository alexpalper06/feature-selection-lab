# app/core/database.py
from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings
from app.models import dataset_model, fs_run_model

# Added connection pooling optimizations for PostgreSQL
engine = create_engine(settings.DATABASE_URL)
"""
  pool_size=5,        # Number of connections to keep open
    max_overflow=10,    # Max additional connections to create if the pool is exhausted
    pool_pre_ping=True  # Verifies connections are alive before using them
"""

def init_db():
    """
    Creates all tables derived from SQLModel classes.
    Called once on startup from main.py.
    """
    # Ensures metadata is registered
    SQLModel.metadata.create_all(engine)

def get_session():
    """FastAPI dependency to obtain the database session per request."""
    with Session(engine) as session:
        yield session