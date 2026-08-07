"""
Node 1: Input Validation
Parses raw input (plain text or JSON), extracts ticket fields,
generates request ID, and validates required content.
"""
from __future__ import annotations

import json
import time
import uuid
from typing import Any, Dict

from src.ai.state import TriageState
from src.observability.logger import get_logger

logger = get_logger(__name__)


def input_validation_node(state: TriageState) -> Dict[str, Any]:
    start = time.time()
    request_id = state.get("request_id") or str(uuid.uuid4())
    errors: list = list(state.get("errors", []))

    raw_input: str = state.get("raw_input", "")
    ticket_subject = ""
    ticket_body = ""
    ticket_id = None
    account_id = None
    plan_tier = None

    # Try JSON parse first — supports {subject, body, ticket_id, account_id, plan_tier}
    try:
        parsed = json.loads(raw_input)
        if isinstance(parsed, dict):
            ticket_subject = str(parsed.get("subject") or "").strip()
            ticket_body = str(parsed.get("body") or "").strip()
            ticket_id = parsed.get("ticket_id")
            account_id = parsed.get("account_id")
            plan_tier = parsed.get("plan_tier")
    except (json.JSONDecodeError, TypeError):
        # Plain-text input — treat entire raw_input as the body
        ticket_body = raw_input.strip()

    # Validation
    if not ticket_body or len(ticket_body) < 10:
        errors.append("Ticket body is too short or empty (minimum 10 characters)")

    # Safety truncation to avoid context overflow
    if len(ticket_body) > 10_000:
        ticket_body = ticket_body[:10_000]

    elapsed_ms = (time.time() - start) * 1000
    timings = {**state.get("node_timings", {}), "input_validation": round(elapsed_ms, 2)}

    logger.info(
        "input_validation complete",
        extra={
            "request_id": request_id,
            "has_subject": bool(ticket_subject),
            "body_len": len(ticket_body),
            "ticket_id": ticket_id,
            "validation_errors": errors,
        },
    )

    return {
        "request_id": request_id,
        "ticket_subject": ticket_subject,
        "ticket_body": ticket_body,
        "ticket_id": ticket_id,
        "account_id": account_id,
        "plan_tier": plan_tier,
        "errors": errors,
        "retry_count": state.get("retry_count", 0),
        "validated": False,
        "retrieved_docs": [],
        "confidence": 0.0,
        "processing_start_ms": state.get("processing_start_ms", time.time() * 1000),
        "node_timings": timings,
    }
