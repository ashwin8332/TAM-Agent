"""
Data Loader — Loads and caches the provided mock datasets.
ONLY data/tickets.json and data/accounts.json are used — no external sources.
"""
from __future__ import annotations

import json
import os
import sqlite3
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
            cls._instance._init_sqlite()
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

    def _init_sqlite(self):
        """Initialize an in-memory SQLite DB with tickets for SQL-like querying."""
        self.conn = sqlite3.connect(":memory:", check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        cursor = self.conn.cursor()
        
        # Create tickets table
        cursor.execute("""
            CREATE TABLE tickets (
                ticket_id TEXT PRIMARY KEY,
                account_id TEXT,
                subject TEXT,
                body TEXT,
                product TEXT,
                product_area TEXT,
                category TEXT,
                urgency TEXT,
                status TEXT,
                plan_tier TEXT,
                channel TEXT,
                created_at TEXT
            )
        """)
        
        # Insert tickets
        for t in self.tickets:
            cursor.execute("""
                INSERT INTO tickets (ticket_id, account_id, subject, body, product, product_area, category, urgency, status, plan_tier, channel, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                t.get("ticket_id"), t.get("account_id"), t.get("subject"), t.get("body"), 
                t.get("product"), t.get("product_area"), t.get("category"), t.get("urgency"), 
                t.get("status"), t.get("plan_tier"), t.get("channel"), t.get("created_at")
            ))
        
        # Note: We can also add tags as a separate table if needed, but for 90-day ticket fetch, the main table is enough.
        # We parse tags back from original self.tickets or store them as JSON string if we need them.
        
        self.conn.commit()
        logger.info("Initialized SQLite in-memory DB for tickets")

    # ── Query helpers ─────────────────────────────────────────────────

    def get_ticket_by_id(self, ticket_id: str) -> Optional[Dict]:
        return next((t for t in self.tickets if t["ticket_id"] == ticket_id), None)

    def get_account(self, account_id: str) -> Optional[Dict]:
        """Returns account data or None — missing accounts are expected per DATA_SCHEMA.md."""
        return self.accounts.get(account_id)

    def get_tickets_for_account(self, account_id: str, days: int = 90) -> List[Dict]:
        """Fetches tickets for an account within the last N days using SQLite."""
        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT ticket_id 
            FROM tickets 
            WHERE account_id = ? AND created_at > ?
        """, (account_id, cutoff_date))
        
        ticket_ids = [row["ticket_id"] for row in cursor.fetchall()]
        
        # Map back to full dictionaries to preserve tags/nested arrays if any
        return [t for t in self.tickets if t["ticket_id"] in ticket_ids]

    def get_recent_tickets(self, days: int = 90) -> List[Dict]:
        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT ticket_id 
            FROM tickets 
            WHERE created_at > ?
        """, (cutoff_date,))
        ticket_ids = [row["ticket_id"] for row in cursor.fetchall()]
        return [t for t in self.tickets if t["ticket_id"] in ticket_ids]

