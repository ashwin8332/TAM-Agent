"""
Central configuration module.
Loads all settings from environment variables with sensible defaults.
Import this module instead of using os.getenv() directly anywhere else.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── LLM ────────────────────────────────────────────────────
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL: str = os.getenv("MODEL", "qwen2.5")
EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")
MODEL_TEMPERATURE: float = float(os.getenv("MODEL_TEMPERATURE", "0"))
MODEL_SEED: int = int(os.getenv("MODEL_SEED", "42"))

# ── Application ─────────────────────────────────────────────
APP_ENV: str = os.getenv("APP_ENV", "development")
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
API_PORT: int = int(os.getenv("API_PORT", "8000"))
API_HOST: str = os.getenv("API_HOST", "0.0.0.0")

# ── Paths ───────────────────────────────────────────────────
DATA_DIR: str = os.getenv("DATA_DIR", "./data")
KB_DIR: str = os.getenv("KB_DIR", "./knowledge-base")
FAISS_INDEX_PATH: str = os.getenv("FAISS_INDEX_PATH", "./vector_store/faiss_index")
PROMPTS_DIR: str = os.getenv("PROMPTS_DIR", "./prompts")

# ── RAG ─────────────────────────────────────────────────────
TOP_K: int = int(os.getenv("TOP_K", "5"))
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "512"))
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "64"))
MAX_CONTEXT_LENGTH: int = int(os.getenv("MAX_CONTEXT_LENGTH", "3000"))

# ── Control ──────────────────────────────────────────────────
MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
REQUEST_TIMEOUT: int = int(os.getenv("REQUEST_TIMEOUT", "120"))
