"""
Triage Use Case — application-layer orchestrator for Task 1.
Calls the LangGraph pipeline, handles errors, and converts state to domain entity.
Business logic lives here — NOT in FastAPI route handlers.
"""
from __future__ import annotations

import time
import uuid
from typing import Any, Dict

from src.ai.graphs.triage_graph import get_triage_graph
from src.domain.entities import KBMatch, TriageResult
from src.observability.logger import get_logger

logger = get_logger(__name__)


class TriageUseCase:
    """Executes the ticket triage pipeline end-to-end."""

    def execute(self, raw_input: str) -> TriageResult:
        """
        Run the full triage pipeline on a raw ticket input.

        Args:
            raw_input: Either JSON string {subject, body, ...} or plain-text ticket body.

        Returns:
            TriageResult domain entity with all classification, routing, and response fields.

        Raises:
            RuntimeError: If the pipeline fails catastrophically (rare).
        """
        request_id = str(uuid.uuid4())
        processing_start = time.time() * 1000

        initial_state: Dict[str, Any] = {
            "raw_input": raw_input,
            "request_id": request_id,
            "processing_start_ms": processing_start,
            "errors": [],
            "retry_count": 0,
            "validated": False,
            "confidence": 0.0,
            "retrieved_docs": [],
            "node_timings": {},
        }

        graph = get_triage_graph()

        try:
            final_state = graph.invoke(initial_state)
        except Exception as exc:
            logger.error(
                "Triage pipeline failure",
                extra={"request_id": request_id, "error": str(exc)},
            )
            raise RuntimeError(f"Triage pipeline failed: {exc}") from exc

        return self._build_result(final_state, request_id, processing_start)

    # ── Private ───────────────────────────────────────────────────────────────

    def _build_result(
        self,
        state: Dict[str, Any],
        request_id: str,
        processing_start: float,
    ) -> TriageResult:
        triage = state.get("triage_result") or {}
        retrieved = state.get("retrieved_docs", [])
        confidence = state.get("confidence", 0.0)
        prompt_version = state.get("prompt_version", "unknown")

        ticket_id = (
            state.get("ticket_id")
            or triage.get("ticket_id")
            or f"AUTO-{request_id[:8].upper()}"
        )
        processing_time_ms = (
            triage.get("processing_time_ms")
            or round(time.time() * 1000 - processing_start, 2)
        )

        # Build KB match — prefer LLM-provided, fall back to top retrieved doc
        kb_match = self._build_kb_match(triage, retrieved)

        return TriageResult(
            ticket_id=ticket_id,
            product=triage.get("product", "Unknown"),
            product_area=triage.get("product_area", "Unknown"),
            issue_category=triage.get("issue_category", "How-To"),
            urgency_tier=triage.get("urgency_tier", "P3"),
            urgency_reasoning=triage.get("urgency_reasoning", ""),
            recommended_team=triage.get("recommended_team", "Tier-1 Support"),
            kb_match=kb_match,
            draft_first_response=triage.get("draft_first_response", ""),
            classification_reasoning=triage.get("classification_reasoning", ""),
            confidence=confidence,
            retrieved_docs=[d.get("doc_id", "") for d in retrieved],
            processing_time_ms=processing_time_ms,
            request_id=request_id,
            prompt_version=prompt_version,
        )

    @staticmethod
    def _build_kb_match(triage: Dict, retrieved: list) -> KBMatch | None:
        llm_kb = triage.get("kb_match")
        if llm_kb and isinstance(llm_kb, dict) and llm_kb.get("doc_id"):
            return KBMatch(
                doc_id=str(llm_kb.get("doc_id", "")),
                doc_title=str(llm_kb.get("doc_title", "")),
                relevant_section=str(llm_kb.get("relevant_section", "")),
                relevance_score=float(llm_kb.get("relevance_score", 0.0)),
            )
        if retrieved:
            top = retrieved[0]
            return KBMatch(
                doc_id=top.get("doc_id", ""),
                doc_title=top.get("title", ""),
                relevant_section="",
                relevance_score=top.get("score", 0.0),
            )
        return None
