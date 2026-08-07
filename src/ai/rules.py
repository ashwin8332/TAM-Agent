"""
Deterministic rule-based overrides that supplement (not replace) LLM
classification for Task 1. Used where the assignment/prompt already define
an unambiguous lookup (team routing) or where broad, generalizable keyword
signals reliably identify a category class the small local LLM tends to
mis-classify (e.g. billing/feature-request language getting mislabeled as
"Performance"). These are intentionally conservative: they only fire on
clear signals and fall back to the LLM's own classification otherwise.
"""
from __future__ import annotations

from typing import Optional

_DATA_LOSS_KEYWORDS = (
    "data loss", "lost data", "deleted data", "data was deleted",
    "missing records", "checksum_mismatch",
)
_BILLING_KEYWORDS = (
    "invoice", "billing", "charge", "charged", "seats", "pro-rated",
    "prorated", "pricing", "refund", "payment", "subscription cost",
)
_FEATURE_REQUEST_KEYWORDS = (
    "would be great", "feature request", "please add", "could you add",
    "it would be nice", "can you add", "feature suggestion",
)
_HOWTO_KEYWORDS = (
    "how do i", "how to", "documentation question", "guide me",
)

# Team routing is a pure, deterministic function of (category, urgency) per
# the assignment's own routing table (prompts/triage_v1.md) — trusting an
# LLM to re-derive it introduces avoidable risk for zero benefit.
_TEAM_BY_CATEGORY = {
    "Performance": "Platform Engineering",
    "Integration": "Integration Specialists",
    "Billing": "Billing Team",
    "Feature Request": "Product Team",
    "How-To": "Customer Success",
    "Onboarding": "Customer Success",
    "Data Loss": "Escalation Engineering",
}


def rule_based_category(subject: str, body: str) -> Optional[str]:
    """Return a confident category override, or None to defer to the LLM."""
    text = f"{subject} {body}".lower()
    if any(kw in text for kw in _DATA_LOSS_KEYWORDS):
        return "Data Loss"
    if any(kw in text for kw in _BILLING_KEYWORDS):
        return "Billing"
    if any(kw in text for kw in _FEATURE_REQUEST_KEYWORDS):
        return "Feature Request"
    if any(kw in text for kw in _HOWTO_KEYWORDS):
        return "How-To"
    return None


def rule_based_team(category: str, urgency: str) -> str:
    """Deterministically route (category, urgency) -> responder team."""
    if category == "Bug":
        return "Senior Engineering Support" if urgency in ("P1", "P2") else "Tier-1 Support"
    if category == "Data Loss":
        return "Escalation Engineering"
    return _TEAM_BY_CATEGORY.get(category, "Tier-1 Support")
