"""
QueryLens AI — SQL Generation Service

Translates natural language questions into SQLite queries using Google Gemini.
"""

import logging
import json

from app.tools.get_schema import get_schema
from app.services import gemini_service

logger = logging.getLogger(__name__)


def extract_json_from_response(content: str) -> dict:
    """
    Attempts to parse JSON from the LLM response.
    Strips markdown formatting if present.
    """
    content = content.strip()

    # Strip markdown SQL fences if the model erroneously wrapped the whole thing
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM JSON response: {content}")
        raise ValueError("LLM did not return valid JSON.") from e


def generate_sql(question: str) -> dict:
    """
    Generates a SQL query for the given question based on the database schema
    using Google Gemini.
    """
    schema_json = get_schema()

    prompt = f"""You are a SQL generation assistant.
Generate ONE SQLite-compatible SELECT query for the user's question.
Use ONLY tables and columns present in the provided database schema.
Do not invent tables or columns.
Do not generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, or other write operations.

OUTPUT FORMAT:
You MUST respond with a valid JSON object containing exactly two keys:
- "sql": The executable read-only SQLite query string. Do NOT wrap this string in markdown fences.
- "explanation": A short explanation of how the query works.

Database schema:
{schema_json}

User question:
{question}
"""

    try:
        response_content = gemini_service.generate_text(prompt)

        if not response_content:
            return {
                "success": False,
                "error_type": "generation_error",
                "message": "The model returned an empty response.",
            }

        parsed_result = extract_json_from_response(response_content)

        sql = parsed_result.get("sql")
        explanation = parsed_result.get("explanation", "")

        if not sql:
            return {
                "success": False,
                "error_type": "generation_error",
                "message": "Model response did not contain a 'sql' field.",
            }

        return {
            "success": True,
            "sql": sql,
            "explanation": explanation,
        }

    except ValueError as e:
        logger.error(f"JSON parsing error during SQL generation: {e}")
        return {
            "success": False,
            "error_type": "generation_error",
            "message": str(e),
        }
    except RuntimeError as e:
        logger.error(f"Gemini API error during SQL generation: {e}")
        return {
            "success": False,
            "error_type": "llm_error",
            "message": str(e),
        }
    except Exception as e:
        logger.error(f"Unexpected error during SQL generation: {e}")
        return {
            "success": False,
            "error_type": "llm_error",
            "message": "An unexpected error occurred during SQL generation.",
        }
