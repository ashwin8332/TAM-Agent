import json
import os
from typing import Dict, Any

class ResultReporter:
    @staticmethod
    def generate_json_report(results: Dict[str, Any], output_path: str):
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
            
    @staticmethod
    def generate_markdown_report(results: Dict[str, Any], output_path: str):
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("# Evaluation Report\n\n")
            
            summary = results.get("summary", {})
            f.write(f"**Total Tests**: {summary.get('total')}\n")
            f.write(f"**Passed**: {summary.get('passed')}\n")
            f.write(f"**Failed**: {summary.get('failed')}\n")
            f.write(f"**Success Rate**: {summary.get('success_rate', 0.0) * 100:.1f}%\n")
            f.write(f"**Average Quality Score**: {summary.get('average_quality_score', 0.0):.3f} / 1.0\n\n")
            
            f.write("## Test Details\n\n")
            for task, task_results in results.get("tasks", {}).items():
                f.write(f"### {task}\n\n")
                f.write("| Test ID | Type | Description | Result | Score | Time (ms) | Details |\n")
                f.write("|---------|------|-------------|--------|-------|-----------|---------|\n")
                for r in task_results:
                    status = "✅ Pass" if r.get("passed") else "❌ Fail"
                    f.write(f"| {r['test_id']} | {r['type']} | {r['description']} | {status} | {r['score']} | {r.get('processing_time_ms', 0):.1f} | {r.get('details', '')} |\n")
                f.write("\n")
