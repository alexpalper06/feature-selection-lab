from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Any, Optional, List, Dict


# Request DTOs

class DatasetCreate(SQLModel):
    """Fields accepted from the upload form when confirming the creation."""
    name: str = Field(min_length=1, description="Display name for the dataset")
    description: Optional[str] = None
    target_variables: List[str] = Field(description="Selected target columns from the user for classification")


class DatasetUpdate(SQLModel):
    """Body for the PATCH /datasets/{id} renaming."""
    name: str = Field(min_length=1, description="New name — cannot be empty")


# Response DTOs

class FileAnalysisResponse(SQLModel):
    """Returned immediately after choosing a local file to populate the UI preview."""
    columns: List[str]           # All columns available for selection
    rows: List[Dict[str, Any]]   # First N rows to render a preview matrix
    num_rows: int
    num_cols: int


class DatasetRead(SQLModel):
    """Shape returned for list and detail views."""
    id: int
    name: str
    description: Optional[str] = None
    num_cols: int
    num_rows: int
    target_variables: List[str]
    uploaded_at: datetime


class DatasetPreview(SQLModel):
    """Returned by GET /datasets/{id}/preview, information + first N rows."""
    id: int
    name: str
    num_rows: int
    num_cols: int
    target_variables: List[str]
    columns: List[str]
    rows: List[Dict[str, Any]]