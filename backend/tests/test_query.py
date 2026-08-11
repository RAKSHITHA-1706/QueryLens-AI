import pytest
from fastapi.testclient import TestClient
import json

from app.main import app
from app.services.sql_validation_service import validate_sql
from app.tools.execute_query import execute_query
from app.schemas.query import SqlGenerationResponse

client = TestClient(app)

# ---------------------------------------------------------
# SQL VALIDATION TESTS (1-12)
# ---------------------------------------------------------

def test_select_accepted():
    validate_sql("SELECT * FROM customers")

def test_with_select_accepted():
    validate_sql("WITH cte AS (SELECT * FROM customers) SELECT * FROM cte")

def test_insert_rejected():
    with pytest.raises(ValueError, match="Unsafe SQL keyword"):
        validate_sql("INSERT INTO customers (id) VALUES (1)")

def test_update_rejected():
    with pytest.raises(ValueError, match="Unsafe SQL keyword"):
        validate_sql("UPDATE customers SET name='X'")

def test_delete_rejected():
    with pytest.raises(ValueError, match="Unsafe SQL keyword"):
        validate_sql("DELETE FROM customers")

def test_drop_rejected():
    with pytest.raises(ValueError, match="Unsafe SQL keyword"):
        validate_sql("DROP TABLE customers")

def test_alter_rejected():
    with pytest.raises(ValueError, match="Unsafe SQL keyword"):
        validate_sql("ALTER TABLE customers ADD COLUMN x TEXT")

def test_create_rejected():
    with pytest.raises(ValueError, match="Unsafe SQL keyword"):
        validate_sql("CREATE TABLE test (id INTEGER)")

def test_pragma_rejected():
    with pytest.raises(ValueError, match="Unsafe SQL keyword"):
        validate_sql("PRAGMA table_info(customers)")

def test_vacuum_rejected():
    with pytest.raises(ValueError, match="Unsafe SQL keyword"):
        validate_sql("VACUUM")

def test_multiple_statements_rejected():
    with pytest.raises(ValueError, match="Multiple SQL statements"):
        validate_sql("SELECT * FROM customers; SELECT * FROM orders;")

def test_empty_sql_rejected():
    with pytest.raises(ValueError, match="empty"):
        validate_sql("")


# ---------------------------------------------------------
# QUERY EXECUTION TESTS (13-19)
# ---------------------------------------------------------

def test_select_executes():
    result = execute_query("SELECT id, first_name FROM customers LIMIT 1")
    assert result["success"] is True

def test_result_columns_returned():
    result = execute_query("SELECT id, first_name FROM customers LIMIT 1")
    assert "columns" in result
    assert result["columns"] == ["id", "first_name"]

def test_rows_returned():
    result = execute_query("SELECT id, first_name FROM customers LIMIT 1")
    assert "rows" in result
    assert isinstance(result["rows"], list)
    if result["row_count"] > 0:
        assert "first_name" in result["rows"][0]

def test_row_count_returned():
    result = execute_query("SELECT * FROM customers LIMIT 5")
    assert "row_count" in result
    assert result["row_count"] <= 5

def test_empty_result_handled():
    result = execute_query("SELECT * FROM customers WHERE id = -999")
    assert result["success"] is True
    assert result["row_count"] == 0
    assert result["rows"] == []

def test_result_truncation_works(monkeypatch):
    # Mock the settings max_query_rows to a low number
    from app.config import Settings, get_settings
    
    settings = get_settings()
    original_max = settings.max_query_rows
    settings.max_query_rows = 2
    
    try:
        # Assuming we have at least 3 categories in seed data
        result = execute_query("SELECT * FROM categories")
        assert result["success"] is True
        assert result["row_count"] == 2
        assert result["truncated"] is True
        assert len(result["rows"]) == 2
    finally:
        settings.max_query_rows = original_max

def test_database_execution_error_handled():
    result = execute_query("SELECT * FROM table_that_does_not_exist")
    assert result["success"] is False
    assert result["error_type"] == "database_error"


# ---------------------------------------------------------
# API TESTS (20-25)
# ---------------------------------------------------------

def test_api_health_still_works():
    response = client.get("/api/health")
    assert response.status_code == 200

def test_api_schema_still_works():
    response = client.get("/api/schema")
    assert response.status_code == 200

def test_api_query_execute_safe_query_works():
    response = client.post("/api/query/execute", json={"sql": "SELECT * FROM customers LIMIT 1"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

def test_api_query_execute_unsafe_query_rejected():
    response = client.post("/api/query/execute", json={"sql": "DROP TABLE customers"})
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error_type"] == "validation_error"

def test_api_query_generate_handles_missing_ollama_gracefully(monkeypatch):
    # Force Ollama availability check to fail
    monkeypatch.setattr("app.services.sql_generation_service.check_ollama_availability", lambda url: False)
    
    response = client.post("/api/query/generate", json={"question": "Show top products"})
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error_type"] == "configuration_error"
    assert "Ollama must be running" in data["message"]

class MockHttpxResponse:
    def __init__(self, json_data):
        self._json_data = json_data
        
    def json(self):
        return self._json_data
        
    def raise_for_status(self):
        pass

def mock_httpx_post(url, **kwargs):
    json_str = '{"sql": "SELECT * FROM customers LIMIT 5", "explanation": "Returns top 5 customers"}'
    return MockHttpxResponse({"response": json_str})

def test_api_query_handles_input_and_orchestration(monkeypatch):
    # Mock Ollama availability
    monkeypatch.setattr("app.services.sql_generation_service.check_ollama_availability", lambda url: True)
    
    # Mock httpx.post for Ollama generate API
    monkeypatch.setattr("httpx.post", mock_httpx_post)
    
    response = client.post("/api/query", json={"question": "Show top 5 customers"})
    assert response.status_code == 200
    data = response.json()
    
    assert data["success"] is True
    assert data["sql"] == "SELECT * FROM customers LIMIT 5"
    assert "rows" in data
    assert "columns" in data
