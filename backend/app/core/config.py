# app/core/config.py
from pathlib import Path
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Needs full path for retrieving the env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    # Database Credentials
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "postgres"

    # Storage Settings
    UPLOAD_DIR: str = "backend/storage/datasets"
    MAX_UPLOAD_MB: int = 50

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        """
        Dynamically construct the connection string.
        Pydantic exposes this automatically as a standard attribute.
        """
        return f"postgresql+psycopg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    # Pydantic best practice for environment variable configuration
    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        env_file_encoding="utf-8", 
        extra="ignore"
    )


settings = Settings()

# Ensure the upload directory exists at startup
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)