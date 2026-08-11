"""
QueryLens AI — Database Connection

SQLAlchemy engine and session factory.
"""

import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings
import sys
import logging

logger = logging.getLogger(__name__)

settings = get_settings()

is_new_db = False
connect_args = {}

if "sqlite" in settings.database_url:
    connect_args = {"check_same_thread": False}
    
    # Extract path from sqlite:///...
    # For Windows this is sqlite:///C:/... so we split by sqlite:///
    db_path_str = settings.database_url.replace("sqlite:///", "")
    db_path = Path(db_path_str)
    
    # Check if database file exists before engine creates it
    if not db_path.exists():
        is_new_db = True
        logger.info(f"Database not found at {db_path}, preparing to initialize...")
        
    # Ensure parent directory exists
    db_path.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=(settings.environment == "development"),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

if is_new_db:
    logger.info("Initializing new database with sample data...")
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    try:
        from database.seed import create_and_seed
        create_and_seed()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def get_db():
    """
    FastAPI dependency — yields a database session and ensures cleanup.

    Usage:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Return True if the database is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
