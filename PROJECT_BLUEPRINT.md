# 🏗️ PROJECT BLUEPRINT — AI Support & TAM Platform
> **US Delivery Internship — Technical Task Round**  
> **Token-Efficient Workflow Checkpoint · Last Updated: 2026-08-07**  
> **Stack: Python · FastAPI · LangGraph · LangChain · Ollama · FAISS · Streamlit**

---

## ⚡ QUICK CONTEXT (read this first)

This is a **production-grade AI platform** for two internal teams:
1. **Technical Support** — tier-1/tier-2 engineers triaging support tickets
2. **TAM (Technical Account Management)** — account managers prepping for QBRs

**Deliverable:** GitHub repo + Loom walkthrough (3–6 min). **Deadline: 48 hours** from starter repo receipt.

**Scoring:** Task 1 (30) + Task 2 (25) + Task 3 (20) + Task 4 (15) + Bonus (10) = **100 marks**

---

## 📁 REPOSITORY FILE KNOWLEDGE

### Root Structure
```
TAM/
├── data/
│   ├── tickets.json          # 500 synthetic support tickets (~442 KB)
│   └── accounts.json         # 50 synthetic customer account summaries (~44 KB)
├── knowledge-base/
│   ├── products/
│   │   ├── databridge-pro.md   (4.6 KB) — Pipelines, connectors, schema management
│   │   ├── cloudsync.md        (4.8 KB) — File sync, conflict resolution, permissions
│   │   ├── analyticshub.md     (3.8 KB) — Dashboards, reports, data sources, alerts
│   │   ├── securevault.md      (3.8 KB) — Secrets, key management, SSO, audit logs
│   │   └── workflowengine.md   (4.7 KB) — Triggers, actions, scheduling, error handling
│   ├── troubleshooting/
│   │   ├── authentication-sso.md          (3.6 KB) — Cross-product auth & SSO errors
│   │   └── performance-and-integrations.md (5.1 KB) — Timeouts, Salesforce, Snowflake
│   ├── billing/
│   │   └── billing-and-plans.md   (3.7 KB) — Plans, seat billing, invoices, upgrades
│   └── onboarding/
│       └── onboarding-guide.md    (4.3 KB) — New org checklist, roles, training paths
├── DATA_SCHEMA.md             # Full schema with enum values and example records
├── README.md                  # Starter repo readme
├── task_to_do.txt             # Full assignment brief
└── PROJECT_BLUEPRINT.md       # THIS FILE — copy to project root
```

### Data Schema — tickets.json
| Field | Type | Key Values |
|-------|------|------------|
| `ticket_id` | string | `TKT-XXXXX` |
| `account_id` | string | `ACC-XXXX` |
| `company` | string | free text |
| `subject` | string | free text |
| `body` | string | free text (primary classification input) |
| `product` | string | DataBridge Pro, CloudSync, AnalyticsHub, SecureVault, WorkflowEngine |
| `product_area` | string | module within product |
| `category` | enum | Bug, Feature Request, How-To, Performance, Billing, Integration, Onboarding, Data Loss |
| `urgency` | enum | P1 (critical ~5%), P2 (major ~20%), P3 (moderate ~45%), P4 (low ~30%) |
| `status` | enum | Open, In Progress, Pending Customer, Resolved, Closed |
| `plan_tier` | enum | Starter, Professional, Business, Enterprise |
| `assigned_agent` | string | agent name |
| `created_at` | ISO8601 | timestamp |
| `updated_at` | ISO8601 | timestamp |
| `tags` | array | free-form |
| `channel` | enum | email, portal, chat, phone |
| `satisfaction_score` | int or null | 1–5 CSAT |

