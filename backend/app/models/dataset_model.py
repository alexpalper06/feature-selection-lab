from pathlib import Path

from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, TYPE_CHECKING

# Fixes the IDE error complaining
if TYPE_CHECKING:
    from app.models.fs_run_model import FSRun

class Dataset(SQLModel, table=True):
    """
    SQLModel combines the ORM table definition and the Pydantic schema in one class.
    `table=True` tells SQLModel to create a DB table for this class.
    Without it, the class is a pure Pydantic model (used for request/response shapes).
    """
    id: Optional[int] = Field(default=None, primary_key=True)

    # Display name assigned by user
    name: str

    # Optional notes about this dataset's context or origin
    description: Optional[str] = None

    # Absolute or relative path to the stored file (CSV / PKL)
    path_file: str

    # Shape of the dataset. Computed at upload time, stored for fast retrieval
    num_cols: int
    num_rows: int

    # JSON list of candidate target variable names.
    # sa_column is needed because SQLModel doesn't natively map list to a JSON column.
    # Example stored value: ["species", "label"]
    target_variables: List[str] = Field(default=[], sa_column=Column(JSON, nullable=False))

    # JSON list of class distribution.
    class_distribution: Dict[str, Any] = Field(default={}, sa_column=Column(JSON, nullable=False))

    # Auto-set to UTC now when the record is created
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # relation with fs_run_model
    r_fs_runs: List["FSRun"] = Relationship(
        back_populates="r_dataset",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "passive_deletes": True, # Tells SQLModel to not preload the list to delete, it relies on the SQL CASCADE
        },
    )

    @property
    def dataset_name(self):
        return Path(self.path_file).name
