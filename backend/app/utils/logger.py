"""
QueryLens AI — Centralized Logger

Usage:
    from app.utils.logger import get_logger
    logger = get_logger(__name__)
    logger.info("Hello from QueryLens")
"""

import logging
import sys
from app.config import get_settings


def get_logger(name: str) -> logging.Logger:
    """Return a configured logger for the given module name."""
    settings = get_settings()

    level = logging.DEBUG if settings.environment == "development" else logging.INFO

    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        stream=sys.stdout,
    )

    return logging.getLogger(name)
