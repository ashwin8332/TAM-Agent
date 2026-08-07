"""
Triage LangGraph — orchestrates the full ticket triage pipeline.

Flow:
  input_validation
    ↓ (if valid body)
  retrieval → context_compression → prompt_construction → llm_generation
    ↓
  output_validation
    ├── (validated=True) → confidence_calculation → logging_node → END
    ├── (validated=False, retry<MAX) → retry_node → prompt_construction
    └── (validated=False, retries exhausted) → logging_node → END
"""
from __future__ import annotations

from typing import Literal

from langgraph.graph import StateGraph, END

import src.config as config
from src.ai.state import TriageState
from src.ai.nodes.input_validation import input_validation_node
from src.ai.nodes.retrieval import retrieval_node
from src.ai.nodes.context_compression import context_compression_node
from src.ai.nodes.prompt_construction import prompt_construction_node
from src.ai.nodes.llm_generation import llm_generation_node
from src.ai.nodes.output_validation import output_validation_node
from src.ai.nodes.confidence_calculation import confidence_calculation_node
from src.ai.nodes.retry_node import retry_node
from src.ai.nodes.logging_node import logging_node

_compiled_graph = None


# ── Routing functions ─────────────────────────────────────────────────────────

def _route_after_input(
    state: TriageState,
) -> Literal["retrieval", "logging_node"]:
    """Abort early only if there is no usable body text."""
    body = state.get("ticket_body", "")
    if not body or len(body.strip()) < 10:
        return "logging_node"
    return "retrieval"


def _route_after_validation(
    state: TriageState,
) -> Literal["confidence_calculation", "retry_node", "logging_node"]:
    """Route based on validation outcome and retry budget."""
    if state.get("validated"):
        return "confidence_calculation"
    if state.get("retry_count", 0) < config.MAX_RETRIES:
        return "retry_node"
    return "logging_node"  # Retries exhausted — emit best-effort result


# ── Graph builder ─────────────────────────────────────────────────────────────

def build_triage_graph() -> StateGraph:
    graph = StateGraph(TriageState)

    # Register all nodes
    graph.add_node("input_validation",      input_validation_node)
    graph.add_node("retrieval",             retrieval_node)
    graph.add_node("context_compression",   context_compression_node)
    graph.add_node("prompt_construction",   prompt_construction_node)
    graph.add_node("llm_generation",        llm_generation_node)
    graph.add_node("output_validation",     output_validation_node)
    graph.add_node("confidence_calculation",confidence_calculation_node)
    graph.add_node("retry_node",            retry_node)
    graph.add_node("logging_node",          logging_node)

    # Entry
    graph.set_entry_point("input_validation")

    # Edges
    graph.add_conditional_edges(
        "input_validation",
        _route_after_input,
        {"retrieval": "retrieval", "logging_node": "logging_node"},
    )
    graph.add_edge("retrieval",           "context_compression")
    graph.add_edge("context_compression", "prompt_construction")
    graph.add_edge("prompt_construction", "llm_generation")
    graph.add_edge("llm_generation",      "output_validation")

    graph.add_conditional_edges(
        "output_validation",
        _route_after_validation,
        {
            "confidence_calculation": "confidence_calculation",
            "retry_node":             "retry_node",
            "logging_node":           "logging_node",
        },
    )

    # Retry loops back to prompt_construction (picks up updated retry_hint)
    graph.add_edge("retry_node",             "prompt_construction")
    graph.add_edge("confidence_calculation", "logging_node")
    graph.add_edge("logging_node",           END)

    return graph


def get_triage_graph():
    """Return the compiled triage graph (singleton)."""
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_triage_graph().compile()
    return _compiled_graph
