"""
Node 4: Prompt Construction
Assembles the final LLM prompt from the versioned template + context.
Prompts are NEVER hardcoded — always loaded from prompts/ directory.
On retry attempts, injects a hint to improve JSON compliance.
"""
from __future__ import annotations

import time
from typing import Any, Dict

from src.ai.state import TriageState
from src.infrastructure.prompt_manager import PromptManager
from src.observability.logger import get_logger

logger = get_logger(__name__)

_PROMPT_NAME = "triage_v1"


def prompt_construction_node(state: TriageState) -> Dict[str, Any]:
    start = time.time()
    pm = PromptManager.get_instance()
    version = pm.get_version(_PROMPT_NAME)

    retry_count = state.get("retry_count", 0)
    retry_hint = ""
    if retry_count > 0:
        retry_hint = (
            f"\n\n⚠️ RETRY ATTEMPT {retry_count}: Your previous response failed JSON parsing. "
            "Output ONLY the JSON object. Do NOT include any explanation, markdown, or code fences. "
            "Start immediately with { and end with }."
        )

    prompt = pm.render(
        _PROMPT_NAME,
        ticket_subject=state.get("ticket_subject") or "(no subject)",
        ticket_body=state.get("ticket_body", ""),
        plan_tier=state.get("plan_tier") or "Unknown",
        retrieved_context=state.get("compressed_context", "No context available."),
        retry_hint=retry_hint,
    )

    elapsed_ms = (time.time() - start) * 1000
    timings = {**state.get("node_timings", {}), "prompt_construction": round(elapsed_ms, 2)}

    logger.debug(
        "prompt_construction complete",
        extra={
            "request_id": state.get("request_id"),
            "prompt_version": version,
            "prompt_len": len(prompt),
            "is_retry": retry_count > 0,
        },
    )

    return {
        "constructed_prompt": prompt,
        "prompt_version": version,
        "node_timings": timings,
    }
