"""
QueryLens AI — Application Configuration

Reads settings from environment variables / .env file.
Never hardcode secrets here — use .env.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from functools import lru_cache
from pathlib import Path

# Project root directory (querylens-ai)
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    # Local LLM (Ollama)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:1.5b"
    
    # Query Execution Limits
    max_query_rows: int = 500

    # Database
    database_url: str = "sqlite:///./database/querylens.db"

    @model_validator(mode='after')
    def resolve_database_url(self) -> 'Settings':
        if self.database_url.startswith("sqlite:///./"):
            rel_path = self.database_url[len("sqlite:///./"):]
            abs_path = BASE_DIR / rel_path
            # For Windows, absolute paths in sqlite URLs look like sqlite:///C:/...
            # Path.as_posix() converts backslashes to forward slashes.
            self.database_url = f"sqlite:///{abs_path.as_posix()}"
        return self

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    # CORS — comma-separated list of allowed origins
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # App
    environment: str = "development"
    app_name: str = "QueryLens AI"
    app_version: str = "0.1.0"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR/".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — call this wherever settings are needed."""
    return Settings()
