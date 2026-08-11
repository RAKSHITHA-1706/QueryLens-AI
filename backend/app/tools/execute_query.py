"""
QueryLens AI — Execute Query Tool

Safely executes a validated read-only SQL query against the database.
"""

from typing import Dict, Any
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.database.connection import engine
from app.services.sql_validation_service import validate_sql
from app.config import get_settings

logger = logging.getLogger(__name__)


def execute_query(sql: str) -> Dict[str, Any]:
    """
    Validates and executes a SQL query safely.
    Returns structured results including columns, rows, and truncation status.
    """
    try:
        # 1. Validate SQL
        validate_sql(sql)
        
        settings = get_settings()
        max_rows = settings.max_query_rows
        
        # 2. Execute SQL
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            
            # Fetch columns
            columns = list(result.keys())
            
            # Fetch rows up to max_rows + 1 to detect truncation
            raw_rows = result.fetchmany(max_rows + 1)
            
            truncated = len(raw_rows) > max_rows
            
            # Limit the rows to max_rows
            final_rows = raw_rows[:max_rows]
            
            # Convert SQLAlchemy Rows to dicts (JSON serializable)
            rows = [dict(zip(columns, row)) for row in final_rows]
            
            return {
                "success": True,
                "columns": columns,
                "rows": rows,
                "row_count": len(rows),
                "truncated": truncated
            }
            
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return {
            "success": False,
            "error_type": "validation_error",
            "message": str(e)
        }
    except SQLAlchemyError as e:
        logger.error(f"Database execution error: {str(e)}")
        return {
            "success": False,
            "error_type": "database_error",
            "message": f"Database error: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Unexpected execution error: {str(e)}")
        return {
            "success": False,
            "error_type": "internal_error",
            "message": "An unexpected error occurred during execution."
        }
