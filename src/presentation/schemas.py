"""
Pydantic schemas for FastAPI request/response validation.
Intentionally decoupled from domain entities so the API contract
can evolve independently of the domain model.
"""
from __future__ import annotations

import json
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# ── Request models ────────────────────────────────────────────────────────────

class TriageRequest(BaseModel):
    """Structured ticket input. Supports all known ticket fields."""
    subject: Optional[str] = Field(None, description="Ticket subject line")
    body: str = Field(..., min_length=10, description="Full ticket body text")
    ticket_id: Optional[str] = Field(None, description="Existing ticket ID if available")
    account_id: Optional[str] = Field(None, description="Account ID for contextual routing")
    plan_tier: Optional[Literal["Starter", "Professional", "Business", "Enterprise"]] = None

    def to_raw_json(self) -> str:
        return json.dumps(self.model_dump(exclude_none=True))


class PlainTextTriageRequest(BaseModel):
    """Minimal input — just paste the ticket text."""
    text: str = Field(
        ..., min_length=10,
        description="Raw ticket text (subject and body combined, plain text).",
    )


# ── Response models ───────────────────────────────────────────────────────────

class KBMatchResponse(BaseModel):
    doc_id: str
    doc_title: str
    relevant_section: str = ""
    relevance_score: float = Field(ge=0.0, le=1.0)


class TriageResultResponse(BaseModel):
    ticket_id: str
    product: str
    product_area: str
    issue_category: str
    urgency_tier: Literal["P1", "P2", "P3", "P4"]
    urgency_reasoning: str
    recommended_team: str
    kb_match: Optional[KBMatchResponse] = None
    draft_first_response: str
    classification_reasoning: str = ""
    confidence: float = Field(ge=0.0, le=1.0)
    retrieved_docs: List[str] = []
    processing_time_ms: float
    request_id: str
    prompt_version: str

    class Config:
        json_schema_extra = {
            "example": {
                "ticket_id": "TKT-10042",
                "product": "DataBridge Pro",
                "product_area": "Connectors",
                "issue_category": "Bug",
                "urgency_tier": "P2",
                "urgency_reasoning": "Production pipeline failing, 47 users impacted, no workaround found.",
                "recommended_team": "Senior Engineering Support",
                "kb_match": {
                    "doc_id": "products/databridge-pro",
                    "doc_title": "DataBridge Pro — Product Reference",
                    "relevant_section": "Pipeline stopped processing",
                    "relevance_score": 0.92,
                },
                "draft_first_response": "Hi team,\n\nThank you for reaching out...",
                "classification_reasoning": "ERR_CONNECTION_TIMEOUT indicates a network/source issue in DataBridge Pro Connectors.",
                "confidence": 0.87,
                "retrieved_docs": ["products/databridge-pro", "troubleshooting/performance-and-integrations"],
                "processing_time_ms": 3421.5,
                "request_id": "550e8400-e29b-41d4-a716-446655440000",
                "prompt_version": "1.0.0",
            }
        }


class HealthResponse(BaseModel):
    status: str
    model: str
    embedding_model: str
    index_ready: bool


class IndexRebuildResponse(BaseModel):
    status: str
    message: str
