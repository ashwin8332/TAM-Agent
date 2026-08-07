# TAM AI Platform

> **US Delivery Internship — Technical Task Round**
> Production-grade AI for Technical Support & TAM Teams

[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-orange)](https://langchain-ai.github.io/langgraph)
[![Ollama](https://img.shields.io/badge/LLM-Ollama-purple)](https://ollama.ai)

---

## Overview

This platform delivers two AI-powered features:

| Task | Feature | Marks |
|------|---------|-------|
| Task 1 | Intelligent Ticket Triage Agent | 30 |
| Task 2 | TAM Account Health Summariser | 25 |
| Task 3 | Evaluation Harness | 20 |
| Task 4 | Design Note | 15 |
| Bonus | Streaming + UI + CI + Prompt Versioning | 10 |

**Architecture:** LangGraph orchestration · Ollama (local LLM) · FAISS vector store · FastAPI · Domain-Driven Design

---

## Quick Setup

### Prerequisites

```bash
# 1. Install Ollama
# https://ollama.ai/download

# 2. Pull required models
ollama pull qwen2.5
ollama pull nomic-embed-text

# 3. Start Ollama
ollama serve
```

### Installation

```bash
# From the project root (TAM/ directory)
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env if you want to change the model or paths

# Build the FAISS knowledge base index (run once)
python scripts/build_index.py
```

### Start the API Server

```bash
uvicorn src.presentation.main:app --reload --host 0.0.0.0 --port 8000
```

Open **http://localhost:8000/docs** for the interactive API documentation.

---

## Sample Run — Task 1 (Ticket Triage)

### Structured JSON input

```bash
curl -X POST http://localhost:8000/api/v1/triage \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "DataBridge pipeline stopped — ERR_CONNECTION_TIMEOUT",
    "body": "Hi team,\n\nOur DataBridge Pro Connectors pipeline has been failing since this morning. Error: ERR_CONNECTION_TIMEOUT after 30s. This is impacting 47 users in Engineering. We have tried restarting but the issue persists.\n\nEnvironment: Production\nVersion: 3.1.2",
    "account_id": "ACC-3847",
    "plan_tier": "Enterprise"
  }'
```

### Plain text input

```bash
curl -X POST http://localhost:8000/api/v1/triage/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Our SSO login is broken. Users are getting SAML_ASSERTION_EXPIRED errors. Nobody can log in to SecureVault. This is blocking our entire team."}'
```

### Expected output shape

```json
{
  "ticket_id": "AUTO-550E8400",
  "product": "DataBridge Pro",
  "product_area": "Connectors",
  "issue_category": "Bug",
  "urgency_tier": "P2",
  "urgency_reasoning": "Production pipeline failing with ERR_CONNECTION_TIMEOUT. 47 Engineering users impacted. No workaround available for pipeline processing.",
  "recommended_team": "Senior Engineering Support",
  "kb_match": {
    "doc_id": "products/databridge-pro",
    "doc_title": "DataBridge Pro — Product Reference",
    "relevant_section": "Pipeline stopped processing",
    "relevance_score": 0.92
  },
  "draft_first_response": "Hi,\n\nThank you for contacting support...",
  "classification_reasoning": "ERR_CONNECTION_TIMEOUT in DataBridge Pro Connectors is a known network/source issue. Production impact with 47 users = P2.",
  "confidence": 0.87,
  "retrieved_docs": ["products/databridge-pro", "troubleshooting/performance-and-integrations"],
  "processing_time_ms": 3241.5,
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "prompt_version": "1.0.0"
}
```

### Streaming (SSE)

```bash
curl -X POST http://localhost:8000/api/v1/triage/stream \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"subject": "Billing question", "body": "Why am I being charged for 50 seats when only 30 users are active?"}'
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Service info |
| `GET` | `/health` | Health check + index status |
| `GET` | `/docs` | Interactive Swagger UI |
| `POST` | `/api/v1/triage` | Structured JSON triage |
| `POST` | `/api/v1/triage/text` | Plain text triage |
| `POST` | `/api/v1/triage/stream` | Streaming SSE triage |
| `POST` | `/api/v1/index/rebuild` | Rebuild FAISS index |

---

## Architecture

```
TAM/
├── src/
│   ├── infrastructure/      # Ollama, FAISS, data loaders (replaceable)
│   ├── domain/              # Pure entities — no infra dependencies
│   ├── application/         # Use cases — all business logic lives here
│   ├── ai/
│   │   ├── graphs/          # LangGraph state machines
│   │   ├── nodes/           # 9 independently testable pipeline nodes
│   │   ├── retriever.py     # FAISS retrieval
│   │   └── output_validator.py  # JSON validation + json-repair
│   ├── presentation/        # FastAPI routes (thin controllers only)
│   └── observability/       # Structured JSON logging + tracing
├── prompts/                 # Versioned prompt templates (.md files)
├── data/                    # PROVIDED — tickets.json + accounts.json
├── knowledge-base/          # PROVIDED — 9 KB markdown files
└── scripts/                 # build_index.py
```

### LangGraph Pipeline (Task 1)

```
input_validation → retrieval → context_compression → prompt_construction
  → llm_generation → output_validation
    ├── [valid] → confidence_calculation → logging_node → END
    ├── [retry < MAX] → retry_node → prompt_construction (loop)
    └── [retries exhausted] → logging_node → END
```

---

## Switching Models

Change the `MODEL` env var — no code changes needed:

```bash
MODEL=gemma3        # Google Gemma 3
MODEL=mistral       # Mistral
MODEL=llama3.2      # Meta Llama 3.2
MODEL=qwen2.5       # Qwen 2.5 (default)
```

---

## Design Note

See [DESIGN_NOTE.md](DESIGN_NOTE.md) for the ~600-word engineering design note covering:
- Failure modes & mitigations
- Latency vs quality trade-offs
- PII handling
- Scaling to 10× ticket volume

---

## Evaluation

```bash
python evaluation/run_eval.py
# Outputs: eval_report.json + eval_report.md
```

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

**Never commit `.env` to version control.**

---

*Built for the US Delivery Internship Technical Task Round.*
