# app/utils/file.py
import shutil
from pathlib import Path
from typing import BinaryIO

import pandas as pd
from fastapi import UploadFile, HTTPException
from app.core.config import settings


def save_upload_file(upload_file: UploadFile) -> Path:
    """
    Persists incoming network multipart files directly to system disk.
    Uses chunked streaming transfers to maintain low memory footprints.
    """
    # Prevent path-traversal vulnerabilities by extracting strictly the base file descriptor
    safe_filename = Path(upload_file.filename).name
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / safe_filename

    # Secure stream transfer block
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path


def delete_file(file_path: str) -> None:
    """Safely purges physical files from system disk spaces."""
    path = Path(file_path)
    if path.exists() and path.is_file():
        path.unlink()


def load_dataframe(file_obj: str | Path | UploadFile) -> pd.DataFrame:
    """
    Loads data matrices dynamically from either a system file path
    or an in-memory FastAPI UploadFile stream.
    Supports CSV, XLSX, and Parquet.
    """
    # Case 1: Database-persisted dataset file path
    if isinstance(file_obj, (str, Path)):
        path = Path(file_obj)
        print(path)
        if not path.exists():
            raise HTTPException(status_code=404, detail="Dataset file not found on disk.")
        ext = path.suffix.lower()
        file_target = path  # Pandas can accept Path objects directly

    # Case 2: In-memory stream directly from the network payload
    else:
        if not file_obj.filename:
            raise HTTPException(status_code=400, detail="Uploaded file is missing a valid filename.")
        # Obtain extension of the file
        ext = Path(file_obj.filename).suffix.lower()
        print(Path(file_obj.filename))
        # Reset the stream cursor to ensure full file readability
        file_obj.file.seek(0)
        file_target = file_obj.file  # SpooledTemporaryFile behaves like a standard BinaryIO stream

    # Execute parser engine based on file footprint extension
    try:
        if ext == ".csv":
            # sep=None relies on the python engine sniffer to isolate commas, semi-colons, and tabs
            return pd.read_csv(file_target, sep=None, engine="python")
        elif ext in [".xlsx", ".xls"]:
            return pd.read_excel(file_target)
        elif ext == ".parquet":
            return pd.read_parquet(file_target)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file format extension: {ext}")
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Parsing error: Ensure your file format matches its extension. Details: {str(e)}"
        )