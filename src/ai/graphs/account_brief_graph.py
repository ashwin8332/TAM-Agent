"""
LangGraph state graph for Task 2 — TAM Account Health Summariser.
"""
from langgraph.graph import END, StateGraph

from src.ai.account_state import AccountBriefState
from src.ai.nodes.account_nodes import (
    fetch_account_data,
    detect_churn_signals,
    generate_brief_sections,
    validate_account_brief
)

def build_account_brief_graph() -> StateGraph:
    workflow = StateGraph(AccountBriefState)
    
    workflow.add_node("fetch_account_data", fetch_account_data)
    workflow.add_node("detect_churn_signals", detect_churn_signals)
    workflow.add_node("generate_brief_sections", generate_brief_sections)
    workflow.add_node("validate_account_brief", validate_account_brief)
    
    # We can reuse the logging node if we adapt it or create a new one. 
    # Let's create a small wrapper for logging.
    def log_account_brief(state: AccountBriefState):
        import logging
        logger = logging.getLogger(__name__)
        logger.info(
            "Completed Account Brief Generation",
            extra={
                "request_id": state.get("request_id"),
                "account_id": state.get("account_id"),
                "validated": state.get("validated"),
                "errors": state.get("errors", []),
                "churn_risk_flags": state.get("churn_risk_flags", []),
            }
        )
        return {}
    
    workflow.add_node("log_account_brief", log_account_brief)
    
    workflow.set_entry_point("fetch_account_data")
    workflow.add_edge("fetch_account_data", "detect_churn_signals")
    workflow.add_edge("detect_churn_signals", "generate_brief_sections")
    workflow.add_edge("generate_brief_sections", "validate_account_brief")
    workflow.add_edge("validate_account_brief", "log_account_brief")
    workflow.add_edge("log_account_brief", END)
    
    return workflow.compile()
