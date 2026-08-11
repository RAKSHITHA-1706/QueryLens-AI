"""
QueryLens AI — Query Service

Orchestrates the full natural language -> SQL -> Execution flow.
"""

import logging
from typing import Dict, Any

from app.services.sql_generation_service import generate_sql
from app.tools.execute_query import execute_query
from app.services.sql_correction_service import correct_sql

logger = logging.getLogger(__name__)

MAX_CORRECTION_ATTEMPTS = 2

def handle_natural_language_query(question: str) -> Dict[str, Any]:
    """
    1. Generates SQL for the question.
    2. Validates and executes the generated SQL.
    3. Corrects and retries on database errors.
    4. Returns the combined result.
    """
    status = ["Generating SQL"]
    
    # Step 1: Generate SQL
    gen_result = generate_sql(question)
    
    if not gen_result.get("success"):
        return {
            "success": False,
            "question": question,
            "error_type": gen_result.get("error_type", "generation_error"),
            "message": gen_result.get("message", "Failed to generate SQL."),
            "status": status
        }
        
    sql = gen_result.get("sql")
    explanation = gen_result.get("explanation")
    
    # Step 2: Execute SQL with retry logic
    status.append("Executing query")
    exec_result = execute_query(sql)
    
    attempts = 0
    while not exec_result.get("success") and exec_result.get("error_type") == "database_error" and attempts < MAX_CORRECTION_ATTEMPTS:
        if "Correcting query" not in status:
            status.append("Correcting query")
            
        error_msg = exec_result.get("message", "")
        
        # 1. correct_sql
        corrected_sql = correct_sql(question, sql, error_msg)
        
        # update sql to the corrected version
        sql = corrected_sql
        
        # 2 & 3. execute_query handles validation and execution
        exec_result = execute_query(sql)
        attempts += 1
        
    if not exec_result.get("success"):
        if attempts >= MAX_CORRECTION_ATTEMPTS and exec_result.get("error_type") == "database_error":
            return {
                "success": False,
                "error_type": "correction_failed",
                "message": "Unable to correct SQL after maximum retry attempts.",
                "status": status
            }
            
        return {
            "success": False,
            "question": question,
            "sql": sql,
            "explanation": explanation,
            "error_type": exec_result.get("error_type", "execution_error"),
            "message": exec_result.get("message", "Failed to execute generated SQL."),
            "status": status
        }
        
    # Step 3: Combine and return
    return {
        "success": True,
        "question": question,
        "sql": sql,
        "explanation": explanation,
        "columns": exec_result.get("columns"),
        "rows": exec_result.get("rows"),
        "row_count": exec_result.get("row_count"),
        "truncated": exec_result.get("truncated", False),
        "status": status
    }
