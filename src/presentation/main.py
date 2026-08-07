"""
FastAPI application entry point — TAM AI Platform.
Domain Driven Design: this file wires layers together only.
No business logic here.

Run with:
    uvicorn src.presentation.main:app --reload --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

import sys
import os

# Add project root to path so 'src.*' imports resolve regardless of CWD
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import src.config as config
from src.presentation.routers.triage import router as triage_router
from src.presentation.routers.system import router as system_router
from src.presentation.schemas import HealthResponse
from src.observability.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup: pre-warm the FAISS index to avoid cold-start latency on first request."""
    logger.info(
        "TAM AI Platform starting up",
        extra={"model": config.MODEL, "env": config.APP_ENV},
    )
    try:
        from src.infrastructure.vector_store import VectorStore
        _ = VectorStore.get_instance().store  # Trigger lazy load
        logger.info("FAISS index ready")
    except Exception as exc:
        logger.warning(
            "FAISS index pre-warm failed — will retry on first request",
            extra={"error": str(exc)},
        )
    yield
    logger.info("TAM AI Platform shutting down")


app = FastAPI(
    title="TAM AI Platform",
    description=(
        "**Production-grade AI for Technical Support & TAM Teams**\n\n"
        "- **Task 1** — Intelligent Ticket Triage: `/api/v1/triage`\n"
        "- **Streaming** — SSE streaming: `/api/v1/triage/stream`\n"
        "- **Health** — `/health`\n\n"
        "Powered by LangGraph + Ollama + FAISS."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — permissive for dev; tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── System endpoints ───────────────────────────────────────────────────────────

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Serve React Vite static build
_REACT_BUILD_DIR = os.path.join(_PROJECT_ROOT, "frontend", "dist")

@app.get("/health", tags=["system"])
async def health_check_route():
    # Health endpoint moved here so it isn't swallowed by static serving
    from src.infrastructure.vector_store import VectorStore
    try:
        _ = VectorStore.get_instance().store
        index_ready = True
    except Exception:
        index_ready = False

    return {
        "status": "ok" if index_ready else "degraded",
        "model": config.MODEL,
        "embedding_model": config.EMBEDDING_MODEL,
        "index_ready": index_ready,
    }

# Ensure the feature routers are loaded BEFORE the catch-all static serving
app.include_router(triage_router)
app.include_router(system_router)

# Mount Vite Assets
if os.path.exists(_REACT_BUILD_DIR):
    # Mount the assets folder which contains the js/css
    app.mount("/assets", StaticFiles(directory=os.path.join(_REACT_BUILD_DIR, "assets")), name="assets")

# Serve the index.html on root and all other unknown paths (for SPA routing)
@app.get("/{full_path:path}", tags=["system"])
async def serve_react_app(full_path: str):
    index_path = os.path.join(_REACT_BUILD_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "Frontend build not found. Run npm run build in frontend directory."}



