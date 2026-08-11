"""
QueryLens AI — Query Schemas

Pydantic models for query requests and responses.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class QueryGenerateRequest(BaseModel):
    question: str


class QueryGenerateResponse(BaseModel):
    success: bool
    question: str
    sql: Optional[str] = None
    explanation: Optional[str] = None
    error_type: Optional[str] = None
    message: Optional[str] = None


class QueryExecuteRequest(BaseModel):
    sql: str


class QueryExecuteResponse(BaseModel):
    success: bool
    columns: Optional[List[str]] = None
    rows: Optional[List[Dict[str, Any]]] = None
    row_count: Optional[int] = None
    truncated: Optional[bool] = None
    error_type: Optional[str] = None
    message: Optional[str] = None


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    success: bool
    question: str
    sql: Optional[str] = None
    explanation: Optional[str] = None
    columns: Optional[List[str]] = None
    rows: Optional[List[Dict[str, Any]]] = None
    row_count: Optional[int] = None
    truncated: Optional[bool] = None
    error_type: Optional[str] = None
    message: Optional[str] = None
    status: Optional[List[str]] = None


class SqlGenerationResponse(BaseModel):
    """Structured output for the LLM"""
    sql: str = Field(description="The executable read-only SQLite query.")
    explanation: str = Field(description="A brief explanation of how the query works.")
