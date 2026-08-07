# Design Note — TAM AI Platform

This document describes the architectural decisions, safety considerations, reliability controls, and scaling characteristics of the local ticket triage and technical account management pipeline.

---

## 1. Top 3 Production Failure Modes

To ensure a resilient user experience, three potential failure scenarios have been identified, with automated detection and mitigation protocols built directly into the system layers:

### Failure Mode A: LLM Formatting & Classification Failure
* **Description**: Under CPU contention, the local `qwen2.5` model may generate malformed JSON, omit required fields, or output invalid enum categories (e.g., string concatenation like `"Bug P1"` instead of `"Bug"`).
* **Detection**: The system routes LLM generation outputs to the validation node where `validate_and_repair` in [output_validator.py](file:///c:/Users/hp/OneDrive/Desktop/TAM/src/ai/output_validator.py) attempts syntax repair via `json-repair` and schema validation using expected keys. It normalizes common formatting slip-ups (such as category-urgency concatenation) and verifies enum memberships.
* **Mitigation**: Implemented a bounded feedback retry loop (up to 3 times) in the LangGraph state machine ([triage_graph.py](file:///c:/Users/hp/OneDrive/Desktop/TAM/src/ai/graphs/triage_graph.py)). Each retry injects the validation error logs back into the prompt. If all retries are exhausted, the node falls back to a safe default category (`How-To`) and tier (`P3`), preventing system crashes.

### Failure Mode B: Hallucinated Knowledge-Base (KB) Grounding
* **Description**: The LLM may hallucinate a non-existent document ID (`kb_match.doc_id`) in its response block.
* **Detection**: Post-inference logic in `TriageUseCase._build_kb_match` within [triage_usecase.py](file:///c:/Users/hp/OneDrive/Desktop/TAM/src/application/triage_usecase.py) compares the LLM's suggested document ID against the list of actual document IDs retrieved from the local FAISS vector store.
* **Mitigation**: Any unverified document ID is immediately discarded, and the system falls back to the top document returned by the FAISS retrieval process to guarantee that all references correspond to actual KB articles.

### Failure Mode C: Local LLM Outage or Latency Spikes
* **Description**: Local Ollama execution on CPU is subject to severe resource bottlenecks, leading to processing times of 70–140 seconds per ticket.
* **Detection**: Handled by configuring `REQUEST_TIMEOUT` guards (120s) inside the client wrappers.
* **Mitigation**: In case of a timeout or model failure, FastAPI catches the exception and returns a structured 500 error instead of leaving the thread open. A production scale-up would introduce asynchronous queue buffers to decouple incoming requests from the synchronous LLM thread.

---

## 2. Latency vs. Quality Trade-off

### The Chosen Balance
We implemented a Retrieval-Augmented Generation (RAG) configuration retrieving the top-5 documents and compressing the context payload to a maximum length of 3000 characters. While larger context windows improve grounding accuracy and reduce hallucinations, they increase processing times on local CPU setups. We found that `top_k=5` provides a good balance between sufficient context and manageable latency.

### Adjustments Under a Hard Latency Constraint (e.g., < 5s SLA)
If latency were the primary constraint, we would modify the system architecture to bypass sequential LLM calls for classification:
1. **Rule-Based Pre-Classification**: Utilize deterministic keyword and error-code lookup maps (e.g., matching codes like `ERR_CONNECTION_TIMEOUT`) to resolve product category, severity, and routing teams instantly (<50ms).
2. **Asynchronous LLM Drafting**: Call the LLM solely to draft the response body.
3. **Hardware & Quantization upgrades**: Replace CPU execution with an optimized GPU runtime or a highly quantized model (e.g. GGUF format) served through high-concurrency environments.

---

## 3. Data Sensitivity & PII Safety

To protect customer information and prevent data leakage, we enforce the following security controls:

* **Local Processing Boundary**: All generation tasks run locally on a private deployment loop via Ollama on `localhost:11434`. No customer ticket data or account health summaries are sent to external third-party servers.
* **Hosted Fallback Protections**: If a hosted external LLM API is substituted in the future:
  1. A sanitization middleware is required to detect and mask PII (such as emails, phone numbers, and credentials) using regex or NLP named entity recognition (NER).
  2. The application logger blocks writing raw ticket content at the `INFO` logging level in [logger.py](file:///c:/Users/hp/OneDrive/Desktop/TAM/src/observability/logger.py).
  3. Escalation summaries and verbatim customer quotes are automatically scrubbed from any external-facing evaluation reports.

---

## 4. Behaviour at 10× Scale (5,000+ tickets/day)

### What Breaks First?
At 10× volume, the **synchronous thread blocking** in the FastAPI worker layer breaks first. Because CPU-bound Ollama runs sequentially and takes ~100s per request, a single instance can process at most 864 requests/day. Unbuffered incoming traffic will quickly saturate the FastAPI HTTP connection pool, causing server timeouts and dropped requests.

### Scaling Strategy
1. **Asynchronous Task Queue**: Introduce a broker queue (such as Celery with Redis) to return a job status immediately and process tickets asynchronously in the background.
2. **Horizontal Ollama Scale**: Set up a cluster of Ollama GPU worker nodes behind a load balancer to run inferences in parallel.
3. **Distributed Cache**: Move the FAISS vector index to a shared Redis store to avoid process-level database locks.
4. **Evaluation Sampling**: Rather than evaluating all 5,000 tickets, run validation scripts against a 5% sampled subset of the data to maintain CI pipeline velocity.
