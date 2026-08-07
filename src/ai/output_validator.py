"""
Output Validator — validates and repairs raw LLM JSON output.
Uses json-repair for malformed JSON before Pydantic validation.
Returns a (parsed_dict, is_valid, error_message) tuple.
"""
from __future__ import annotations

import json
import re
from typing import Any, Dict, Optional, Tuple

from json_repair import repair_json

from src.observability.logger import get_logger

logger = get_logger(__name__)

VALID_CATEGORIES = frozenset({
    "Bug", "Feature Request", "How-To", "Performance",
    "Billing", "Integration", "Onboarding", "Data Loss",
})
VALID_URGENCIES = frozenset({"P1", "P2", "P3", "P4"})
VALID_PRODUCTS = frozenset({
    "DataBridge Pro", "CloudSync", "AnalyticsHub",
    "SecureVault", "WorkflowEngine", "Unknown",
})
REQUIRED_FIELDS = [
    "product", "issue_category", "urgency_tier",
    "recommended_team", "draft_first_response", "urgency_reasoning",
]


def _normalize_category(raw: Any) -> Any:
    """
    The LLM sometimes concatenates urgency onto the category, e.g. "Bug P1"
    instead of "Bug". Strip a trailing/leading P1-P4 token before validating,
    rather than silently accepting or rejecting the malformed value.
    """
    if not isinstance(raw, str):
        return raw
    stripped = re.sub(r"\b(P[1-4])\b", "", raw).strip(" -,:")
    return stripped if stripped in VALID_CATEGORIES else raw


def _extract_json_from_text(text: str) -> str:
    """
    Extract a JSON object from LLM output that may contain preamble or prose.
    Tries multiple strategies in order.
    """
    text = text.strip()

    # 1. Direct parse
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass

    # 2. Markdown code fence (```json ... ```)
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fence:
        return fence.group(1)

    # 3. First { to last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]

    # 4. Return full text and let json-repair try
    return text


def validate_and_repair(
    raw_output: str,
) -> Tuple[Optional[Dict[str, Any]], bool, str]:
    """
    Validate and (if necessary) repair the LLM's JSON output.

    Returns:
        (parsed_dict, is_valid, error_message)
        - parsed_dict: the best-effort parsed dict (may be partial if not valid)
        - is_valid: True only if all required fields are present and correct
        - error_message: human-readable error string if not valid, else ""
    """
    if not raw_output or not raw_output.strip():
        return None, False, "LLM output is empty"

    extracted = _extract_json_from_text(raw_output)

    parsed: Optional[Dict[str, Any]] = None
    try:
        parsed = json.loads(extracted)
    except json.JSONDecodeError:
        logger.debug("Direct JSON parse failed — attempting json-repair")
        try:
            repaired = repair_json(extracted)
            parsed = json.loads(repaired)
            logger.debug("JSON repair succeeded")
        except Exception as exc:
            return None, False, f"JSON parse and repair both failed: {exc}"

    if not isinstance(parsed, dict):
        return None, False, "Parsed result is not a JSON object"

    # Field presence check
    missing = [f for f in REQUIRED_FIELDS if not parsed.get(f)]
    if missing:
        return parsed, False, f"Missing required fields: {missing}"

    # Urgency must be valid enum
    if parsed.get("urgency_tier") not in VALID_URGENCIES:
        return parsed, False, f"Invalid urgency_tier: {parsed.get('urgency_tier')!r}"

    # Category: attempt normalization (e.g. "Bug P1" -> "Bug"), then hard-fail
    # so the retry loop can correct genuinely unrecognised categories instead
    # of silently passing malformed classification downstream.
    parsed["issue_category"] = _normalize_category(parsed.get("issue_category"))
    if parsed.get("issue_category") not in VALID_CATEGORIES:
        return parsed, False, f"Invalid issue_category: {parsed.get('issue_category')!r}"

    if parsed.get("product") not in VALID_PRODUCTS:
        logger.warning("Unrecognised product", extra={"got": parsed.get("product")})

    return parsed, True, ""
