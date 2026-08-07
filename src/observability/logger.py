"""
Structured logging — emits JSON-formatted logs with context fields.
Masks PII to prevent sensitive data from appearing in logs.
"""
from __future__ import annotations

import json
import logging
import re
import sys
from typing import Any, Dict

_EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
_PHONE_RE = re.compile(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b")


def _mask_pii(text: str) -> str:
    text = _EMAIL_RE.sub("[EMAIL_REDACTED]", text)
    text = _PHONE_RE.sub("[PHONE_REDACTED]", text)
    return text


class _StructuredFormatter(logging.Formatter):
    _SKIP_KEYS = frozenset({
        "name", "msg", "args", "levelname", "levelno", "pathname",
        "filename", "module", "exc_info", "exc_text", "stack_info",
        "lineno", "funcName", "created", "msecs", "relativeCreated",
        "thread", "threadName", "processName", "process", "message",
        "taskName",
    })

    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "level": record.levelname,
            "logger": record.name,
            "message": _mask_pii(record.getMessage()),
        }
        extras = {k: v for k, v in record.__dict__.items() if k not in self._SKIP_KEYS}
        if extras:
            log_data.update(extras)
        if record.exc_info:
            log_data["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(log_data, default=str)


def get_logger(name: str) -> logging.Logger:
    """Return a structured JSON logger for the given module name."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(_StructuredFormatter())
        logger.addHandler(handler)
        # Import here to avoid circular import at module load time
        try:
            from src.config import LOG_LEVEL
            level = getattr(logging, LOG_LEVEL.upper(), logging.INFO)
        except Exception:
            level = logging.INFO
        logger.setLevel(level)
        logger.propagate = False
    return logger
