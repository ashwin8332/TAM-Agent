from typing import Dict, Any
from evaluation.framework.base_metric import BaseMetric

class ExactMatchMetric(BaseMetric):
    """
    Rule-based evaluator. Every criterion in expected_criteria is checked
    independently; `passed` requires ALL criteria to hold (pass/fail gate),
    while `score` is the fraction of individual criteria satisfied (0-1
    quality score), so a near-miss (e.g. 2 of 3 criteria correct) is
    distinguishable from a total failure instead of both scoring 0.0.
    """

    def evaluate(self, result: Dict[str, Any], expected_criteria: Dict[str, Any]) -> Dict[str, Any]:
        details = []
        criteria_met = 0
        criteria_total = 0

        def check(ok: bool, message: str) -> None:
            nonlocal criteria_met, criteria_total
            criteria_total += 1
            if ok:
                criteria_met += 1
            else:
                details.append(message)

        for key, expected_value in expected_criteria.items():
            if key == "kb_doc_id_contains":
                kb_match = result.get("kb_match") or {}
                ok = bool(kb_match) and expected_value in kb_match.get("doc_id", "")
                check(ok, f"Expected kb_match.doc_id to contain {expected_value}")
                continue

            if key == "confidence_lt":
                conf = result.get("confidence", 1.0)
                check(conf < expected_value, f"Expected confidence < {expected_value}, got {conf}")
                continue

            if key == "churn_flags_empty":
                flags = result.get("churn_risk_flags", [])
                check(bool(flags) == (not expected_value), f"Expected churn_flags_empty={expected_value}, but got {flags}")
                continue

            if key == "risks_and_issues_non_empty":
                risks = result.get("risks_and_issues", "")
                is_empty = not risks or risks == "N/A"
                check(is_empty != expected_value, "Expected risks_and_issues to be non-empty")
                continue

            if key == "has_churn_flag_containing":
                flags = result.get("churn_risk_flags", [])
                found = any(expected_value in f for f in flags)
                check(found, f"Expected churn flag containing '{expected_value}', got {flags}")
                continue

            if key == "identical_outputs":
                # Special handling in run_eval.py for determinism
                continue

            if key == "executive_summary_contains":
                summary = result.get("executive_summary", "")
                check(expected_value in summary, f"Expected executive_summary to contain '{expected_value}'")
                continue

            # Default exact match
            actual_value = result.get(key)
            check(actual_value == expected_value, f"Expected {key}={expected_value}, got {actual_value}")

        score = (criteria_met / criteria_total) if criteria_total else 1.0
        passed = criteria_met == criteria_total

        return {
            "passed": passed,
            "score": round(score, 4),
            "details": ", ".join(details) if details else "All criteria met."
        }

class EvaluatorRegistry:
    def __init__(self):
        self.metrics = {
            "rule_based": ExactMatchMetric()
        }
        
    def get_evaluator(self, name: str) -> BaseMetric:
        return self.metrics.get(name)
