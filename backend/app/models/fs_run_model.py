from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, ForeignKey, Integer
from datetime import datetime, timezone
from typing import Optional, List, Dict, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.dataset_model import Dataset

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

    # Foreign key. ON DELETE CASCADE is handled by the SQL engine
    dataset_id: int = Field(
        sa_column=Column(
            Integer,
            ForeignKey("dataset.id", ondelete="CASCADE"),
            nullable=False,
        )
    )

    name: str
    method_name: str
    method_category: MethodCategory = Field(sa_column=Column(String, nullable=False))
    # The target variable/attribute is mandatory in order to obtain an accuracy from a classifier model
    target_var: str
    status: RunStatus = Field(default=RunStatus.PENDING, sa_column=Column(String, nullable=False))

    # JSON columns use sa_column for the same reason as Dataset.target_variables
    parameters: Dict = Field(default={}, sa_column=Column(JSON, nullable=False))

    # Result and status of execution
    executed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    execution_time: Optional[float] = None
    error_message: Optional[str] = None

    # Result fields from the execution
    # Accuracy obtained by the classifier model
    accuracy: Optional[float] = None
    # Number of total selected features
    num_selected_features: Optional[int] = None
    # List of selected features
    selected_features: Optional[List] = Field(default=None, sa_column=Column(JSON))

    # Relationship with dataset table
    r_dataset: "Dataset" = Relationship(back_populates="r_fs_runs")
