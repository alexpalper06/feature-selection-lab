# app/utils/file.py
import shutil
from pathlib import Path
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


def load_dataframe(file_path: str) -> pd.DataFrame:
    """
    Loads engine matrices dynamically depending on the file extensions.
    Supports csv, xlsx, and parquet.
    """
    path = Path(file_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Dataset file not found on disk.")

    ext = path.suffix.lower()
    try:
        if ext == ".csv":
            # sep=None relies on the engine sniffer to isolate commas, semi-colons, and tabs
            return pd.read_csv(path, sep=None, engine="python")
        elif ext in [".xlsx", ".xls"]:
            return pd.read_excel(path)
        elif ext == ".parquet":
            return pd.read_parquet(path)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file format extension: {ext}")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Data parsing sequence structural breakdown: {str(e)}")