### Data Schema — accounts.json
| Field | Type | Key Values |
|-------|------|------------|
| `account_id` | string | `ACC-XXXX` |
| `company` | string | free text |
| `tam` | string | TAM name |
| `plan_tier` | enum | Starter, Professional, Business, Enterprise |
| `arr_usd` | int | Annual recurring revenue |
| `seats_licensed` / `seats_active` | int | license utilization |
| `products` | array | products in use |
| `health_status` | enum | Healthy, At Risk, Churning, New |
| `usage_trend` | enum | Increasing, Stable, Declining, Inactive |
| `open_tickets` | int | count |
| `p1_tickets_last_30d` | int | critical ticket count |
| `renewal_date` | YYYY-MM-DD | contract renewal |
| `last_qbr_date` | YYYY-MM-DD | last QBR |
| `escalation_notes` | array | churn signals (KEY for Task 2) |
| `nps_score` | int or null | 1–10 NPS |
| `primary_contact` | object | {name, title} |
| `integrations_active` | array | Salesforce, Snowflake, Slack, etc. |
| `region` | enum | US-East, US-West, US-Central, EU-West, APAC |
| `industry` | string | Financial Services, Healthcare, etc. |

> WARNING: Not every `account_id` in tickets.json has a matching record in accounts.json — handle gracefully. Use last 90 days of tickets for account health analysis.

### Knowledge Base — Error Codes Reference
| Error Code | Product | Meaning |
|------------|---------|---------|
| `ERR_CONNECTION_TIMEOUT` | DataBridge Pro, CloudSync | Network/source unreachable |
| `SCHEMA_MISMATCH` | DataBridge Pro | Schema version mismatch |
| `RATE_LIMIT_EXCEEDED` | DataBridge Pro | API quota hit |
| `QUOTA_EXCEEDED` | DataBridge Pro | Storage limit reached |
| `AUTH_TOKEN_EXPIRED` | All products | Token TTL exceeded |
| `SAML_ASSERTION_EXPIRED` | SecureVault, CloudSync | Clock skew >5min |
| `AUDIENCE_MISMATCH` | SecureVault | Entity ID mismatch |
| `GROUP_NOT_MAPPED` | SecureVault, CloudSync | IDP group has no role |
| `SSO_GROUP_NOT_FOUND` | CloudSync | Group name case mismatch |
| `SESSION_INVALID` | All | Concurrent session limit hit |
| `CHECKSUM_MISMATCH` | DataBridge Pro | Encryption key destroyed |
| `PIPELINE_STALLED` | DataBridge Pro | No heartbeat 15min |
| `DEPENDENCY_UNAVAILABLE` | All | Downstream service down |
| `INVALID_CONFIGURATION` | WorkflowEngine | Missing field in action |

### Knowledge Base — Support Team Routing Logic
| Category | Suggested Team |
|----------|---------------|
| Bug (P1/P2) | Senior Engineering Support |
| Bug (P3/P4) | Tier-1 Support |
| Performance | Platform Engineering + Tier-2 |
| Integration | Integration Specialists |
| Billing | Billing Team |
| Feature Request | Product Team + CSM |
| How-To | Technical Documentation / Tier-1 |
| Onboarding | Customer Success + Onboarding Team |
| Data Loss | Escalation Engineering (URGENT) |

---

## TASK BREAKDOWN & PROGRESS TRACKER

### TASK 1 — Intelligent Ticket Triage Agent (30 marks)
**Status:** `[ ] Not Started`

**Input:** Raw ticket (free-text or JSON with subject + body)
**Output:** Structured triage JSON with reasoning

```json
{
  "ticket_id": "TKT-XXXXX",
  "product_area": "...",
  "issue_category": "Bug|Performance|...",
  "urgency_tier": "P1|P2|P3|P4",
  "urgency_reasoning": "...",
  "kb_match": {"doc_id": "...", "doc_title": "...", "relevance_score": 0.92},
  "recommended_team": "...",
  "draft_first_response": "...",
  "confidence": 0.87,
  "retrieved_docs": ["..."],
  "processing_time_ms": 1234
}
```

**Subtasks:**
- `[ ]` FastAPI endpoint `POST /api/v1/triage`
- `[ ]` LangGraph state graph with all nodes (see Architecture section)
- `[ ]` FAISS vector store built from knowledge-base MD files
- `[ ]` RAG retrieval pipeline with context compression
- `[ ]` Structured JSON output with JSON repair
- `[ ]` Confidence scoring
- `[ ]` Streaming response support (+3 bonus marks)

---

### TASK 2 — TAM Account Health Summariser (25 marks)
**Status:** `[ ] Not Started`

