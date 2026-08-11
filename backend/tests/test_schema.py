import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import engine, check_db_connection
from app.tools.get_schema import get_schema
import json
import sqlite3
import os
from sqlalchemy import text

client = TestClient(app)


# TEST 1: Database connection works.
def test_database_connection():
    assert check_db_connection() is True


# TEST 2: Database tables can be discovered.
def test_schema_discovers_tables():
    response = client.get("/api/schema")
    assert response.status_code == 200
    data = response.json()
    assert "tables" in data
    tables = data["tables"]
    
    expected_tables = ["categories", "customers", "products", "orders", "order_items", "payments"]
    for table in expected_tables:
        assert table in tables, f"Expected table {table} to be discovered"


# TEST 3: Columns are discovered correctly.
def test_schema_discovers_columns():
    response = client.get("/api/schema")
    data = response.json()
    customers_table = data["tables"]["customers"]
    
    columns = {col["name"]: col for col in customers_table["columns"]}
    assert "id" in columns
    assert "first_name" in columns
    assert "email" in columns
    assert columns["email"]["type"] == "TEXT"


# TEST 4: Primary keys are discovered correctly.
def test_schema_discovers_primary_keys():
    response = client.get("/api/schema")
    data = response.json()
    products_table = data["tables"]["products"]
    
    assert "id" in products_table["primary_keys"]


# TEST 5: Foreign keys are discovered correctly.
def test_schema_discovers_foreign_keys():
    response = client.get("/api/schema")
    data = response.json()
    orders_table = data["tables"]["orders"]
    
    fks = orders_table["foreign_keys"]
    customer_fk = next((fk for fk in fks if fk["column"] == "customer_id"), None)
    
    assert customer_fk is not None
    assert customer_fk["references_table"] == "customers"
    assert customer_fk["references_column"] == "id"


# TEST 6: Relationships are returned correctly.
def test_schema_returns_relationships():
    response = client.get("/api/schema")
    data = response.json()
    
    relationships = data["relationships"]
    # Check if the relationship from order_items -> products exists
    rel = next((r for r in relationships if r["from_table"] == "order_items" and r["to_table"] == "products"), None)
    
    assert rel is not None
    assert rel["from_column"] == "product_id"
    assert rel["to_column"] == "id"


# TEST 7: get_schema() returns JSON-serializable data.
def test_get_schema_tool_returns_json():
    result_str = get_schema()
    assert isinstance(result_str, str)
    
    # Ensure it's valid JSON
    result_json = json.loads(result_str)
    assert "tables" in result_json
    assert "customers" in result_json["tables"]


# TEST 8: Missing database/error condition is handled.
def test_missing_database_handled(monkeypatch):
    # Mock check_db_connection to return False
    monkeypatch.setattr("app.services.schema_service.check_db_connection", lambda: False)
    
    response = client.get("/api/schema")
    assert response.status_code == 500
    data = response.json()
    assert data["success"] is False
    assert data["error_type"] == "database_error"
    assert "Database connection failed" in data["message"]


# TEST 9: Empty database is handled gracefully.
def test_empty_database_handled(monkeypatch):
    # Mock inspect_schema to return empty tables
    monkeypatch.setattr("app.services.schema_service.inspect_schema", lambda: {"tables": {}})
    
    response = client.get("/api/schema")
    assert response.status_code == 500
    data = response.json()
    assert data["success"] is False
    assert data["error_type"] == "database_error"
    assert "Database is empty" in data["message"]


# TEST 10: Adding a new table causes get_schema() to discover it dynamically.
def test_dynamic_table_discovery():
    # Create a new table dynamically in the SQLite database
    with engine.connect() as conn:
        conn.execute(text("CREATE TABLE dynamic_test_table (id INTEGER PRIMARY KEY, test_col TEXT)"))
        conn.commit()
        
    try:
        response = client.get("/api/schema")
        data = response.json()
        assert "dynamic_test_table" in data["tables"], "Dynamic table was not discovered"
        
        dynamic_table = data["tables"]["dynamic_test_table"]
        assert "id" in dynamic_table["primary_keys"]
        columns = [col["name"] for col in dynamic_table["columns"]]
        assert "test_col" in columns
    finally:
        # Cleanup
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE dynamic_test_table"))
            conn.commit()
