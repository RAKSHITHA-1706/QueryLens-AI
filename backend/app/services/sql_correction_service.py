"""
QueryLens AI — SQL Correction Service

Corrects a failed SQL query using Google Gemini, given the original question,
the failed SQL, and the database error message.
"""

import logging
from sqlalchemy import inspect

from app.database.connection import engine
from app.services import gemini_service

logger = logging.getLogger(__name__)


def get_database_schema() -> str:
    try:
        inspector = inspect(engine)
        schema_lines = []
        for table_name in inspector.get_table_names():
            if table_name.startswith("sqlite_"):
                continue
            columns = inspector.get_columns(table_name)
            col_names = [col["name"] for col in columns]
            schema_lines.append(f"{table_name}({', '.join(col_names)})")
        return "\n".join(schema_lines)
    except Exception as e:
        logger.error(f"Error inspecting schema for correction: {e}")
        return ""


def correct_sql(question: str, sql: str, error: str) -> str:
    schema_str = get_database_schema()

    prompt = f"""You are a SQL correction assistant.
The following SQL query failed to execute.
Fix the SQL query based on the database error and the schema.

Database schema:
{schema_str}

User question:
{question}

Failed SQL:
{sql}

Database error:
{error}

Return ONLY the corrected SQL query. No markdown. No explanation. No comments."""

    try:
        content = gemini_service.generate_text(prompt)

        # Strip markdown fences if present
        if content.startswith("```sql"):
            content = content[6:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]

        return content.strip()

    except Exception as e:
        logger.error(f"Error during SQL correction via Gemini: {e}")
        return ""