**Input:** `account_id`
**Output:** 3-section brief (deterministic)

```
Section 1: Executive Summary (3-5 sentences)
Section 2: Open Risks & Flagged Issues
Section 3: Recommended Talking Points for TAM
+ Churn Risk Flags with direct quotes from tickets
```

**Subtasks:**
- `[ ]` `GET /api/v1/account/{account_id}/brief`
- `[ ]` Pull account summary + last 90 days of tickets from mock dataset
- `[ ]` Multi-doc summarisation with prompt chaining (LangGraph)
- `[ ]` Deterministic output (temperature=0, seed=42)
- `[ ]` Churn risk detection with quote attribution
- `[ ]` Reuse Task 1 LangGraph graph structure

---

### TASK 3 — Evaluation Harness (20 marks)
**Status:** `[ ] Not Started`

**Requirements:**
- 5+ test cases per task with expected outputs or acceptance criteria
- Scoring function: pass/fail + quality score (0-1) per test case
- Summary report: `eval_report.json` AND `eval_report.md`
- At least 1 adversarial test case per task

**Test Case Design:**
| Task | Test ID | Type | Description |
|------|---------|------|-------------|
| T1 | TC-1-01 | Normal | P1 DataBridge timeout ticket → Urgency=P1, category=Bug |
| T1 | TC-1-02 | Normal | Billing question → category=Billing, team=Billing |
| T1 | TC-1-03 | Normal | SSO error ticket → KB match=auth-sso.md |
| T1 | TC-1-04 | Normal | Feature request → category=Feature Request |
| T1 | TC-1-05 | Adversarial | Ambiguous ticket → confidence<0.7, no hallucination |
| T2 | TC-2-01 | Normal | Healthy account → No churn flags |
| T2 | TC-2-02 | Normal | At Risk account → Risk section non-empty |
| T2 | TC-2-03 | Normal | Account with P1 tickets → Escalation signal detected |
| T2 | TC-2-04 | Normal | Determinism test → 2 runs produce identical output |
| T2 | TC-2-05 | Adversarial | account_id not in accounts.json → Graceful fallback |

**Subtasks:**
- `[ ]` Metrics interface (BaseMetric abstract class)
- `[ ]` Dataset loader for test fixtures
- `[ ]` Evaluator registry (rule-based + LLM-judge)
- `[ ]` Result reporter (JSON + Markdown)
- `[ ]` Infrastructure for future BLEU, ROUGE, Semantic Similarity, Hallucination detection

---

### TASK 4 — Design Note (15 marks)
**Status:** `[ ] Not Started`

**File:** `DESIGN_NOTE.md` (or in README) ~600 words covering:
- `[ ]` Failure modes (top 3) + detection + mitigation
- `[ ]` Latency vs quality trade-off (concrete example)
- `[ ]` Data sensitivity / PII handling
- `[ ]` Scaling to 10x ticket volume

---

### BONUS TASKS
- `[ ]` +5 pts: Thin UI demo (Streamlit/Gradio)
- `[ ]` +3 pts: Streaming output in Task 1 or 2
- `[ ]` +2 pts: GitHub Actions CI running eval harness
- `[ ]` +2 pts: Prompt versioning with version ID and changelog

---

## SYSTEM ARCHITECTURE

### Tech Stack (Mandatory)
```
LLM Layer:      Ollama (local, mandatory) + LangChain
Orchestration:  LangGraph (mandatory, all AI pipelines)
Embedding:      Ollama nomic-embed-text (or mxbai-embed-large)
Vector Store:   FAISS (persistent, lazy-loaded singleton)
Backend:        FastAPI (Domain Driven Design)
UI:             Streamlit (dark mode, enterprise SaaS aesthetics)
Config:         .env (python-dotenv)
Models:         qwen2.5 | gemma3 | mistral | llama3.2 (configurable via MODEL env var)
```

