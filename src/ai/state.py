"""
LangGraph state definition for the triage pipeline.
Every node reads from and writes to this TypedDict.
Using total=False so nodes can return partial updates.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict


class TriageState(TypedDict, total=False):
    # ── Input ──────────────────────────────────────────────────
    raw_input: str
    ticket_subject: str
    ticket_body: str
    ticket_id: Optional[str]
    account_id: Optional[str]
    plan_tier: Optional[str]

    # ── Retrieval ──────────────────────────────────────────────
    # Each entry: {content, doc_id, title, category, score, source}
    retrieved_docs: List[Dict[str, Any]]
    compressed_context: str

    # ── Generation ─────────────────────────────────────────────
    constructed_prompt: str
    raw_llm_output: str
    triage_result: Optional[Dict[str, Any]]

    # ── Scoring ────────────────────────────────────────────────
    confidence: float

    # ── Control flow ───────────────────────────────────────────
    errors: List[str]
    retry_count: int
    validated: bool

    # ── Observability ──────────────────────────────────────────
    request_id: str
    processing_start_ms: float
    node_timings: Dict[str, float]
    prompt_version: str
