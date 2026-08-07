"""
Vector Store — Persistent FAISS index over the knowledge base markdown files.
Lazy-loaded singleton: the index is built once and persisted to disk.
Subsequent runs load from disk without re-embedding (fast startup).
"""
from __future__ import annotations

import glob
import os
from pathlib import Path
from typing import List, Optional, Tuple

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

import src.config as config
from src.infrastructure.embedding_service import EmbeddingService
from src.observability.logger import get_logger

logger = get_logger(__name__)


class VectorStore:
    """FAISS-backed vector store over the knowledge base. Singleton."""

    _instance: Optional[VectorStore] = None
    _store: Optional[FAISS] = None

    def __init__(self) -> None:
        self._embedding_service = EmbeddingService.get_instance()

    @classmethod
    def get_instance(cls) -> "VectorStore":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ── Public API ────────────────────────────────────────────────────

    @property
    def store(self) -> FAISS:
        """Lazy-load: build or load FAISS on first access."""
        if self._store is None:
            self._store = self._load_or_build()
        return self._store

    def similarity_search_with_score(
        self, query: str, k: int = 5
    ) -> List[Tuple[Document, float]]:
        return self.store.similarity_search_with_score(query, k=k)

    def rebuild_index(self) -> None:
        """Force full rebuild from KB files."""
        logger.info("Rebuilding FAISS index from scratch...")
        self._store = self._build_index()
        logger.info("FAISS index rebuilt successfully")

    # ── Internal ──────────────────────────────────────────────────────

    def _load_or_build(self) -> FAISS:
        index_path = Path(config.FAISS_INDEX_PATH)
        if index_path.exists() and any(index_path.iterdir()):
            logger.info("Loading FAISS index from disk", extra={"path": str(index_path)})
            try:
                return FAISS.load_local(
                    str(index_path),
                    self._embedding_service.embeddings,
                    allow_dangerous_deserialization=True,
                )
            except Exception as exc:
                logger.warning(
                    "Failed to load existing FAISS index — rebuilding",
                    extra={"error": str(exc)},
                )
        return self._build_index()

    def _build_index(self) -> FAISS:
        logger.info("Building FAISS index from knowledge base...")
        documents = self._load_kb_documents()
        if not documents:
            raise RuntimeError(
                f"No documents found in KB directory: {config.KB_DIR}. "
                "Check KB_DIR in .env."
            )
        logger.info(f"Ingested {len(documents)} chunks from KB")

        store = FAISS.from_documents(documents, self._embedding_service.embeddings)

        index_path = Path(config.FAISS_INDEX_PATH)
        index_path.mkdir(parents=True, exist_ok=True)
        store.save_local(str(index_path))
        logger.info("FAISS index persisted", extra={"path": str(index_path)})
        return store

    def _load_kb_documents(self) -> List[Document]:
        """
        Load all KB markdown files, split on --- section boundaries first,
        then recursively chunk oversized sections.
        Metadata is preserved per chunk for source attribution.
        """
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.CHUNK_SIZE,
            chunk_overlap=config.CHUNK_OVERLAP,
            separators=["\n\n---\n\n", "\n---\n", "\n\n", "\n", " "],
        )

        pattern = os.path.join(config.KB_DIR, "**", "*.md")
        md_files = sorted(glob.glob(pattern, recursive=True))
        logger.info(f"Found {len(md_files)} KB markdown files")

        documents: List[Document] = []
        for filepath in md_files:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            rel = os.path.relpath(filepath, config.KB_DIR).replace("\\", "/")
            doc_id = rel.removesuffix(".md")
            parts = rel.split("/")
            category = parts[0] if len(parts) > 1 else "general"
            title = self._extract_title(content)

            # Split on section boundaries, then chunk each section
            sections = content.split("\n---\n")
            for sec_idx, section in enumerate(sections):
                section = section.strip()
                if len(section) < 30:
                    continue
                base = Document(
                    page_content=section,
                    metadata={
                        "doc_id": doc_id,
                        "source": filepath,
                        "category": category,
                        "title": title,
                        "section_index": sec_idx,
                    },
                )
                documents.extend(splitter.split_documents([base]))

        return documents

    @staticmethod
    def _extract_title(content: str) -> str:
        for line in content.splitlines():
            if line.startswith("# "):
                return line[2:].strip()
        return "Untitled"