### LangGraph State Graph — Task 1 (Triage)
```
[Input Validation]
       |
[Retrieval]  -->  FAISS + top-K + metadata filter
       |
[Context Compression]
       |
[Prompt Construction]  -->  versioned prompt templates
       |
[LLM Generation]  -->  Ollama streaming
       |
[Output Validation]  -->  JSON schema check + repair
       |
[Confidence Calculation]
       |
[Logging]  -->  structured trace log
       | (on failure)
[Retry]
```

### LangGraph State Graph — Task 2 (Account Brief)
```
[Input Validation]
       |
[Account Data Fetch]  -->  accounts.json + 90-day ticket filter
       |
[Churn Signal Detection]  -->  escalation_notes + P1 count + usage_trend
       |
[Multi-Doc Summarisation Chain]
       |
[Section Assembly]  -->  Executive Summary | Risks | Talking Points
       |
[Determinism Guard]  -->  temperature=0, seed=42
       |
[Output Validation]
       |
[Logging]
```

### Domain Driven Design — Backend Layers
```
Presentation Layer  (FastAPI routes — NO business logic)
        |
Application Layer   (Use cases: TriageUseCase, AccountBriefUseCase)
        |
Domain Layer        (Entities: Ticket, Account, TriageResult, AccountBrief)
        |
Infrastructure Layer (FAISS repo, JSON data loader, Ollama client, FAISS index)
```

### AI Architecture — Modular Components
| Component | Responsibility | Replaceable |
|-----------|---------------|-------------|
| LLMClient | Ollama wrapper ONLY | Yes |
| EmbeddingService | Singleton embedding model | Yes |
| Retriever | FAISS search + compression | Yes |
| PromptManager | Load versioned .md prompts | Yes |
| OutputValidator | JSON schema + JSON repair | Yes |
| ConversationState | LangGraph state typing | Yes |
| EvaluationHooks | Metrics injection points | Yes |

> RULE: No module except LLMClient should directly import or depend on Ollama.

---

## PROJECT FILE STRUCTURE (TO BUILD)

```
tam-ai-platform/
├── .env.example
├── .github/workflows/eval-ci.yml
├── requirements.txt
├── README.md
├── DESIGN_NOTE.md
├── eval_report.json
├── eval_report.md
│
├── data/                           # PROVIDED - DO NOT MODIFY
├── knowledge-base/                 # PROVIDED - DO NOT MODIFY
│
├── prompts/
│   ├── triage_v1.md
│   ├── account_brief_v1.md
│   ├── churn_detection_v1.md
│   └── llm_judge_v1.md
│
├── src/
│   ├── infrastructure/
│   │   ├── llm_client.py           # Ollama wrapper (ONLY file that touches Ollama)
│   │   ├── embedding_service.py    # Singleton
│   │   ├── vector_store.py         # FAISS persistent index (lazy-loaded singleton)
│   │   ├── data_loader.py          # tickets.json + accounts.json loader
│   │   └── prompt_manager.py       # Load versioned .md prompt files
│   │
│   ├── domain/
│   │   ├── entities.py             # Ticket, Account, TriageResult, AccountBrief
│   │   └── interfaces.py           # Abstract interfaces
│   │
│   ├── application/
│   │   ├── triage_usecase.py
│   │   └── account_brief_usecase.py
│   │
│   ├── ai/
│   │   ├── graphs/
│   │   │   ├── triage_graph.py
│   │   │   └── account_brief_graph.py
│   │   ├── nodes/
│   │   │   ├── input_validation.py
│   │   │   ├── retrieval.py
│   │   │   ├── context_compression.py
│   │   │   ├── prompt_construction.py
│   │   │   ├── llm_generation.py
│   │   │   ├── output_validation.py
│   │   │   ├── confidence_calculation.py
│   │   │   ├── retry.py
│   │   │   └── logging_node.py
│   │   ├── retriever.py
│   │   ├── output_validator.py
│   │   └── state.py                # LangGraph TypedDict state definitions
│   │
│   ├── presentation/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── routers/
│   │   │   ├── triage.py           # POST /api/v1/triage
│   │   │   └── account.py          # GET /api/v1/account/{id}/brief
│   │   └── schemas.py              # Pydantic request/response models
│   │
│   └── observability/
│       ├── logger.py               # Structured JSON logger
│       └── tracer.py               # Execution trace with request IDs
│
├── evaluation/
│   ├── framework/
│   │   ├── base_metric.py
│   │   ├── dataset_loader.py
│   │   ├── evaluator_registry.py
│   │   └── result_reporter.py
│   ├── test_cases/
│   │   ├── task1_cases.json
│   │   └── task2_cases.json
│   └── run_eval.py
│
└── ui/
    ├── app.py                      # Streamlit UI
    └── components/
        ├── triage_view.py
        └── account_brief_view.py
```

