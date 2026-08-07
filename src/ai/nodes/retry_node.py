"""
Node 8: Retry
Increments the retry counter before routing back to prompt_construction.
The prompt_construction node will inject a JSON-compliance hint on retry.
"""
from __future__ import annotations

import time
from typing import Any, Dict

from src.ai.state import TriageState
from src.observability.logger import get_logger

logger = get_logger(__name__)


def retry_node(state: TriageState) -> Dict[str, Any]:
    new_count = state.get("retry_count", 0) + 1
    logger.warning(
        "Retrying LLM generation due to invalid output",
        extra={"request_id": state.get("request_id"), "retry_count": new_count},
    )
    timings = {**state.get("node_timings", {}), f"retry_{new_count}": time.time() * 1000}
    return {"retry_count": new_count, "node_timings": timings}
