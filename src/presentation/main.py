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

@app.get("/", tags=["system"])
async def root():
    return {
        "service": "TAM AI Platform",
        "task": "Task 1 — Intelligent Ticket Triage",
        "docs": "/docs",
        "health": "/health",
        "triage": "/api/v1/triage",
    }


@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check():
    """Health check — confirms FAISS index is loaded and Ollama is configured."""
    from src.infrastructure.vector_store import VectorStore
    try:
        _ = VectorStore.get_instance().store
        index_ready = True
    except Exception:
        index_ready = False

    return HealthResponse(
        status="ok" if index_ready else "degraded",
        model=config.MODEL,
        embedding_model=config.EMBEDDING_MODEL,
        index_ready=index_ready,
    )


# ── Feature routers ────────────────────────────────────────────────────────────

app.include_router(triage_router)
