import time

from sqlalchemy.orm import defer
from sqlmodel import Session, select
from fastapi import HTTPException, BackgroundTasks
from app.core.database import engine
from app.models.fs_run_model import FSRun, RunStatus
from app.models.dataset_model import Dataset
from app.datamining.feature_selectors import FS_REGISTRY
from app.utils.file_utils import load_dataframe
import app.datamining.classifiers as classifiers
from app.schemas.fs_run_schema import (
    FSRunCreate, FSRunUpdate,
)
from typing import Sequence, Optional


def get_available_methods():
    methods = []
    for name, cls in FS_REGISTRY.items():
        methods.append({
            "name": cls.name,
            "category": cls.category,
            "description": cls.description,
            "parameters": cls.parameters_schema
        })
    return methods


def create_fs_run(session: Session, background_tasks: BackgroundTasks, dataset_id: int, form: FSRunCreate) -> FSRun:
    """
    Creates a FS run record and immediately registers it to run in the background.
    """
    # Validate dataset and method
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")

    if form.method_name not in FS_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Method {form.method_name} not found")

    # Persist the initial state as PENDING
    fs_run = FSRun(
        dataset_id=dataset_id,
        name=form.name,
        method_name=form.method_name,
        method_category=form.method_category,
        target_var=form.target_var,
        parameters=form.parameters,
        status=RunStatus.PENDING
    )

    session.add(fs_run)
    session.commit()
    session.refresh(fs_run)  # required for the PK of the entry

    # Feature selection and accuracy processing runs in background while the service layer returns the FSRun data
    background_tasks.add_task(
        execute_fs_flow,
        run_id=fs_run.id,
        dataset_id=dataset_id,
        target_var=form.target_var,
        method_name=form.method_name,
        parameters=form.parameters
    )

    # Return immediately to the client with Status: PENDING
    return fs_run


def execute_fs_flow(run_id: int, dataset_id: int, target_var: str, method_name: str, parameters: dict) -> None:
    """
    CPU bound operations must be run synchronous. This uses a new session as its used as a background operation.
    """
    # Instantiate a standalone connection context safe for threaded tasks
    with Session(engine) as session:
        run_instance = session.get(FSRun, run_id)
        dataset_record = session.get(Dataset, dataset_id)

        if not run_instance or not dataset_record:
            return

        try:
            # Transition to RUNNING phase
            run_instance.status = RunStatus.RUNNING
            session.add(run_instance)
            session.commit()

            start_time = time.time()

            # Load data
            df = load_dataframe(dataset_record.path_file)
            X = df.drop(columns=[target_var])
            y = df[target_var]

            # Execution of Feature Selection
            selector_class = FS_REGISTRY[method_name]
            selector_instance = selector_class(**parameters)
            selected_features = selector_instance.select_features(X, y)

            # Obtains accuracy evaluating a classifier model
            accuracy = classifiers.knn_evaluate(X, y, selected_features)

            # Updating metrics for fs_run instance
            run_instance.execution_time = time.time() - start_time
            run_instance.accuracy = accuracy
            run_instance.num_selected_features = len(selected_features)
            run_instance.selected_features = selected_features
            run_instance.status = RunStatus.COMPLETED

        except Exception as e:
            session.rollback()
            run_instance.status = RunStatus.FAILED
            run_instance.error_message = str(e)
        finally:
            session.add(run_instance)
            session.commit()


def get_all_fs_runs(session: Session, dataset_id: int, target_var: Optional[str] = None) -> Sequence[FSRun]:
    """
    Obtains a list of FS runs of a given dataset ordered by creation of the execution time.
    """
    query = select(FSRun).order_by(FSRun.executed_at.desc()).where(FSRun.dataset_id == dataset_id)

    # Filter by target_var if provided
    if target_var:
        query = query.where(FSRun.target_var == target_var)

    # Exclude heavy JSON objects from the DB query
    query = query.options(
        defer(FSRun.parameters),
        defer(FSRun.selected_features),
    )
    return session.exec(query).all()


"""
The next obtains, renames and deletes a single fs run given its id. We also request the dataset id
to ensure a correct retrieval or modification of an entry relationship with the dataset table
"""


def get_fs_run(session: Session, run_id: int, dataset_id: int) -> FSRun:
    fs_run = session.get(FSRun, run_id)
    # We ensure that the relationship between a dataset and its run
    if not fs_run or fs_run.dataset_id != dataset_id:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found for dataset {dataset_id}")
    return fs_run


def rename_fs_run(session: Session, run_id: int, dataset_id: int, form: FSRunUpdate) -> FSRun:
    fs_run = get_fs_run(session, run_id, dataset_id)
    fs_run.name = form.name
    session.add(fs_run)
    session.commit()
    session.refresh(fs_run)
    return fs_run


def delete_fs_run(session: Session, run_id: int, dataset_id: int):
    fs_run = get_fs_run(session, run_id, dataset_id)
    session.delete(fs_run)
    session.commit()
