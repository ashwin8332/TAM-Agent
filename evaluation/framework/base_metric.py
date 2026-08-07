from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseMetric(ABC):
    """Abstract base class for all evaluation metrics."""
    
    @abstractmethod
    def evaluate(self, result: Dict[str, Any], expected_criteria: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate the result against expected criteria.
        Should return a dictionary containing at least:
        - passed: bool
        - score: float (0.0 to 1.0)
        - details: str (Reasoning)
        """
        pass
