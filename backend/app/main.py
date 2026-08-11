"""
QueryLens AI — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.health import router as health_router
from app.api.schema import router as schema_router
from app.api.query import router as query_router
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown events using the modern lifespan API."""
    logger.info(f"🚀 {settings.app_name} v{settings.app_version} starting up")
    logger.info(f"   Environment : {settings.environment}")
    logger.info(f"   Database URL: {settings.database_url}")
    logger.info(f"   CORS origins: {settings.cors_origins_list}")
    yield
    logger.info("👋 QueryLens AI shutting down")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered conversational database analyst",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite dev server and any configured origins
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health_router, prefix="/api")
app.include_router(schema_router, prefix="/api")
app.include_router(query_router, prefix="/api")
