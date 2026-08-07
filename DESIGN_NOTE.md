# Design Note

## Top 3 Production Failure Modes

**1. LLM classification/format failure.** The local `qwen2.5:1.5b` model occasionally
emits malformed JSON or invalid enum values (observed: `issue_category: "Bug P1"`
instead of `"Bug"`, concatenating urgency into category). *Detection:*
`src/ai/output_validator.py` performs strict field-presence and enum validation
(hard-fails on invalid `urgency_tier`/`issue_category` after normalization) rather
than trusting the raw response. *Mitigation:* a bounded retry loop
(`src/ai/graphs/triage_graph.py`, `MAX_RETRIES=3`) re-prompts with a compliance hint
on failure; if all retries fail, the pipeline returns a safe default
(`How-To`/`P3`/`Tier-1 Support`) rather than crashing or forwarding garbage.
*Monitoring:* every validation failure is logged with the raw output for offline
prompt-quality review.

**2. Hallucinated knowledge-base grounding.** An LLM can claim a `kb_match.doc_id`
that was never actually retrieved. *Detection/Mitigation:* `TriageUseCase._build_kb_match`
(`src/application/triage_usecase.py`) cross-checks the LLM's claimed `doc_id` against
the FAISS-retrieved document set; an unverified claim is discarded and replaced with
the top actually-retrieved document. This makes hallucinated KB references structurally
impossible to surface to the user.

**3. Local LLM outage or extreme latency.** Ollama runs on the same host with no
external fallback; observed P1 triage latency was 78–138s on CPU. *Detection:*
`REQUEST_TIMEOUT=120s` in `src/config.py`; failed/slow calls raise and are logged with
`request_id`. *Mitigation:* the FastAPI layer returns a clean 5xx rather than hanging
indefinitely; a production deployment should add a request queue and health-check-gated
readiness probe so upstream callers back off instead of stacking retries during an outage.

## Latency vs Quality Trade-off

The RAG step retrieves top-5 chunks and compresses them into ≤3000 chars
(`MAX_CONTEXT_LENGTH`) before the LLM call — more retrieved context improves grounding
and reduces hallucinated KB matches, but linearly increases prompt tokens and therefore
generation latency on CPU-bound local inference (the dominant cost, at 78–138s/ticket).
We chose `top_k=5` as a middle ground: enough context to disambiguate product area
without pushing single-ticket latency past ~2 minutes. **Under a hard latency
constraint** (e.g. sub-5s SLA), the right change is not to shrink `top_k` further but
to swap architecture entirely: move to rule-based pre-classification (keyword/error-code
matching, already partially present in the confidence heuristic) for the product/category
fields, reserving the LLM call only for `draft_first_response` generation, and swap
`qwen2.5:1.5b` for a hosted low-latency model or a quantized/GPU-served variant.

## PII Handling

All inference is local (Ollama on `localhost:11434`) — ticket and account data never
leave the host, so there is no third-party data-sharing exposure by default. If a hosted
LLM API is substituted, the design should: (1) strip/redact obvious PII (emails, phone
numbers, API keys/secrets appearing in ticket bodies) before constructing the prompt,
(2) avoid logging full ticket bodies at INFO level in production (`src/observability/logger.py`
currently logs structured metadata, not full bodies, by default), and (3) exclude
`escalation_notes`/quotes from any evaluation report that might be shared externally.
This system currently satisfies the assignment's "no external API" constraint by design.

## Scaling to 10× Ticket Volume

At 10× volume (~5,000 tickets/day), the **first bottleneck is LLM inference throughput**:
a single-process, single-model Ollama instance serializes requests, and at ~100s/ticket
for Task 1 that caps throughput at roughly 864 tickets/day per instance — far below
demand. **What breaks first:** the synchronous `LLMClient.generate()` call blocking the
FastAPI worker per request. *Scaling strategy:* (1) horizontally scale Ollama instances
behind a queue (Celery/RQ) so triage requests are processed asynchronously and API
requests return a job ID immediately; (2) cache the FAISS index and KB embeddings in a
shared store instead of per-process load; (3) batch embedding generation for retrieval;
(4) move the evaluation harness to run against a sampled subset rather than the full
volume on every CI run, since eval runtime scales linearly with ticket count and the
same per-ticket latency applies there too.
