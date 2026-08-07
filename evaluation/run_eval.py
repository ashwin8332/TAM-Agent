import asyncio
import os
import sys

# Ensure project root is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from evaluation.framework.dataset_loader import DatasetLoader
from evaluation.framework.evaluator_registry import EvaluatorRegistry
from evaluation.framework.result_reporter import ResultReporter
from src.application.triage_usecase import TriageUseCase
from src.application.account_brief_usecase import AccountBriefUseCase

async def run_task1(cases, evaluator):
    triage_uc = TriageUseCase()
    results = []
    
    for case in cases:
        print(f"Running {case['test_id']}...")
        inp = case["input"]
        
        # Execute UseCase
        try:
            import json
            result = triage_uc.execute(
                raw_input=json.dumps(inp)
            )
            result_dict = result.model_dump()
            
            # Evaluate
            eval_res = evaluator.evaluate(result_dict, case["expected_criteria"])
        except Exception as e:
            eval_res = {
                "passed": False,
                "score": 0.0,
                "details": f"Exception during execution: {str(e)}"
            }
            result_dict = {"processing_time_ms": 0}
            
        results.append({
            "test_id": case["test_id"],
            "type": case["type"],
            "description": case["description"],
            "passed": eval_res["passed"],
            "score": eval_res["score"],
            "details": eval_res["details"],
            "processing_time_ms": result_dict.get("processing_time_ms", 0)
        })
        
    return results

async def run_task2(cases, evaluator):
    account_uc = AccountBriefUseCase()
    results = []
    
    for case in cases:
        print(f"Running {case['test_id']}...")
        inp = case["input"]
        acc_id = inp.get("account_id")
        
        if inp.get("run_twice"):
            # Special determinism test
            res1 = await account_uc.execute(account_id=acc_id)
            res2 = await account_uc.execute(account_id=acc_id)
            
            passed = (res1.executive_summary == res2.executive_summary) and \
                     (res1.risks_and_issues == res2.risks_and_issues)
            
            eval_res = {
                "passed": passed,
                "score": 1.0 if passed else 0.0,
                "details": "Outputs are identical" if passed else "Outputs diverge"
            }
            result_dict = res1.model_dump()
        else:
            try:
                result = await account_uc.execute(account_id=acc_id)
                result_dict = result.model_dump()
                eval_res = evaluator.evaluate(result_dict, case["expected_criteria"])
            except Exception as e:
                eval_res = {
                    "passed": False,
                    "score": 0.0,
                    "details": f"Exception during execution: {str(e)}"
                }
                result_dict = {"processing_time_ms": 0}
                
        results.append({
            "test_id": case["test_id"],
            "type": case["type"],
            "description": case["description"],
            "passed": eval_res["passed"],
            "score": eval_res["score"],
            "details": eval_res["details"],
            "processing_time_ms": result_dict.get("processing_time_ms", 0)
        })
        
    return results

async def main():
    loader = DatasetLoader()
    registry = EvaluatorRegistry()
    rule_evaluator = registry.get_evaluator("rule_based")
    
    t1_cases = loader.load_test_cases("evaluation/test_cases/task1_cases.json")
    t2_cases = loader.load_test_cases("evaluation/test_cases/task2_cases.json")
    
    print("Starting Task 1 Evaluation...")
    t1_results = await run_task1(t1_cases, rule_evaluator)
    
    print("Starting Task 2 Evaluation...")
    t2_results = await run_task2(t2_cases, rule_evaluator)
    
    all_results = t1_results + t2_results
    total = len(all_results)
    passed = sum(1 for r in all_results if r["passed"])
    failed = total - passed
    
    final_report = {
        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
            "success_rate": passed / total if total > 0 else 0
        },
        "tasks": {
            "Task 1 (Triage)": t1_results,
            "Task 2 (Account Brief)": t2_results
        }
    }
    
    ResultReporter.generate_json_report(final_report, "eval_report.json")
    ResultReporter.generate_markdown_report(final_report, "eval_report.md")
    
    print("Evaluation complete. Results written to eval_report.json and eval_report.md")

if __name__ == "__main__":
    asyncio.run(main())
