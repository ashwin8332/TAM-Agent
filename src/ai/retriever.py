"""
Retriever — FAISS-backed semantic search over the knowledge base.
Returns top-K chunks with normalised similarity scores and source metadata.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from src.infrastructure.vector_store import VectorStore
import src.config as config
from src.observability.logger import get_logger

logger = get_logger(__name__)

_store_instance: Optional[VectorStore] = None


def _get_store() -> VectorStore:
    global _store_instance
    if _store_instance is None:
        _store_instance = VectorStore.get_instance()
    return _store_instance


class Retriever:
    """Semantic retriever backed by FAISS. Reusable across all tasks."""

    def retrieve(self, query: str, k: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Retrieve the top-k most relevant KB chunks for a query.

        Returns list of dicts:
            {content, doc_id, title, category, score, source}
        where score is normalised similarity (0–1, higher = more relevant).
        """
        k = k or config.TOP_K
        if not query.strip():
            return []

        try:
            raw_results = _get_store().similarity_search_with_score(query, k=k)
        except Exception as exc:
            logger.error("Retrieval error", extra={"error": str(exc)})
            return []

        docs = []
        for doc, l2_distance in raw_results:
            # Convert L2 distance to a 0–1 similarity score
            similarity = round(1.0 / (1.0 + float(l2_distance)), 4)
            docs.append({
                "content": doc.page_content,
                "doc_id": doc.metadata.get("doc_id", "unknown"),
                "title": doc.metadata.get("title", "Untitled"),
                "category": doc.metadata.get("category", "general"),
                "score": similarity,
                "source": doc.metadata.get("source", ""),
            })

        logger.debug(
            "Retrieval complete",
            extra={
                "k": k,
                "results": len(docs),
                "top_score": docs[0]["score"] if docs else 0,
            },
        )
        return docs

    def get_best_match(self, query: str) -> Optional[Dict[str, Any]]:
        results = self.retrieve(query, k=1)
        return results[0] if results else None
