"""
QueryLens AI — Database Inspector

Utility to inspect the schema of the connected database using SQLAlchemy.
"""

from sqlalchemy import inspect
from app.database.connection import engine
import logging

logger = logging.getLogger(__name__)


def inspect_schema() -> dict:
    """
    Inspects the connected database and returns a structured dictionary
    representing tables, columns, primary keys, and foreign keys.
    """
    try:
        inspector = inspect(engine)
        schema = {
            "tables": {},
            "relationships": []
        }
        
        table_names = inspector.get_table_names()
        
        for table_name in table_names:
            # Skip SQLite internal tables
            if table_name.startswith("sqlite_"):
                continue
                
            columns_info = inspector.get_columns(table_name)
            pk_info = inspector.get_pk_constraint(table_name)
            fk_info = inspector.get_foreign_keys(table_name)
            
            columns = []
            for col in columns_info:
                columns.append({
                    "name": col["name"],
                    "type": str(col["type"]),
                    "nullable": col.get("nullable", True)
                })
                
            primary_keys = pk_info.get("constrained_columns", [])
            
            table_fks = []
            for fk in fk_info:
                # Add to the table's FK list
                table_fks.append({
                    "column": fk["constrained_columns"][0], # assuming single column FKs for simplicity, though can be a list
                    "references_table": fk["referred_table"],
                    "references_column": fk["referred_columns"][0]
                })
                
                # Also add to the global relationships list
                schema["relationships"].append({
                    "from_table": table_name,
                    "from_column": fk["constrained_columns"][0],
                    "to_table": fk["referred_table"],
                    "to_column": fk["referred_columns"][0]
                })
                
            schema["tables"][table_name] = {
                "columns": columns,
                "primary_keys": primary_keys,
                "foreign_keys": table_fks
            }
            
        return schema
    except Exception as e:
        logger.error(f"Error inspecting schema: {e}")
        raise e
