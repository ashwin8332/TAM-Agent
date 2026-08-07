from typing import Dict, Any
from evaluation.framework.base_metric import BaseMetric

class ExactMatchMetric(BaseMetric):
    def evaluate(self, result: Dict[str, Any], expected_criteria: Dict[str, Any]) -> Dict[str, Any]:
        details = []
        passed = True
        
        for key, expected_value in expected_criteria.items():
            if key == "kb_doc_id_contains":
                kb_match = result.get("kb_match", {})
                if not kb_match or expected_value not in kb_match.get("doc_id", ""):
                    passed = False
                    details.append(f"Expected kb_match.doc_id to contain {expected_value}")
                continue
                
            if key == "confidence_lt":
                conf = result.get("confidence", 1.0)
                if conf >= expected_value:
                    passed = False
                    details.append(f"Expected confidence < {expected_value}, got {conf}")
                continue
                
            if key == "churn_flags_empty":
                flags = result.get("churn_risk_flags", [])
                if bool(flags) != (not expected_value):
                    passed = False
                    details.append(f"Expected churn_flags_empty={expected_value}, but got {flags}")
                continue
                
            if key == "risks_and_issues_non_empty":
                risks = result.get("risks_and_issues", "")
                is_empty = not risks or risks == "N/A"
                if is_empty == expected_value:
                    passed = False
                    details.append(f"Expected risks_and_issues to be non-empty")
                continue
                
            if key == "has_churn_flag_containing":
                flags = result.get("churn_risk_flags", [])
                found = any(expected_value in f for f in flags)
                if not found:
                    passed = False
                    details.append(f"Expected churn flag containing '{expected_value}', got {flags}")
                continue
                
            if key == "identical_outputs":
                # Special handling in run_eval.py for determinism
                continue
                
            if key == "executive_summary_contains":
                summary = result.get("executive_summary", "")
                if expected_value not in summary:
                    passed = False
                    details.append(f"Expected executive_summary to contain '{expected_value}'")
                continue

            # Default exact match
            actual_value = result.get(key)
            if actual_value != expected_value:
                passed = False
                details.append(f"Expected {key}={expected_value}, got {actual_value}")
                
        return {
            "passed": passed,
            "score": 1.0 if passed else 0.0,
            "details": ", ".join(details) if details else "All criteria met."
        }

class EvaluatorRegistry:
    def __init__(self):
        self.metrics = {
            "rule_based": ExactMatchMetric()
        }
        
    def get_evaluator(self, name: str) -> BaseMetric:
        return self.metrics.get(name)
