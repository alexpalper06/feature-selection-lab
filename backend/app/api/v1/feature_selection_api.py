from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlmodel import Session
from typing import List

from app.api.deps import get_session
from app.schemas.fs_run_schema import (
    FSRunCreate,
    FSMethodsResponse,
    FSRunRead
)
from app.services import feature_selection_service as fs_service

router = APIRouter(prefix="/fs", tags=["Feature Selection"])


@router.get("/methods", status_code=status.HTTP_200_OK)
async def get_available_methods():
    """Get list of available feature selection methods and their parameters."""
    return fs_service.get_available_methods()


@router.post("/datasets/{dataset_id}/runs", response_model=FSRunRead, status_code=status.HTTP_202_ACCEPTED)
async def submit_fs_run( dataset_id: int, form: FSRunCreate, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """
    Submit a new FS run for background execution.
    Returns immediately with run status=PENDING.
    Backend executes asynchronously and updates results when complete.
    """
    return fs_service.create_fs_run(session, dataset_id, form, background_tasks)


@router.get("/datasets/{dataset_id}/runs", response_model=List[FSRunRead], status_code=status.HTTP_200_OK)
def list_fs_runs( dataset_id: int, session: Session = Depends(get_session)):
    """Get all FS runs for a specific dataset."""
    return fs_service.get_fs_runs(session, dataset_id)


@router.get("/datasets/{dataset_id}/runs/{run_id}", response_model=FSRunRead, status_code=status.HTTP_200_OK
)
def get_fs_run_details(
    dataset_id: int,
    run_id: int,
    session: Session = Depends(get_session)
):
    """Get detailed information about a specific FS run."""
    return fs_service.get_fs_run_details(session, dataset_id, run_id)


@router.delete(
    "/datasets/{dataset_id}/runs/{run_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_fs_run(
    dataset_id: int,
    run_id: int,
    session: Session = Depends(get_session)
):
    """Delete a FS run from the history."""
    fs_service.delete_fs_run(session, dataset_id, run_id)
