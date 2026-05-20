# app/api/v1/datasets.py
from fastapi import APIRouter, Depends, UploadFile, File, Form, status, Query
from sqlmodel import Session
from typing import List, Optional

from app.api.deps import get_session
from app.schemas.dataset_schema import (
    DatasetRead,
    DatasetUpdate,
    DatasetDetails,
    DatasetCreate,
    FileAnalysisResponse
)
from app.services import dataset_service

# The route will begin starting from /datasets in the next routers annotations the paths will be built upon the
# establised prefix. For example if one route is /, the real URL is "/datasets", if its /analyze, it'd be "/datasets/analyze"
router = APIRouter(prefix="/datasets", tags=["Datasets"])


# With "..." we indicate that the value is required. If we want it to be optional, we can use None
@router.post("/analyze", response_model=FileAnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_dataset_file(
    file: UploadFile = File(...),
):
    """
    First part of uploading the dataset. First parses the file to obtain a preview so the user chan choose the target attributes.
    Extracts column names and row for preview without saving to DB.
    """
    return await dataset_service.analyze_uploaded_file(file)


@router.post("/", response_model=DatasetRead, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    name: str = Form(..., min_length=1, description="Display name for the dataset"),
    description: Optional[str] = Form(None),
    target_variables: List[str] = Form(..., description="Target features selected by the user"),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    """
    Second part of uploading the dataset. Confirms upload and commits to database.
    """
    form_data = DatasetCreate(
        name=name,
        description=description,
        target_variables=target_variables
    )
    return await dataset_service.create_dataset(session, form_data, file)


@router.get("/", response_model=List[DatasetRead])
def list_datasets(session: Session = Depends(get_session)):
    """Returns all uploaded datasets, newest first."""
    return dataset_service.get_all_datasets(session)


@router.get("/{dataset_id}", response_model=DatasetDetails)
async def get_dataset(dataset_id: int, session: Session = Depends(get_session)):
    """Returns database metadata for a single dataset."""
    return await dataset_service.get_dataset_details(session, dataset_id)


@router.patch("/{dataset_id}", response_model=DatasetRead)
def rename_dataset(
    dataset_id: int,
    body: DatasetUpdate,
    session: Session = Depends(get_session),
):
    """Rename an existing dataset."""
    return dataset_service.rename_dataset(session, dataset_id, body)


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(dataset_id: int, session: Session = Depends(get_session)):
    """Permanently deletes data configuration and server storage files."""
    dataset_service.delete_dataset(session, dataset_id)