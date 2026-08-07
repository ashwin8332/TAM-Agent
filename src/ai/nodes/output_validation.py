"""
Node 6: Output Validation
Validates and repairs the raw LLM JSON output.
Sets validated=True on success, triggers retry on failure (up to MAX_RETRIES).
"""
from __future__ import annotations

import time
from typing import Any, Dict

from src.ai.state import TriageState
from src.ai.output_validator import validate_and_repair
from src.observability.logger import get_logger

logger = get_logger(__name__)


def output_validation_node(state: TriageState) -> Dict[str, Any]:
    start = time.time()
    errors = list(state.get("errors", []))

    raw_output = state.get("raw_llm_output", "")
    if not raw_output:
        errors.append("Validation failed: LLM output is empty")
        elapsed = (time.time() - start) * 1000
        return {
            "validated": False,
            "triage_result": None,
            "errors": errors,
            "node_timings": {**state.get("node_timings", {}), "output_validation": round(elapsed, 2)},
        }

    parsed, is_valid, error_msg = validate_and_repair(raw_output)

    if not is_valid:
        errors.append(f"Output validation: {error_msg}")
        logger.warning(
            "output_validation failed",
            extra={
                "request_id": state.get("request_id"),
                "error": error_msg,
                "retry_count": state.get("retry_count", 0),
            },
        )
    else:
        logger.info("output_validation passed", extra={"request_id": state.get("request_id")})

    elapsed_ms = (time.time() - start) * 1000
    timings = {**state.get("node_timings", {}), "output_validation": round(elapsed_ms, 2)}

    return {
        "validated": is_valid,
        "triage_result": parsed,
        "errors": errors,
        "node_timings": timings,
    }
