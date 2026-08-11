import pytest
from unittest.mock import MagicMock
from app.services.query_service import handle_natural_language_query, MAX_CORRECTION_ATTEMPTS
from app.services import sql_correction_service

def test_invalid_column_corrected(monkeypatch):
    # 1. Mock generate_sql to return invalid sql
    def mock_generate_sql(q):
        return {"success": True, "sql": "SELECT bad_col FROM customers", "explanation": "test"}
    monkeypatch.setattr("app.services.query_service.generate_sql", mock_generate_sql)

    # 2. Mock correct_sql to return valid sql
    def mock_correct_sql(question, sql, error):
        return "SELECT id FROM customers LIMIT 1"
    monkeypatch.setattr("app.services.query_service.correct_sql", mock_correct_sql)

    result = handle_natural_language_query("get bad col")
    assert result["success"] is True
    assert "status" in result
    assert "Correcting query" in result["status"]
    assert result["sql"] == "SELECT id FROM customers LIMIT 1"

def test_invalid_table_corrected(monkeypatch):
    # 1. Mock generate_sql to return invalid sql
    def mock_generate_sql(q):
        return {"success": True, "sql": "SELECT * FROM bad_table", "explanation": "test"}
    monkeypatch.setattr("app.services.query_service.generate_sql", mock_generate_sql)

    # 2. Mock correct_sql to return valid sql
    def mock_correct_sql(question, sql, error):
        return "SELECT * FROM customers LIMIT 1"
    monkeypatch.setattr("app.services.query_service.correct_sql", mock_correct_sql)

    result = handle_natural_language_query("get bad table")
    assert result["success"] is True
    assert "Correcting query" in result["status"]
    assert result["sql"] == "SELECT * FROM customers LIMIT 1"

def test_retry_limit_respected(monkeypatch):
    def mock_generate_sql(q):
        return {"success": True, "sql": "SELECT * FROM bad_table", "explanation": "test"}
    monkeypatch.setattr("app.services.query_service.generate_sql", mock_generate_sql)

    call_count = {"count": 0}
    def mock_correct_sql(question, sql, error):
        call_count["count"] += 1
        return "SELECT * FROM still_bad_table"
    monkeypatch.setattr("app.services.query_service.correct_sql", mock_correct_sql)

    result = handle_natural_language_query("test retry limit")
    assert result["success"] is False
    assert result["error_type"] == "correction_failed"
    assert call_count["count"] == MAX_CORRECTION_ATTEMPTS

def test_corrected_sql_revalidated(monkeypatch):
    def mock_generate_sql(q):
        return {"success": True, "sql": "SELECT * FROM bad_table", "explanation": "test"}
    monkeypatch.setattr("app.services.query_service.generate_sql", mock_generate_sql)

    # Correct returns multiple statements
    def mock_correct_sql(question, sql, error):
        return "SELECT * FROM customers; SELECT * FROM products;"
    monkeypatch.setattr("app.services.query_service.correct_sql", mock_correct_sql)

    result = handle_natural_language_query("test multi")
    assert result["success"] is False
    assert result["error_type"] == "validation_error"
    assert "Multiple SQL statements" in result["message"]

def test_unsafe_corrected_sql_rejected(monkeypatch):
    def mock_generate_sql(q):
        return {"success": True, "sql": "SELECT * FROM bad_table", "explanation": "test"}
    monkeypatch.setattr("app.services.query_service.generate_sql", mock_generate_sql)

    # Correct returns malicious sql
    def mock_correct_sql(question, sql, error):
        return "DROP TABLE customers"
    monkeypatch.setattr("app.services.query_service.correct_sql", mock_correct_sql)

    result = handle_natural_language_query("test drop")
    assert result["success"] is False
    assert result["error_type"] == "validation_error"
    assert "Unsafe SQL keyword" in result["message"]
