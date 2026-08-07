"""
LangGraph state definition for the account brief pipeline.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict

class AccountBriefState(TypedDict, total=False):
    # ── Input ──────────────────────────────────────────────────
    account_id: str
    
    # ── Data Fetch ─────────────────────────────────────────────
    account_data: Optional[Dict[str, Any]]
    recent_tickets: List[Dict[str, Any]]
    
    # ── Churn Signals ──────────────────────────────────────────
    churn_risk_flags: List[str]
    escalation_quotes: List[str]
    
    # ── Summarisation ──────────────────────────────────────────
    constructed_prompt: str
    raw_llm_output: str
    
    # ── Output ─────────────────────────────────────────────────
    executive_summary: str
    risks_and_issues: str
    talking_points: str
    account_brief: Optional[Dict[str, Any]]
    
    # ── Control flow ───────────────────────────────────────────
    errors: List[str]
    validated: bool
    
    # ── Observability ──────────────────────────────────────────
    request_id: str
    processing_start_ms: float
    node_timings: Dict[str, float]
    prompt_version: str
