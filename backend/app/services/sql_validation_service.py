"""
QueryLens AI — SQL Validation Service

Provides validation logic to ensure generated SQL is read-only and safe to execute.
"""

import re
import logging

logger = logging.getLogger(__name__)

# A blocklist of SQL keywords that modify data or schema.
FORBIDDEN_KEYWORDS = {
    "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", 
    "TRUNCATE", "REPLACE", "ATTACH", "DETACH", "PRAGMA", "VACUUM"
}


def validate_sql(sql: str) -> None:
    """
    Validates the provided SQL string.
    Raises ValueError if the SQL is empty, malformed, contains multiple statements,
    or contains unsafe/forbidden keywords.
    """
    if not sql or not sql.strip():
        raise ValueError("SQL query is empty.")
        
    cleaned_sql = sql.strip()
    
    # 1. Reject multiple statements
    # Basic check: look for semicolons followed by non-whitespace characters
    # (A robust parser would handle semicolons inside string literals, but for safety 
    # and simplicity, we can aggressively reject multiple statements)
    statements = [stmt.strip() for stmt in cleaned_sql.split(";") if stmt.strip()]
    if len(statements) > 1:
        raise ValueError("Multiple SQL statements are not allowed.")
        
    # Remove trailing semicolon for further checks
    stmt = statements[0]

    # 2. Check for forbidden keywords using regex to match whole words
    upper_stmt = stmt.upper()
    for keyword in FORBIDDEN_KEYWORDS:
        # \b ensures we match whole words, case-insensitive
        if re.search(rf"\b{keyword}\b", upper_stmt):
            raise ValueError(f"Unsafe SQL keyword detected: {keyword}")
            
    # 3. Check if statement starts with SELECT or WITH
    if not upper_stmt.startswith("SELECT") and not upper_stmt.startswith("WITH"):
        raise ValueError("Only SELECT queries are allowed.")
            
    logger.debug(f"SQL validation passed for: {sql}")
