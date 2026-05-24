from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlmodel import Session
from typing import List, Optional

from app.api.deps import get_session
from app.datamining.feature_selectors import BaseFeatureSelector
from app.schemas.fs_run_schema import (
    FSRunCreate,
    FSRunRead,
    FSRunReadDetails,
    FeatureSelectionMethods, FSRunUpdate
)
from app.services import feature_selection_service

router = APIRouter(prefix="/datasets", tags=["Feature Selection module for Dataset"])


@router.get("/methods", response_model=List[FeatureSelectionMethods])
def get_available_methods(session: Session = Depends(get_session)):
    """Get list of available feature selection methods and their parameters."""
    return feature_selection_service.get_available_methods()


# HTTP status 202 for indicating that it's being accepted for processing, but is not yet complete
# https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/202
@router.post("/{dataset_id}/runs", response_model=FSRunRead, status_code=status.HTTP_202_ACCEPTED)
async def submit_fs_run(dataset_id: int, form: FSRunCreate, background_tasks: BackgroundTasks,
                        session: Session = Depends(get_session)):
    """
    Submit a new FS run for background execution.
    Returns immediately with run status=PENDING.
    """
    return feature_selection_service.create_fs_run(
        session=session,
        background_tasks=background_tasks,
        dataset_id=dataset_id,
        form=form
    )


@router.get("/{dataset_id}/runs", response_model=List[FSRunRead])
def list_fs_runs(dataset_id: int, target_var: Optional[str] = None, session: Session = Depends(get_session)):
    """Get all FS runs for a specific dataset. Omits result details for easier loading."""
    return feature_selection_service.get_all_fs_runs(session, dataset_id, target_var)


@router.get("/{dataset_id}/runs/{run_id}", response_model=FSRunReadDetails)
def get_fs_run_details(dataset_id: int, run_id: int, session: Session = Depends(get_session)):
    """Get information about a specific FS run details, such as selected features and parameters."""
    return feature_selection_service.get_fs_run(session, run_id, dataset_id)


@router.patch("/{dataset_id}/runs/{run_id}", response_model=FSRunRead)
def rename_fs_run(dataset_id: int, run_id: int, form: FSRunUpdate, session: Session = Depends(get_session)):
    """Rename a specific feature selection run."""
    return feature_selection_service.rename_fs_run(session, run_id, dataset_id, form)


@router.delete("/{dataset_id}/runs/{run_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fs_run(dataset_id: int, run_id: int, session: Session = Depends(get_session)):
    """Delete a specific feature selection run from the database."""
    feature_selection_service.delete_fs_run(session, run_id, dataset_id)
