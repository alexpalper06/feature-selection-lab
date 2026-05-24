# app/utils/file.py
import shutil
import uuid
from pathlib import Path
import re
import unicodedata
import pandas as pd
from fastapi import UploadFile, HTTPException
from app.core.config import settings


def save_upload_file(upload_file: UploadFile) -> Path:
    """
    Persists incoming network multipart files directly to system disk.
    Uses chunked streaming transfers to maintain low memory footprints.
    """
    # Prevent path-traversal vulnerabilities by extracting strictly the base file descriptor
    file_path = Path(upload_file.filename)

    complete_filename = f"{file_path.stem}_{uuid.uuid4().hex}{file_path.suffix}"
    upload_dir = Path(settings.UPLOAD_DIR)

    file_path = upload_dir / complete_filename

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
    # Loads Database-persisted dataset file path
    if isinstance(file_obj, (str, Path)):
        path = Path(file_obj)
        if not path.exists():
            raise HTTPException(status_code=404, detail="Dataset file not found on disk.")
        ext = path.suffix.lower()
        file_target = path  # Pandas can accept Path objects directly

    # Loads In-memory stream directly from the network payload
    else:
        if not file_obj.filename:
            raise HTTPException(status_code=400, detail="Uploaded file is missing a valid filename.")
        # Obtain extension of the file
        ext = Path(file_obj.filename).suffix.lower()
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


def sanitize_filename(filename: str) -> str:
    """
    Sanitizes an incoming filename to ensure it is safe for filesystem structures and database indexing.
    """
    if not filename:
        return "uploaded_file.csv"

    # Extracts the base filename
    base_name = Path(filename).name

    # Obtains the name and the suffix
    path_obj = Path(base_name)
    stem = path_obj.stem
    suffix = path_obj.suffix.lower()

    # Remove unicode characters that are not fit for storing such as tildes
    stem = unicodedata.normalize('NFKD', stem).encode('ascii', 'ignore').decode('ascii')

    # Remove anything that isn't alphanumeric, underscores, or dots
    stem = re.sub(r'[^\w\s.-]', '', stem)

    # Convert a single or multiple spaces into an underscore
    stem = re.sub(r'[\s]+', '_', stem).strip('_')

    # If the filename was formed of pure symbols (e.g., "%%%.csv"), provide a default stem
    if not stem:
        stem = "uploaded_file"

    return f"{stem}{suffix}"
