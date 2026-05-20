from enum import Enum
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON, String
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

class RunStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class MethodCategory(str, Enum):
    FILTER = "filter"
    WRAPPER = "wrapper"

class FSRun(SQLModel, table=True):
    __tablename__ = "fs_run"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Foreign key — ON DELETE CASCADE is handled at the service layer (delete dataset → delete runs)
    dataset_id: int = Field(foreign_key="dataset.id", nullable=False)

    name: str
    method_name: str
    method_category: MethodCategory = Field(sa_column=Column(String, nullable=False))
    target_var: Optional[str] = None
    status: RunStatus = Field(default=RunStatus.PENDING, sa_column=Column(String, nullable=False))

    # JSON columns use sa_column for the same reason as Dataset.target_variables
    parameters: dict = Field(default={}, sa_column=Column(JSON, nullable=False))

    executed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    execution_time: Optional[float] = None
    error_message: Optional[str] = None

    accuracy: Optional[float] = None
    num_selected_features: Optional[int] = None
    selected_features: Optional[list] = Field(default=None, sa_column=Column(JSON))
    feature_scores: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    feature_rankings: Optional[dict] = Field(default=None, sa_column=Column(JSON))