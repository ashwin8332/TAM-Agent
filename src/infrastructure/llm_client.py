"""
LLM Client — the ONLY module that directly interfaces with Ollama.

All other modules must use this client to call the LLM.
No other file should ever import from langchain_ollama directly.
Supports synchronous generation and streaming.
"""
from __future__ import annotations

import time
from typing import Generator, Optional

from langchain_ollama import OllamaLLM

import src.config as config
from src.observability.logger import get_logger

logger = get_logger(__name__)


class LLMClient:
    """Singleton LLM client wrapping Ollama. Thread-safe for read operations."""

    _instance: Optional[LLMClient] = None

    def __init__(self) -> None:
        self._model_name = config.MODEL
        self._llm = OllamaLLM(
            base_url=config.OLLAMA_BASE_URL,
            model=config.MODEL,
            temperature=config.MODEL_TEMPERATURE,
            seed=config.MODEL_SEED,
            num_predict=2048,
        )
        logger.info(
            "LLMClient initialised",
            extra={"model": config.MODEL, "base_url": config.OLLAMA_BASE_URL,
                   "temperature": config.MODEL_TEMPERATURE, "seed": config.MODEL_SEED},
        )

    @classmethod
    def get_instance(cls) -> "LLMClient":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def generate(self, prompt: str) -> str:
        """Synchronous generation. Returns the complete response string."""
        start = time.time()
        try:
            response: str = self._llm.invoke(prompt)
            latency_ms = (time.time() - start) * 1000
            logger.debug(
                "LLM generation complete",
                extra={"latency_ms": round(latency_ms, 2), "response_len": len(response)},
            )
            return response
        except Exception as exc:
            logger.error("LLM generation failed", extra={"error": str(exc)})
            raise

    def stream(self, prompt: str) -> Generator[str, None, None]:
        """Streaming generation. Yields string tokens as they arrive."""
        try:
            for token in self._llm.stream(prompt):
                yield token
        except Exception as exc:
            logger.error("LLM streaming failed", extra={"error": str(exc)})
            raise

    @property
    def model_name(self) -> str:
        return self._model_name
