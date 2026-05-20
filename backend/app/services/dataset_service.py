import asyncio
from typing import Any, Sequence

from sqlalchemy import true
from sqlmodel import Session, select
from fastapi import UploadFile, HTTPException

from app.models.dataset_model import Dataset
from app.schemas.dataset_schema import DatasetCreate, DatasetUpdate, DatasetDetails, FileAnalysisResponse
from app.utils.file_utils import save_upload_file, delete_file, load_dataframe
from app.utils.dataset_utils import extract_shape

PREVIEW_ROWS = 10


async def analyze_uploaded_file(upload_file: UploadFile) -> FileAnalysisResponse:
    """
    Parses a local file immediately upon selection by the user without DB persistence.
    Allows column inspection and target selection before committing to the storage cluster.
    """
    try:
        # Pass the complete UploadFile object to extract both name extension and content stream
        df = await asyncio.to_thread(load_dataframe, upload_file)
        num_rows, num_cols = extract_shape(df)

        if num_rows == 0 or num_cols == 0:
            raise HTTPException(status_code=422, detail="Uploaded file is empty or invalid.")

        preview_df = df.head(PREVIEW_ROWS)
        columns = list(df.columns)
        rows = preview_df.to_dict(orient="records")

        return FileAnalysisResponse(
            columns=columns,
            rows=rows,
            num_rows=num_rows,
            num_cols=num_cols
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal analysis failure: {str(e)}")


async def create_dataset(session: Session, form: DatasetCreate, upload_file: UploadFile) -> Dataset:
    """
    Saves the file permanently and registers the user configuration in the DB.
    """
    # 1. Persist physical file permanently
    file_path = await asyncio.to_thread(save_upload_file, upload_file)

    try:
        # 2. Load into memory to verify dimensions match and extract structural info
        df = await asyncio.to_thread(load_dataframe, str(file_path))
        num_rows, num_cols = extract_shape(df)

        # Validate that user-selected targets actually exist within the data columns
        invalid_targets = [t for t in form.target_variables if t not in df.columns]
        if invalid_targets:
            raise HTTPException(
                status_code=400,
                detail=f"Selected target column(s) {invalid_targets} do not exist in the dataset."
            )

        # 3. Commit data
        dataset = Dataset(
            name=form.name,
            description=form.description,
            path_file=str(file_path),
            num_rows=num_rows,
            num_cols=num_cols,
            target_variables=form.target_variables,  # Injected from user form parameters
        )
        session.add(dataset)
        session.commit()
        session.refresh(dataset)
        return dataset

    except HTTPException:
        await asyncio.to_thread(delete_file, str(file_path))
        raise
    except Exception as e:
        await asyncio.to_thread(delete_file, str(file_path))
        raise HTTPException(status_code=500, detail=f"Unexpected error during upload processing: {e}")


def get_all_datasets(session: Session) -> Sequence[Dataset]:
    """Returns all datasets ordered by most recently uploaded first."""
    return session.exec(select(Dataset).order_by(Dataset.uploaded_at.desc())).all()


def get_dataset(session: Session, dataset_id: int) -> Dataset:
    """Fetch one dataset or raise 404."""
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found.")
    return dataset


def rename_dataset(session: Session, dataset_id: int, form: DatasetUpdate) -> Dataset:
    """Updates the name field of an existing dataset."""
    dataset = get_dataset(session, dataset_id)
    dataset.name = form.name
    session.add(dataset)
    session.commit()
    session.refresh(dataset)
    return dataset


def delete_dataset(session: Session, dataset_id: int) -> None:
    """Deletes the dataset record AND its physical file on disk."""
    from app.models.fs_run_model import FSRun

    dataset = get_dataset(session, dataset_id)

    runs = session.exec(select(FSRun).where(FSRun.dataset_id == dataset_id)).all()
    for run in runs:
        session.delete(run)

    delete_file(dataset.path_file)
    session.delete(dataset)
    session.commit()


async def get_dataset_details(session: Session, dataset_id: int) -> DatasetDetails:
    """Loads a saved file and returns metadata along with preview rows."""
    dataset = get_dataset(session, dataset_id)

    df = await asyncio.to_thread(load_dataframe, dataset.path_file)
    preview_df = df.head(PREVIEW_ROWS)

    return DatasetDetails(
        id=dataset.id,
        name=dataset.name,
        num_rows=dataset.num_rows,
        num_cols=dataset.num_cols,
        target_variables=dataset.target_variables,
        uploaded_at=dataset.uploaded_at,
        dataset_name=dataset.dataset_name,
        columns=list(df.columns),
        rows=preview_df.to_dict(orient="records"),
    )