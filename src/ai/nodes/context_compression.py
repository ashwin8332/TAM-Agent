"""
Node 3: Context Compression
Selects and deduplicates retrieved documents to fit the LLM context window.
Prioritises highest-scoring chunks and prevents near-duplicate content.
"""
from __future__ import annotations

import time
from typing import Any, Dict

from src.ai.state import TriageState
import src.config as config
from src.observability.logger import get_logger

logger = get_logger(__name__)


def context_compression_node(state: TriageState) -> Dict[str, Any]:
    start = time.time()
    retrieved_docs = state.get("retrieved_docs", [])

    if not retrieved_docs:
        elapsed = (time.time() - start) * 1000
        return {
            "compressed_context": "No relevant knowledge base documents were found.",
            "node_timings": {**state.get("node_timings", {}), "context_compression": round(elapsed, 2)},
        }

    sorted_docs = sorted(retrieved_docs, key=lambda d: d.get("score", 0), reverse=True)
    max_chars = config.MAX_CONTEXT_LENGTH
    seen: set = set()
    sections = []
    total = 0

    for doc in sorted_docs:
        content = doc.get("content", "").strip()
        title = doc.get("title", "Untitled")
        score = doc.get("score", 0)

        # Deduplicate on first 200 chars
        key = content[:200]
        if key in seen:
            continue
        seen.add(key)

        block = f"[Source: {title} | Relevance: {score:.2f}]\n{content}"

        if total + len(block) > max_chars:
            remaining = max_chars - total
            if remaining > 150:
                block = block[:remaining] + "\n...[truncated]"
                sections.append(block)
            break

        sections.append(block)
        total += len(block)

    compressed = "\n\n---\n\n".join(sections)
    elapsed_ms = (time.time() - start) * 1000
    timings = {**state.get("node_timings", {}), "context_compression": round(elapsed_ms, 2)}

    logger.debug(
        "context_compression complete",
        extra={
            "request_id": state.get("request_id"),
            "docs_used": len(sections),
            "context_chars": len(compressed),
        },
    )

    return {
        "compressed_context": compressed,
        "node_timings": timings,
    }
