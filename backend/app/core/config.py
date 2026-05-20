from pydantic_settings import BaseSettings
from pathlib import Path


# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Needs full path for retrieving the env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    UPLOAD_DIR: str = "backend/storage/datasets"
    MAX_UPLOAD_MB: int = 50

    # Pydantic v2 best practice for environment variable configuration
    model_config = SettingsConfigDict(env_file=ENV_FILE_PATH, env_file_encoding="utf-8", extra="ignore")

settings = Settings()

# Ensure the upload directory exists at startup
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)