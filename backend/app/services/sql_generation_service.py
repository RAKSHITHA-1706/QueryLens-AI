"""
QueryLens AI — SQL Generation Service

Translates natural language questions into SQLite queries using a local Ollama LLM.
"""

import logging
import json
import httpx

from app.config import get_settings
from app.tools.get_schema import get_schema

logger = logging.getLogger(__name__)


def check_ollama_availability(base_url: str) -> bool:
    """Checks if the local Ollama instance is accessible."""
    try:
        response = httpx.get(base_url, timeout=2.0)
        return response.status_code == 200
    except Exception:
        return False


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
    using a local Ollama model's native API.
    """
    settings = get_settings()
    
    # 1. Pre-flight check: Is Ollama running?
    if not check_ollama_availability(settings.ollama_base_url):
        logger.error(f"Ollama is not accessible at {settings.ollama_base_url}")
        return {
            "success": False,
            "error_type": "configuration_error",
            "message": f"Ollama must be running at {settings.ollama_base_url}. Please start Ollama."
        }
        
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

    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    try:
        response = httpx.post(
            f"{settings.ollama_base_url.rstrip('/')}/api/generate",
            json=payload,
            timeout=30.0
        )
        response.raise_for_status()
        
        response_data = response.json()
        response_content = response_data.get("response", "")
        
        if not response_content:
            return {
                "success": False,
                "error_type": "generation_error",
                "message": "The model returned an empty response."
            }
            
        parsed_result = extract_json_from_response(response_content)
        
        sql = parsed_result.get("sql")
        explanation = parsed_result.get("explanation", "")
        
        if not sql:
            return {
                "success": False,
                "error_type": "generation_error",
                "message": "Model response did not contain a 'sql' field."
            }
            
        return {
            "success": True,
            "sql": sql,
            "explanation": explanation
        }
        
    except httpx.TimeoutException:
        logger.error("Ollama request timed out.")
        return {
            "success": False,
            "error_type": "timeout_error",
            "message": "Request to Ollama timed out."
        }
    except Exception as e:
        logger.error(f"Error during SQL generation with Ollama: {e}")
        return {
            "success": False,
            "error_type": "llm_error",
            "message": f"Failed to generate SQL via Ollama: {str(e)}"
        }
