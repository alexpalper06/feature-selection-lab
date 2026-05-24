from pydantic import BaseModel
from sqlmodel import SQLModel
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.datamining.feature_selectors import ParameterSpec
from app.models.fs_run_model import MethodCategory, RunStatus


# Request DTOs

class FSRunCreate(SQLModel):
    """Schema for creating/submitting a new FS run."""
    name: str
    method_name: str
    method_category: MethodCategory
    target_var: str
    parameters: Dict[str, Any] = {}

class FSRunUpdate(SQLModel):
    """Schema for updating an existing FS run."""
    name: str

# Response DTOs
class FeatureSelectionMethods(BaseModel):
    """Schema for feature selection methods registry."""
    name: str
    category: MethodCategory
    description: str
    parameters: List[ParameterSpec]


class FSRunRead(SQLModel):
    """
    Schema for reading an existing FS run.
    """
    id: int
    dataset_id: int
    name: str
    method_name: str
    method_category: MethodCategory
    target_var: str
    status: RunStatus
    executed_at: datetime
    execution_time: Optional[float] = None
    error_message: Optional[str] = None
    accuracy: Optional[float] = None

class FSRunReadDetails(SQLModel):
    """
    Schema for reading the details of an existing FS run. This will be used for
    partial loading as the other data will already be loaded
    """
    parameters: Dict[str, Any]
    num_selected_features: Optional[int] = None
    selected_features: Optional[list] = None

