"""
Health Check Router
"""

from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="Health Check")
async def health_check() -> HealthResponse:
    """
    Returns the current health status of the API.

    Use this endpoint to verify the backend is running before making
    AI or database calls.
    """
    return HealthResponse(status="ok")
