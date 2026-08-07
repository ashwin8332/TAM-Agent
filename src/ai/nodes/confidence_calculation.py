"""
Node 7: Confidence Calculation
Computes a 0–1 confidence score from retrieval quality and output completeness.
This is a proxy metric — not a probabilistic guarantee.
"""
from __future__ import annotations

import time
from typing import Any, Dict

from src.ai.state import TriageState
from src.observability.logger import get_logger

logger = get_logger(__name__)

_VALID_CATEGORIES = frozenset({
    "Bug", "Feature Request", "How-To", "Performance",
    "Billing", "Integration", "Onboarding", "Data Loss",
})
_VALID_URGENCIES = frozenset({"P1", "P2", "P3", "P4"})
_VALID_PRODUCTS = frozenset({
    "DataBridge Pro", "CloudSync", "AnalyticsHub",
    "SecureVault", "WorkflowEngine",
})

_WEIGHTS = {
    "retrieval_quality": 0.30,
    "valid_category":    0.20,
    "valid_urgency":     0.20,
    "valid_product":     0.15,
    "has_draft":         0.10,
    "has_reasoning":     0.05,
}


def confidence_calculation_node(state: TriageState) -> Dict[str, Any]:
    start = time.time()

    result = state.get("triage_result") or {}
    docs = state.get("retrieved_docs", [])

    score = 0.0

    # Retrieval quality: mean similarity of top-3 retrieved docs
    if docs:
        top_scores = [d.get("score", 0) for d in docs[:3]]
        retrieval_score = sum(top_scores) / len(top_scores)
        score += _WEIGHTS["retrieval_quality"] * min(retrieval_score, 1.0)

    if result.get("issue_category") in _VALID_CATEGORIES:
        score += _WEIGHTS["valid_category"]

    if result.get("urgency_tier") in _VALID_URGENCIES:
        score += _WEIGHTS["valid_urgency"]

    if result.get("product") in _VALID_PRODUCTS:
        score += _WEIGHTS["valid_product"]

    if str(result.get("draft_first_response", "")).strip():
        score += _WEIGHTS["has_draft"]

    if str(result.get("urgency_reasoning", "")).strip():
        score += _WEIGHTS["has_reasoning"]

    confidence = round(min(score, 1.0), 4)
    elapsed_ms = (time.time() - start) * 1000
    timings = {**state.get("node_timings", {}), "confidence_calculation": round(elapsed_ms, 2)}

    logger.info(
        "confidence_calculation complete",
        extra={"request_id": state.get("request_id"), "confidence": confidence},
    )

    return {"confidence": confidence, "node_timings": timings}
