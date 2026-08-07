"""
Node 2: Retrieval
Queries the FAISS index with the ticket subject+body to find the
most relevant knowledge base documents.
"""
from __future__ import annotations

import time
from typing import Any, Dict

from src.ai.state import TriageState
from src.ai.retriever import Retriever
import src.config as config
from src.observability.logger import get_logger

logger = get_logger(__name__)

_retriever: Retriever | None = None


def _get_retriever() -> Retriever:
    global _retriever
    if _retriever is None:
        _retriever = Retriever()
    return _retriever


def retrieval_node(state: TriageState) -> Dict[str, Any]:
    start = time.time()
    errors = list(state.get("errors", []))

    subject = state.get("ticket_subject", "")
    body = state.get("ticket_body", "")
    query = f"{subject}\n\n{body}".strip()

    if not query:
        errors.append("Retrieval skipped: no query text")
        elapsed = (time.time() - start) * 1000
        return {
            "retrieved_docs": [],
            "errors": errors,
            "node_timings": {**state.get("node_timings", {}), "retrieval": round(elapsed, 2)},
        }

    docs = _get_retriever().retrieve(query, k=config.TOP_K)

    elapsed_ms = (time.time() - start) * 1000
    timings = {**state.get("node_timings", {}), "retrieval": round(elapsed_ms, 2)}

    logger.info(
        "retrieval complete",
        extra={
            "request_id": state.get("request_id"),
            "docs_retrieved": len(docs),
            "top_score": docs[0]["score"] if docs else 0.0,
            "latency_ms": round(elapsed_ms, 2),
        },
    )

    return {
        "retrieved_docs": docs,
        "errors": errors,
        "node_timings": timings,
    }
