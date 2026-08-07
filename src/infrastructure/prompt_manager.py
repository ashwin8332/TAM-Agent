"""
Prompt Manager — Loads versioned prompt templates from the prompts/ directory.
Prompts are NEVER embedded in Python source files — this rule is enforced here.
Supports {{variable}} interpolation and YAML frontmatter metadata.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, Optional

import yaml

import src.config as config
from src.observability.logger import get_logger

logger = get_logger(__name__)

_FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n?", re.DOTALL)


class PromptManager:
    """Singleton manager for loading and rendering versioned prompt templates."""

    _instance: Optional[PromptManager] = None
    _body_cache: Dict[str, str] = {}
    _meta_cache: Dict[str, Dict] = {}

    @classmethod
    def get_instance(cls) -> "PromptManager":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load(self, prompt_name: str) -> str:
        """Load the prompt body (without YAML frontmatter) by name."""
        if prompt_name not in self._body_cache:
            self._body_cache[prompt_name] = self._read_body(prompt_name)
        return self._body_cache[prompt_name]

    def get_metadata(self, prompt_name: str) -> Dict:
        """Return parsed YAML frontmatter for a prompt."""
        if prompt_name not in self._meta_cache:
            self._meta_cache[prompt_name] = self._read_metadata(prompt_name)
        return self._meta_cache[prompt_name]

    def get_version(self, prompt_name: str) -> str:
        return str(self.get_metadata(prompt_name).get("version", "unknown"))

    def render(self, prompt_name: str, **kwargs: str) -> str:
        """Load template and substitute {{variable}} placeholders."""
        template = self.load(prompt_name)
        for key, value in kwargs.items():
            template = template.replace(f"{{{{{key}}}}}", str(value))
        return template

    # ------------------------------------------------------------------
    def _path(self, prompt_name: str) -> Path:
        p = Path(config.PROMPTS_DIR) / f"{prompt_name}.md"
        if not p.exists():
            raise FileNotFoundError(
                f"Prompt '{prompt_name}' not found at {p}. "
                "Check PROMPTS_DIR in .env and ensure the file exists."
            )
        return p

    def _read_body(self, prompt_name: str) -> str:
        content = self._path(prompt_name).read_text(encoding="utf-8")
        match = _FRONTMATTER_RE.match(content)
        return content[match.end():].strip() if match else content.strip()

    def _read_metadata(self, prompt_name: str) -> Dict:
        content = self._path(prompt_name).read_text(encoding="utf-8")
        match = _FRONTMATTER_RE.match(content)
        return yaml.safe_load(match.group(1)) if match else {}
