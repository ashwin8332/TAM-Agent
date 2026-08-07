"""
Domain entities — pure data models with zero infrastructure dependencies.
These are the core business objects of the system.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class Ticket:
    ticket_id: str
    subject: str
    body: str
    account_id: Optional[str] = None
    product: Optional[str] = None
    product_area: Optional[str] = None
    category: Optional[str] = None
    urgency: Optional[str] = None
    status: Optional[str] = None
    plan_tier: Optional[str] = None
    channel: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    created_at: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict) -> "Ticket":
        return cls(
            ticket_id=data.get("ticket_id", ""),
            subject=data.get("subject", ""),
            body=data.get("body", ""),
            account_id=data.get("account_id"),
            product=data.get("product"),
            product_area=data.get("product_area"),
            category=data.get("category"),
            urgency=data.get("urgency"),
            status=data.get("status"),
            plan_tier=data.get("plan_tier"),
            channel=data.get("channel"),
            tags=data.get("tags", []),
            created_at=data.get("created_at"),
        )


@dataclass
class Account:
    account_id: str
    company: str
    tam: Optional[str] = None
    plan_tier: Optional[str] = None
    arr_usd: Optional[int] = None
    health_status: Optional[str] = None
    usage_trend: Optional[str] = None
    open_tickets: int = 0
    p1_tickets_last_30d: int = 0
    nps_score: Optional[int] = None
    renewal_date: Optional[str] = None
    escalation_notes: List[str] = field(default_factory=list)
    products: List[str] = field(default_factory=list)
    region: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict) -> "Account":
        return cls(
            account_id=data.get("account_id", ""),
            company=data.get("company", ""),
            tam=data.get("tam"),
            plan_tier=data.get("plan_tier"),
            arr_usd=data.get("arr_usd"),
            health_status=data.get("health_status"),
            usage_trend=data.get("usage_trend"),
            open_tickets=data.get("open_tickets", 0),
            p1_tickets_last_30d=data.get("p1_tickets_last_30d", 0),
            nps_score=data.get("nps_score"),
            renewal_date=data.get("renewal_date"),
            escalation_notes=data.get("escalation_notes", []),
            products=data.get("products", []),
            region=data.get("region"),
        )


@dataclass
class KBMatch:
    doc_id: str
    doc_title: str
    relevant_section: str
    relevance_score: float


@dataclass
class TriageResult:
    ticket_id: str
    product: str
    product_area: str
    issue_category: str
    urgency_tier: str
    urgency_reasoning: str
    recommended_team: str
    kb_match: Optional[KBMatch]
    draft_first_response: str
    classification_reasoning: str
    confidence: float
    retrieved_docs: List[str]
    processing_time_ms: float
    request_id: str
    prompt_version: str

    def to_dict(self) -> Dict:
        return {
            "ticket_id": self.ticket_id,
            "product": self.product,
            "product_area": self.product_area,
            "issue_category": self.issue_category,
            "urgency_tier": self.urgency_tier,
            "urgency_reasoning": self.urgency_reasoning,
            "recommended_team": self.recommended_team,
            "kb_match": {
                "doc_id": self.kb_match.doc_id,
                "doc_title": self.kb_match.doc_title,
                "relevant_section": self.kb_match.relevant_section,
                "relevance_score": round(self.kb_match.relevance_score, 4),
            } if self.kb_match else None,
            "draft_first_response": self.draft_first_response,
            "classification_reasoning": self.classification_reasoning,
            "confidence": round(self.confidence, 4),
            "retrieved_docs": self.retrieved_docs,
            "processing_time_ms": round(self.processing_time_ms, 2),
            "request_id": self.request_id,
            "prompt_version": self.prompt_version,
        }


@dataclass
class AccountBrief:
    account_id: str
    executive_summary: str
    risks_and_issues: str
    talking_points: str
    churn_risk_flags: List[str]
    request_id: str
    processing_time_ms: float

    def to_dict(self) -> Dict:
        return {
            "account_id": self.account_id,
            "executive_summary": self.executive_summary,
            "risks_and_issues": self.risks_and_issues,
            "talking_points": self.talking_points,
            "churn_risk_flags": self.churn_risk_flags,
            "request_id": self.request_id,
            "processing_time_ms": round(self.processing_time_ms, 2),
        }
