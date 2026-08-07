"""
Build FAISS Index — standalone script.
Run this ONCE before starting the API server for the first time.
Subsequent server starts will load from disk automatically.

Usage:
    cd c:\\Users\\hp\\OneDrive\\Desktop\\TAM
    python scripts/build_index.py

Prerequisites:
    1. pip install -r requirements.txt
    2. ollama pull nomic-embed-text   (or your EMBEDDING_MODEL)
    3. cp .env.example .env           (and set values)
"""
import sys
import os
import time

# Ensure project root is on the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

import src.config as config


def main() -> None:
    print("=" * 60)
    print("TAM AI Platform — FAISS Index Builder")
    print("=" * 60)
    print(f"  KB directory   : {os.path.abspath(config.KB_DIR)}")
    print(f"  Index path     : {os.path.abspath(config.FAISS_INDEX_PATH)}")
    print(f"  Embedding model: {config.EMBEDDING_MODEL}")
    print(f"  Ollama URL     : {config.OLLAMA_BASE_URL}")
    print(f"  Chunk size     : {config.CHUNK_SIZE} chars (overlap {config.CHUNK_OVERLAP})")
    print()

    # Validate KB exists
    if not os.path.isdir(config.KB_DIR):
        print(f"ERROR: Knowledge base directory not found: {config.KB_DIR}")
        print("       Check KB_DIR in .env and ensure you are running from the project root.")
        sys.exit(1)

    print("Building FAISS index...")
    print("  (Ollama must be running and the embedding model must be pulled)")
    print()

    start = time.time()
    try:
        from src.infrastructure.vector_store import VectorStore
        vs = VectorStore.get_instance()
        vs.rebuild_index()
        elapsed = round(time.time() - start, 1)
        print(f"\nDone in {elapsed}s — index saved to: {os.path.abspath(config.FAISS_INDEX_PATH)}")
        print()
        print("You can now start the API server:")
        print("  uvicorn src.presentation.main:app --reload --host 0.0.0.0 --port 8000")
        print()
        print("Or test with:")
        print('  curl -X POST http://localhost:8000/api/v1/triage/text \\')
        print('       -H "Content-Type: application/json" \\')
        print('       -d \'{"text": "DataBridge pipeline stopped. ERR_CONNECTION_TIMEOUT. 47 users affected."}\'')
    except Exception as exc:
        print(f"\nERROR: {exc}")
        print("\nCommon causes:")
        print("  - Ollama is not running: start with 'ollama serve'")
        print(f"  - Embedding model not pulled: 'ollama pull {config.EMBEDDING_MODEL}'")
        print("  - KB_DIR does not exist: check .env")
        sys.exit(1)


if __name__ == "__main__":
    main()
