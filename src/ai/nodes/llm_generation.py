"""
Node 5: LLM Generation
Sends the constructed prompt to Ollama and captures the raw output.
Error handling ensures the pipeline continues even on LLM failures.
"""
from __future__ import annotations

import time
from typing import Any, Dict

from src.ai.state import TriageState
from src.infrastructure.llm_client import LLMClient
from src.observability.logger import get_logger

logger = get_logger(__name__)


def llm_generation_node(state: TriageState) -> Dict[str, Any]:
    start = time.time()
    errors = list(state.get("errors", []))

    prompt = state.get("constructed_prompt", "")
    if not prompt:
        errors.append("LLM generation skipped: prompt is empty")
        elapsed = (time.time() - start) * 1000
        return {
            "raw_llm_output": "",
            "errors": errors,
            "node_timings": {**state.get("node_timings", {}), "llm_generation": round(elapsed, 2)},
        }

    llm = LLMClient.get_instance()
    raw_output = ""
    try:
        raw_output = llm.generate(prompt)
    except Exception as exc:
        error_msg = f"LLM generation error: {exc}"
        errors.append(error_msg)
        logger.error("LLM call failed", extra={"request_id": state.get("request_id"), "error": str(exc)})

    elapsed_ms = (time.time() - start) * 1000
    timings = {**state.get("node_timings", {}), "llm_generation": round(elapsed_ms, 2)}

    logger.info(
        "llm_generation complete",
        extra={
            "request_id": state.get("request_id"),
            "output_len": len(raw_output),
            "latency_ms": round(elapsed_ms, 2),
            "model": llm.model_name,
        },
    )

    return {
        "raw_llm_output": raw_output,
        "errors": errors,
        "node_timings": timings,
    }
