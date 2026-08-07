import json
import time
from typing import Dict, Any, List

from src.ai.account_state import AccountBriefState
from src.infrastructure.data_loader import DataLoader
from src.infrastructure.llm_client import LLMClient
from src.infrastructure.prompt_manager import PromptManager
from src.observability.logger import get_logger

logger = get_logger(__name__)

def fetch_account_data(state: AccountBriefState) -> Dict[str, Any]:
    start = time.perf_counter()
    account_id = state.get("account_id")
    
    loader = DataLoader.get_instance()
    account_data = loader.get_account(account_id)
    recent_tickets = loader.get_tickets_for_account(account_id, days=90)
    
    timings = state.get("node_timings", {})
    timings["fetch_account_data"] = (time.perf_counter() - start) * 1000
    
    return {
        "account_data": account_data,
        "recent_tickets": recent_tickets,
        "node_timings": timings
    }

def detect_churn_signals(state: AccountBriefState) -> Dict[str, Any]:
    start = time.perf_counter()
    account = state.get("account_data")
    tickets = state.get("recent_tickets", [])
    
    flags = []
    quotes = []
    
    if account:
        status = account.get("health_status", "")
        trend = account.get("usage_trend", "")
        p1_count = account.get("p1_tickets_last_30d", 0)
        nps = account.get("nps_score")
        notes = account.get("escalation_notes", [])
        
        if status in ["Churning", "At Risk"]:
            flags.append(f"Health Status is {status}")
            
        if trend in ["Declining", "Inactive"]:
            flags.append(f"Usage Trend is {trend}")
            
        if p1_count > 2:
            flags.append(f"High number of P1 tickets in last 30d ({p1_count})")
            
        if nps is not None and nps < 5:
            flags.append(f"Low NPS Score ({nps})")
            
        churn_keywords = ["competitor", "cancel", "churn", "frustration", "champion left", "evaluating alternatives"]
        for note in notes:
            if any(kw in note.lower() for kw in churn_keywords):
                flags.append("Escalation note contains churn keyword(s)")
                quotes.append(note)
                
    # Also check tickets for direct quotes if needed
    for t in tickets:
        if t.get("urgency") == "P1":
            body = t.get("body", "")
            if any(kw in body.lower() for kw in ["competitor", "cancel", "churn", "frustration"]):
                quotes.append(f"From ticket {t.get('ticket_id')}: {body[:100]}...")
                flags.append(f"Ticket {t.get('ticket_id')} expresses severe frustration/churn risk")

    timings = state.get("node_timings", {})
    timings["detect_churn_signals"] = (time.perf_counter() - start) * 1000

    return {
        "churn_risk_flags": flags,
        "escalation_quotes": quotes,
        "node_timings": timings
    }

def generate_brief_sections(state: AccountBriefState) -> Dict[str, Any]:
    start = time.perf_counter()
    account_data = state.get("account_data")
    if not account_data:
        # Fallback if account not found
        return {
            "executive_summary": "Account not found.",
            "risks_and_issues": "N/A",
            "talking_points": "Verify account ID.",
            "errors": ["Account not found"],
            "validated": False
        }
        
    recent_tickets = state.get("recent_tickets", [])
    churn_flags = state.get("churn_risk_flags", [])
    quotes = state.get("escalation_quotes", [])
    
    churn_signals_context = {
        "flags": churn_flags,
        "direct_quotes": quotes
    }
    
    prompt_manager = PromptManager.get_instance()
    
    # Use python str.format format since template uses {variable} instead of {{variable}}
    # Wait, PromptManager's render uses {{variable}}.
    # We should use .load() and .format() since our prompt uses {variable}.
    # Let's fix the prompt or just use load() and string formatting.
    prompt_template_text = prompt_manager.load("account_brief_v1")
    prompt = prompt_template_text.format(
        account_data=json.dumps(account_data),
        recent_tickets=json.dumps(recent_tickets),
        churn_signals=json.dumps(churn_signals_context)
    )
    
    llm = LLMClient.get_instance()
    # Task 2 requires deterministic output, temperature=0, seed=42 are already configured in .env and LLMClient
    raw_output = llm.generate(prompt=prompt)
    
    timings = state.get("node_timings", {})
    timings["generate_brief_sections"] = (time.perf_counter() - start) * 1000
    
    return {
        "constructed_prompt": prompt,
        "raw_llm_output": raw_output,
        "prompt_version": prompt_manager.get_version("account_brief_v1"),
        "node_timings": timings
    }

def validate_account_brief(state: AccountBriefState) -> Dict[str, Any]:
    start = time.perf_counter()
    raw_output = state.get("raw_llm_output", "")
    errors = state.get("errors", [])
    
    brief = None
    validated = False
    
    if raw_output:
        try:
            # Extract JSON block if surrounded by markdown
            clean_output = raw_output
            if "```json" in clean_output:
                clean_output = clean_output.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_output:
                clean_output = clean_output.split("```")[1].strip()
                
            brief_dict = json.loads(clean_output)
            
            # Reconstruct to ensure keys
            brief = {
                "executive_summary": brief_dict.get("executive_summary", ""),
                "risks_and_issues": brief_dict.get("risks_and_issues", ""),
                "talking_points": brief_dict.get("talking_points", "")
            }
            validated = True
        except Exception as e:
            errors.append(f"JSON Parsing failed: {str(e)}")
            logger.error("Failed to parse Account Brief output", extra={"error": str(e), "raw": raw_output})
            brief = {
                "executive_summary": "Failed to generate brief.",
                "risks_and_issues": "Parsing error.",
                "talking_points": "Please retry."
            }
            
    timings = state.get("node_timings", {})
    timings["validate_account_brief"] = (time.perf_counter() - start) * 1000
    
    result = {
        "errors": errors,
        "validated": validated,
        "node_timings": timings
    }
    
    if brief:
        result["executive_summary"] = brief["executive_summary"]
        result["risks_and_issues"] = brief["risks_and_issues"]
        result["talking_points"] = brief["talking_points"]
        result["account_brief"] = brief
        
    return result
