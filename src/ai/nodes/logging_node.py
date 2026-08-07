"""
Node 9: Logging Node (terminal)
Final node in every graph path — emits the complete structured trace log
and attaches final metadata to the triage result.
"""
from __future__ import annotations

import time
from typing import Any, Dict

from src.ai.state import TriageState
from src.observability.logger import get_logger

logger = get_logger(__name__)


def logging_node(state: TriageState) -> Dict[str, Any]:
    processing_start = state.get("processing_start_ms", time.time() * 1000)
    total_ms = round(time.time() * 1000 - processing_start, 2)

    result = dict(state.get("triage_result") or {})

    # Attach observability fields to the result dict
    result["processing_time_ms"] = total_ms
    result["request_id"] = state.get("request_id", "")
    result["prompt_version"] = state.get("prompt_version", "unknown")

    log_payload = {
        "request_id": state.get("request_id"),
        "ticket_id": state.get("ticket_id"),
        "validated": state.get("validated"),
        "retry_count": state.get("retry_count", 0),
        "confidence": state.get("confidence", 0.0),
        "error_count": len(state.get("errors", [])),
        "errors": state.get("errors", []),
        "prompt_version": state.get("prompt_version", "unknown"),
        "docs_retrieved": len(state.get("retrieved_docs", [])),
        "urgency_tier": result.get("urgency_tier"),
        "issue_category": result.get("issue_category"),
        "recommended_team": result.get("recommended_team"),
        "total_ms": total_ms,
        "node_timings": state.get("node_timings", {}),
    }

    if state.get("errors"):
        logger.warning("Triage completed with errors", extra=log_payload)
    else:
        logger.info("Triage completed successfully", extra=log_payload)

    return {"triage_result": result}
