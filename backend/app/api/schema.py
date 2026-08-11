"""
QueryLens AI — Schema API Router

Testing endpoint to verify schema extraction.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.services.schema_service import get_database_schema
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/schema",
    tags=["schema"]
)


@router.get("")
def read_schema():
    """
    Returns the database schema as structured JSON.
    """
    try:
        schema = get_database_schema()
        return schema
    except ValueError as e:
        logger.error(f"Failed to fetch schema: {e}")
        # Return a structured API error
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error_type": "database_error",
                "message": str(e)
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error in /api/schema: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error_type": "internal_error",
                "message": "An unexpected error occurred while fetching the schema."
            }
        )
