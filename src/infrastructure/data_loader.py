"""
Data Loader — Loads and caches the provided mock datasets.
ONLY data/tickets.json and data/accounts.json are used — no external sources.
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone
from functools import cached_property
from typing import Dict, List, Optional

import src.config as config
from src.observability.logger import get_logger

logger = get_logger(__name__)


class DataLoader:
    """Singleton loader for the mock ticket and account datasets."""

    _instance: Optional[DataLoader] = None

    @classmethod
    def get_instance(cls) -> "DataLoader":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @cached_property
    def tickets(self) -> List[Dict]:
        path = os.path.join(config.DATA_DIR, "tickets.json")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        logger.info("Loaded tickets dataset", extra={"count": len(data)})
        return data

    @cached_property
    def accounts(self) -> Dict[str, Dict]:
        path = os.path.join(config.DATA_DIR, "accounts.json")
        with open(path, "r", encoding="utf-8") as f:
            accounts_list = json.load(f)
        account_map = {a["account_id"]: a for a in accounts_list}
        logger.info("Loaded accounts dataset", extra={"count": len(account_map)})
        return account_map

    # ── Query helpers ─────────────────────────────────────────────────

    def get_ticket_by_id(self, ticket_id: str) -> Optional[Dict]:
        return next((t for t in self.tickets if t["ticket_id"] == ticket_id), None)

    def get_account(self, account_id: str) -> Optional[Dict]:
        """Returns account data or None — missing accounts are expected per DATA_SCHEMA.md."""
        return self.accounts.get(account_id)

    def get_tickets_for_account(self, account_id: str, days: int = 90) -> List[Dict]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        return [
            t for t in self.tickets
            if t["account_id"] == account_id
            and datetime.fromisoformat(t["created_at"].replace("Z", "+00:00")) > cutoff
        ]

    def get_recent_tickets(self, days: int = 90) -> List[Dict]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        return [
            t for t in self.tickets
            if datetime.fromisoformat(t["created_at"].replace("Z", "+00:00")) > cutoff
        ]
