from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.schemas.query import (
    QueryGenerateRequest,
    QueryGenerateResponse,
    QueryExecuteRequest,
    QueryExecuteResponse,
    QueryRequest,
    QueryResponse,
)
from app.services.sql_generation_service import generate_sql
from app.tools.execute_query import execute_query
from app.services.query_service import handle_natural_language_query

router = APIRouter()


@router.post("/query/generate", response_model=QueryGenerateResponse)
def api_query_generate(request: QueryGenerateRequest):
    """
    Generates SQL from a natural language question.
    Does NOT execute the SQL.
    """
    result = generate_sql(request.question)
    
    if not result.get("success"):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=result
        )
        
    return QueryGenerateResponse(
        success=True,
        question=request.question,
        sql=result.get("sql"),
        explanation=result.get("explanation")
    )


@router.post("/query/execute", response_model=QueryExecuteResponse)
def api_query_execute(request: QueryExecuteRequest):
    """
    Validates and executes a SQL query safely.
    """
    result = execute_query(request.sql)
    
    if not result.get("success"):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=result
        )
        
    return QueryExecuteResponse(**result)


@router.post("/query", response_model=QueryResponse)
def api_query(request: QueryRequest):
    """
    Full orchestration: NL question -> Generate SQL -> Execute SQL -> Return Data
    """
    result = handle_natural_language_query(request.question)
    
    if not result.get("success"):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=result
        )
        
    return QueryResponse(**result)
