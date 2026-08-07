import json
import os
from typing import List, Dict, Any

class DatasetLoader:
    @staticmethod
    def load_test_cases(file_path: str) -> List[Dict[str, Any]]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Test case file not found: {file_path}")
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
