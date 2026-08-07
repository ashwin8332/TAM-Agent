"""
Embedding Service — Singleton wrapper around the Ollama embedding model.
Used exclusively by VectorStore. No other module should call embed directly.
"""
from __future__ import annotations

from typing import List, Optional

from langchain_ollama import OllamaEmbeddings

import src.config as config
from src.observability.logger import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    """Singleton embedding model backed by Ollama."""

    _instance: Optional[EmbeddingService] = None
    _embeddings: Optional[OllamaEmbeddings] = None

    def __init__(self) -> None:
        self._embeddings = OllamaEmbeddings(
            base_url=config.OLLAMA_BASE_URL,
            model=config.EMBEDDING_MODEL,
        )
        logger.info("EmbeddingService initialised", extra={"model": config.EMBEDDING_MODEL})

    @classmethod
    def get_instance(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @property
    def embeddings(self) -> OllamaEmbeddings:
        """Returns the raw LangChain embeddings object (consumed by FAISS)."""
        assert self._embeddings is not None
        return self._embeddings

    def embed_query(self, text: str) -> List[float]:
        return self._embeddings.embed_query(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self._embeddings.embed_documents(texts)
