import time
import uuid
from typing import Dict

from src.ai.graphs.account_brief_graph import build_account_brief_graph
from src.ai.account_state import AccountBriefState
from src.domain.entities import AccountBrief
from src.observability.logger import get_logger

logger = get_logger(__name__)

class AccountBriefUseCase:
    """Application use case for generating TAM account briefs."""
    
    def __init__(self):
        self.graph = build_account_brief_graph()

    async def execute(self, account_id: str) -> AccountBrief:
        start_time = time.perf_counter()
        request_id = str(uuid.uuid4())
        
        logger.info("Executing Account Brief UseCase", extra={"account_id": account_id, "request_id": request_id})
        
        initial_state: AccountBriefState = {
            "account_id": account_id,
            "request_id": request_id,
            "processing_start_ms": start_time * 1000,
            "node_timings": {},
            "errors": [],
            "validated": False,
        }
        
        final_state = await self.graph.ainvoke(initial_state)
        
        processing_time_ms = (time.perf_counter() - start_time) * 1000
        
        return AccountBrief(
            account_id=account_id,
            executive_summary=final_state.get("executive_summary", "Failed to generate brief."),
            risks_and_issues=final_state.get("risks_and_issues", "N/A"),
            talking_points=final_state.get("talking_points", "Please review errors."),
            churn_risk_flags=final_state.get("churn_risk_flags", []),
            request_id=request_id,
            processing_time_ms=processing_time_ms
        )