---

## ENVIRONMENT VARIABLES (.env.example)

```env
# LLM Configuration
OLLAMA_BASE_URL=http://localhost:11434
MODEL=qwen2.5
EMBEDDING_MODEL=nomic-embed-text
MODEL_TEMPERATURE=0
MODEL_SEED=42

# Application
APP_ENV=development
LOG_LEVEL=INFO
API_PORT=8000

# Data Paths
DATA_DIR=./data
KB_DIR=./knowledge-base
FAISS_INDEX_PATH=./vector_store/faiss_index

# RAG Configuration
TOP_K=5
CHUNK_SIZE=512
CHUNK_OVERLAP=64

# Evaluation
EVAL_OUTPUT_DIR=./eval_results
```

---

## PROMPT MANAGEMENT STANDARD

Every prompt file in `prompts/` must follow this header:

```
---
name: triage_v1
purpose: Classify support ticket and generate structured triage output
version: 1.0.0
author: [your name]
created: 2026-08-07
inputs:
  - ticket_subject: string
  - ticket_body: string
  - retrieved_context: string
  - account_tier: string
expected_output: JSON matching TriageResult schema
json_schema: see src/presentation/schemas.py#TriageResult
changelog:
  - 1.0.0: Initial version
future_notes: Add multi-language support in v2
---
```

> RULE: Prompts MUST NEVER be embedded inside Python source files.

---

## SECURITY REQUIREMENTS

- Never commit secrets or API keys
- Use `.env` for all credentials, `.env.example` with placeholder values
- Validate all inputs at the Presentation layer
- Sanitize prompts to prevent prompt injection
- Mask PII in logs (email, names, account numbers)
- Validate uploaded files (type, size)
- Rate limit APIs (FastAPI middleware)

---

## NEVER DO THIS

```
No hardcoded outputs, classifications, teams, or KB mappings
No bypassing the retrieval pipeline
No fake streaming
No placeholder APIs that return static data
No embedding prompts inside Python source files
No importing Ollama outside of LLMClient
No business logic inside FastAPI route handlers
No external data (no live scraping, no real customer data)
No committing API keys or credentials
No temperature > 0 for Task 2 (determinism required)
```

---

## SUBMISSION CHECKLIST

- `[ ]` Public GitHub repo with all code
- `[ ]` README with setup instructions + sample run for each task + design note
- `[ ]` Loom video 3-6 min: code walkthrough + live demo Task 1 & 2 + eval results
- `[ ]` `eval_report.json` committed to repo
- `[ ]` `eval_report.md` committed to repo
- `[ ]` `.env.example` with all required vars (no real values)
- `[ ]` Code runs from `pip install -r requirements.txt` + single entrypoint command
- `[ ]` No API keys committed anywhere in git history
- `[ ]` No external data used

---

## AI REASONING PROTOCOL

Before implementing any feature:

1. Explain the problem
2. Explain the architecture
3. Explain alternatives
4. Justify the chosen approach
5. Identify trade-offs
6. Then generate production-ready code

Never generate code before reasoning. Prefer engineering quality over speed.

---

## PRODUCT QUICK REFERENCE

### Products & Versions
| Product | Version | Key Error Codes | SLA (Enterprise) |
|---------|---------|----------------|-----------------|
| DataBridge Pro | 3.1.2 | ERR_CONNECTION_TIMEOUT, SCHEMA_MISMATCH, RATE_LIMIT_EXCEEDED | 2h |
| CloudSync | 2.5.0 | SSO_GROUP_NOT_FOUND, ERR_CONNECTION_TIMEOUT | 2h |
| AnalyticsHub | 3.0.0 | Dashboard timeouts, 1000-row export limit (Starter) | 2h |
| SecureVault | 2.6.0 | SAML_ASSERTION_EXPIRED, CHECKSUM_MISMATCH, AUDIENCE_MISMATCH | 2h |
| WorkflowEngine | 3.1.2 | Auto-pause after 3 failures, duplicate webhook | 2h |

