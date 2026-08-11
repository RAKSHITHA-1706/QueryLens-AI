"""
QueryLens AI — get_schema Tool

OpenAI-compatible tool definition for retrieving the database schema.
"""

from app.services.schema_service import get_database_schema
import json


# OpenAI tool schema definition
get_schema_definition = {
    "type": "function",
    "function": {
        "name": "get_schema",
        "description": "Retrieve the current database schema including tables, columns, primary keys, foreign keys, and relationships.",
        "parameters": {
            "type": "object",
            "properties": {},
            "additionalProperties": False,
        }
    }
}


def get_schema() -> str:
    """
    Executes the get_schema tool and returns a JSON string representation
    of the database schema.
    """
    try:
        schema_dict = get_database_schema()
        return json.dumps(schema_dict)
    except ValueError as e:
        # Return error message as JSON string to the agent
        return json.dumps({
            "success": False,
            "error_type": "database_error",
            "message": str(e)
        })
    except Exception as e:
        return json.dumps({
            "success": False,
            "error_type": "unknown_error",
            "message": "An unexpected error occurred while fetching the schema."
        })
