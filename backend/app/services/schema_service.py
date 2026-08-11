"""
QueryLens AI — Schema Service

Provides database schema extraction logic and error handling.
"""

from app.database.inspector import inspect_schema
from app.database.connection import check_db_connection
import logging
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)


def get_database_schema() -> dict:
    """
    Retrieves the database schema.
    Handles errors like missing database, connection failures, etc.
    Returns structured dict or throws specific exceptions.
    """
    if not check_db_connection():
        logger.error("Database connection failed or file missing.")
        raise ValueError("Database connection failed or database is not initialized.")
        
    try:
        schema = inspect_schema()
        if not schema.get("tables"):
            logger.warning("Schema inspection returned empty tables. Empty database?")
            raise ValueError("Database is empty or tables could not be discovered.")
            
        return schema
    except SQLAlchemyError as e:
        logger.error(f"SQLAlchemy error during schema inspection: {e}")
        raise ValueError("Unable to inspect the database schema due to an internal error.")
    except ValueError as e:
        # Re-raise known value errors (like empty db)
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during schema inspection: {e}")
        raise ValueError("Unable to inspect the database schema.")