### Plan Tiers (all products)
| Feature | Starter | Professional | Business | Enterprise |
|---------|---------|--------------|----------|------------|
| Support SLA | 48h | 24h | 8h | 2h |
| SSO/SAML | No | No | Yes | Yes |
| Customer-managed keys | No | No | Yes | Yes |
| Dedicated TAM | No | No | No | Yes |

### Churn Risk Signals (Task 2 detection)
- `health_status` = "Churning" or "At Risk"
- `usage_trend` = "Declining" or "Inactive"
- `p1_tickets_last_30d` > 2
- `nps_score` < 5
- `escalation_notes` containing: "competitor", "cancel", "churn", "frustration", "champion left", "evaluating alternatives"
- `renewal_date` within 90 days + `health_status` = "At Risk"

---

## RECOMMENDED BUILD ORDER (PHASES)

```
Phase 1 — Foundation (2h)
  Project structure + venv + requirements.txt
  .env.example + config loading
  Data loader (tickets.json + accounts.json)
  KB ingestion to FAISS index (persistent)
  LLM client (Ollama wrapper)
  Domain entities + schemas

Phase 2 — Core AI (3h)
  LangGraph state definitions
  All graph nodes (individually testable)
  Task 1: Triage graph + FastAPI endpoint
  Task 2: Account Brief graph + FastAPI endpoint
  Streaming support

Phase 3 — Evaluation (1h)
  Test case fixtures (task1_cases.json, task2_cases.json)
  Metric framework (rule-based)
  Eval runner + report generator
  eval_report.json + eval_report.md

Phase 4 — Polish (1h)
  Streamlit UI (bonus +5)
  GitHub Actions CI (bonus +2)
  Prompt versioning (bonus +2)
  DESIGN_NOTE.md (Task 4)
  README + .env.example

Phase 5 — Submission (30min)
  Final test run
  Loom recording
  Push to GitHub
```

```

---

## HOW TO RUN THE PROJECT

The platform consists of a FastAPI backend and a React/Vite frontend. They can be run seamlessly using the following instructions:

### 1. Backend (FastAPI + LangGraph)
The backend handles the AI orchestration, vector retrieval, and serves the production-built React app.

```bash
# Ensure your environment is active (if applicable) and PYTHONPATH is set
$env:PYTHONPATH = "C:\Users\hp\OneDrive\Desktop\TAM"

# Start the Uvicorn server on port 8050
python -m uvicorn src.presentation.main:app --host 0.0.0.0 --port 8050
```
*Note: The FastAPI app is configured to serve the `frontend/dist` directory on the root path `/` automatically if it has been built.*

### 2. Frontend (React + Vite)
For development with Hot Module Replacement (HMR) and active proxying to the backend API:

```bash
cd frontend
npm run dev
```
*This starts the Vite dev server (usually on `http://localhost:5173`) and proxies `/api` requests to the FastAPI backend running on port `8050`.*

### 3. Production Build
To create a production build of the frontend that FastAPI will serve directly:
```bash
cd frontend
npm run build
```
Once built, you only need to run the Uvicorn backend, and the fully integrated UI will be accessible at `http://localhost:8050/`.

---

## HOW TO USE THIS FILE WITH ANOTHER AI

Copy and paste the following as your system/context prompt when starting a new AI session:

```
Read PROJECT_BLUEPRINT.md first. It contains complete project context:
- All file knowledge (data schemas, KB contents, error codes)
- Full architecture decisions (LangGraph, DDD, Ollama, FAISS)
- Task breakdown with acceptance criteria
- File structure to build
- Never-do rules and security requirements
- Submission checklist

Do NOT ask me to re-explain the project. Start from where the task tracker shows.
Current phase: [UPDATE THIS]
Current task: [UPDATE THIS]
Files created so far: [LIST THEM]
```

---
