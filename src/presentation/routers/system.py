"""
System Router — FastAPI routes to fetch live PC system metrics and service status.
"""
from __future__ import annotations

import os
import platform
import shutil
import sys
from typing import Dict, Any

import httpx
import psutil
from fastapi import APIRouter

import src.config as config

router = APIRouter(prefix="/api/v1/system", tags=["system"])


@router.get("/metrics", response_model=Dict[str, Any])
async def get_system_metrics():
    """Retrieve actual host system metrics (CPU, RAM, Disk), process info, and service statuses (Ollama, FAISS)."""
    # 1. OS & Platform Details
    os_info = {
        "system": platform.system(),
        "release": platform.release(),
        "machine": platform.machine(),
        "processor": platform.processor(),
        "python_version": sys.version.split(" ")[0],
    }

    # 2. CPU Usage
    cpu_percent = psutil.cpu_percent(interval=None)
    cpu_logical = psutil.cpu_count(logical=True)
    cpu_physical = psutil.cpu_count(logical=False)
    cpu_info = {
        "usage_percent": cpu_percent,
        "logical_cores": cpu_logical,
        "physical_cores": cpu_physical,
    }

    # 3. Memory Usage (RAM)
    mem = psutil.virtual_memory()
    memory_info = {
        "total_gb": round(mem.total / (1024 ** 3), 2),
        "available_gb": round(mem.available / (1024 ** 3), 2),
        "used_gb": round(mem.used / (1024 ** 3), 2),
        "usage_percent": mem.percent,
    }

    # 4. Disk Usage
    disk = shutil.disk_usage("/")
    disk_info = {
        "total_gb": round(disk.total / (1024 ** 3), 2),
        "used_gb": round(disk.used / (1024 ** 3), 2),
        "free_gb": round(disk.free / (1024 ** 3), 2),
        "usage_percent": round((disk.used / disk.total) * 100, 2),
    }

    # 5. Ollama Status
    ollama_running = False
    pulled_models = []
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{config.OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                ollama_running = True
                data = response.json()
                pulled_models = [m["name"] for m in data.get("models", [])]
    except Exception:
        pass

    # 6. FAISS Index Stats
    faiss_ready = False
    vector_count = 0
    try:
        from src.infrastructure.vector_store import VectorStore
        vs = VectorStore.get_instance()
        if vs.store is not None:
            faiss_ready = True
            vector_count = len(vs.store.docstore._dict)
    except Exception:
        pass

    # 7. Current Process Info
    proc_info = {
        "pid": os.getpid(),
    }
    try:
        current_proc = psutil.Process(os.getpid())
        proc_info["threads_count"] = current_proc.num_threads()
        proc_info["memory_rss_mb"] = round(current_proc.memory_info().rss / (1024 ** 2), 2)
    except Exception:
        pass

    return {
        "os": os_info,
        "cpu": cpu_info,
        "memory": memory_info,
        "disk": disk_info,
        "ollama": {
            "running": ollama_running,
            "url": config.OLLAMA_BASE_URL,
            "current_model": config.MODEL,
            "embedding_model": config.EMBEDDING_MODEL,
            "pulled_models": pulled_models,
        },
        "faiss": {
            "ready": faiss_ready,
            "vector_count": vector_count,
            "index_path": config.FAISS_INDEX_PATH,
        },
        "process": proc_info
    }
