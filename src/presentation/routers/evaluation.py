from fastapi import APIRouter, HTTPException
import json
import os
from typing import Any, Dict

router = APIRouter(prefix="/api/v1/evaluation", tags=["evaluation"])

@router.get("/report", response_model=Dict[str, Any])
async def get_evaluation_report():
    report_path = "eval_report.json"
    if not os.path.exists(report_path):
        # Return a mock pending status if not ready yet
        return {
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "success_rate": 0
            },
            "tasks": {},
            "status": "Running or not yet started"
        }
    
    with open(report_path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            data["status"] = "Completed"
            return data
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to parse evaluation report.")
