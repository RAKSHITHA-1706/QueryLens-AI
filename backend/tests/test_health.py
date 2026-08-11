"""
Backend — Health Check Tests

Run with:
    cd backend
    python -m pytest tests/ -v
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_status_200():
    """Health endpoint should return HTTP 200."""
    response = client.get("/api/health")
    assert response.status_code == 200


def test_health_check_body():
    """Health endpoint should return {"status": "ok"}."""
    response = client.get("/api/health")
    data = response.json()
    assert data == {"status": "ok"}


def test_health_check_content_type():
    """Health endpoint should return JSON."""
    response = client.get("/api/health")
    assert "application/json" in response.headers["content-type"]
