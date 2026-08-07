"""
Execution tracer — records node timings and request metadata.
Future: LangSmith integration hook point.
"""
from __future__ import annotations

import time
import uuid
from typing import Any, Dict, Optional

from src.observability.logger import get_logger

logger = get_logger(__name__)


class ExecutionTrace:
    """Captures a single request's execution trace."""

    def __init__(self, request_id: Optional[str] = None) -> None:
        self.request_id: str = request_id or str(uuid.uuid4())
        self.start_time: float = time.time()
        self.node_timings: Dict[str, float] = {}
        self.metadata: Dict[str, Any] = {}

    def record_node(self, node_name: str, duration_ms: float) -> None:
        self.node_timings[node_name] = round(duration_ms, 2)

    def set_metadata(self, **kwargs: Any) -> None:
        self.metadata.update(kwargs)

    def total_ms(self) -> float:
        return round((time.time() - self.start_time) * 1000, 2)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "request_id": self.request_id,
            "total_ms": self.total_ms(),
            "node_timings": self.node_timings,
            **self.metadata,
        }

    def log_summary(self) -> None:
        logger.info("Request trace complete", extra=self.to_dict())


class Tracer:
    @staticmethod
    def new_trace(request_id: Optional[str] = None) -> ExecutionTrace:
        return ExecutionTrace(request_id=request_id)
