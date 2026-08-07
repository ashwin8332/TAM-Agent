"""
Node 7: Confidence Calculation
Computes a 0–1 confidence score from retrieval quality and output completeness.
This is a proxy metric — not a probabilistic guarantee.
"""
from __future__ import annotations

import re
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

# Concrete, checkable signals that a ticket actually names a real product,
# module, or error condition, rather than a vague "it's broken" complaint.
_ERROR_CODE_PATTERN = re.compile(r"\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b")
_PRODUCT_KEYWORDS = (
    "pipeline", "connector", "schema", "ingestion", "sync", "cloudsync",
    "dashboard", "analytics", "report", "vault", "secret", "key rotation",
    "saml", "sso", "audit log", "workflow", "trigger", "automation",
    "webhook", "databridge", "securevault", "analyticshub", "workflowengine",
)


def _has_concrete_signal(text: str) -> bool:
    """True if the ticket text names an error code or a known product/module keyword."""
    if _ERROR_CODE_PATTERN.search(text):
        return True
    lower = text.lower()
    return any(kw in lower for kw in _PRODUCT_KEYWORDS)


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

    confidence = min(score, 1.0)

    # Ambiguity penalty: if the ticket text itself contains no concrete product,
    # module, or error-code signal, the classification is effectively a guess
    # even when the LLM still emits well-formed enum values — cap confidence
    # so ambiguous/adversarial tickets (e.g. "It is broken. Nothing works.")
    # are correctly flagged as low-confidence instead of scoring high purely
    # on output format validity.
    ticket_text = f"{state.get('ticket_subject', '')} {state.get('ticket_body', '')}"
    if not _has_concrete_signal(ticket_text):
        confidence = min(confidence, 0.5)

    confidence = round(confidence, 4)
    elapsed_ms = (time.time() - start) * 1000
    timings = {**state.get("node_timings", {}), "confidence_calculation": round(elapsed_ms, 2)}

    logger.info(
        "confidence_calculation complete",
        extra={"request_id": state.get("request_id"), "confidence": confidence},
    )

    return {"confidence": confidence, "node_timings": timings}
