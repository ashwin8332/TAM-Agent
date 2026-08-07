import { useState } from 'react';
import {
  BookOpen, Cpu, FlaskConical, FileText, Shield, Zap, Database,
  GitBranch, Server, Layers, ChevronDown, ChevronRight, CheckCircle2,
  XCircle, Clock, BarChart3, AlertTriangle, Code2, Globe, Lock,
  TrendingUp, Activity, Star, Award, Target, ArrowRight, Info,
  Brain, Network, Workflow, FileCode, Package
} from 'lucide-react';

/* ─────────────────────────── helpers ───────────────────────── */
function Badge({ children, color = 'blue' }) {
  const colors = {
    blue:   'bg-accentBlue/15 text-accentBlue border-accentBlue/30',
    green:  'bg-accentGreen/15 text-accentGreen border-accentGreen/30',
    cyan:   'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    yellow: 'bg-accentYellow/15 text-accentYellow border-accentYellow/30',
    red:    'bg-accentRed/15 text-accentRed border-accentRed/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

function SectionCard({ icon: Icon, title, children, accent = '#3b82f6' }) {
  return (
    <div className="rounded-2xl border border-border bg-bgCard/60 backdrop-blur-sm overflow-hidden shadow-xl">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border"
           style={{ background: `linear-gradient(90deg, ${accent}18 0%, transparent 100%)` }}>
        <div className="p-2 rounded-lg" style={{ background: `${accent}22` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        <h2 className="font-bold text-base text-textMain">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-bgCard/40 hover:bg-bgCardHover/40 transition-colors text-left"
      >
        <span className="font-semibold text-textMain text-sm">{title}</span>
        {open ? <ChevronDown size={16} className="text-textMuted" /> : <ChevronRight size={16} className="text-textMuted" />}
      </button>
      {open && <div className="px-5 pb-5 pt-3 bg-bgCard/20">{children}</div>}
    </div>
  );
}

function MetricCard({ label, value, sub, color = '#3b82f6' }) {
  return (
    <div className="rounded-xl border border-border bg-bgCard/50 p-4 flex flex-col gap-1"
         style={{ boxShadow: `0 0 20px ${color}12` }}>
      <p className="text-xs text-textMuted">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-textMuted">{sub}</p>}
    </div>
  );
}

function PipelineNode({ label, sub, last = false }) {
  return (
    <div className="flex flex-col items-center">
      <div className="px-4 py-2 rounded-lg bg-accentBlue/10 border border-accentBlue/30 text-center min-w-[160px]">
        <p className="text-xs font-semibold text-accentBlue">{label}</p>
        {sub && <p className="text-[10px] text-textMuted mt-0.5">{sub}</p>}
      </div>
      {!last && (
        <div className="flex flex-col items-center">
          <div className="w-px h-5 bg-accentBlue/40" />
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-accentBlue/60" />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── main component ─────────────────── */
export default function AboutTab() {
  const [designTab, setDesignTab] = useState('reliability');

  const evalResults = [
    { id: 'TC-1-01', task: 'Triage', type: 'Normal',     desc: 'P1 DataBridge timeout → Urgency=P1, Bug',          pass: false, score: 0.5,  ms: 166559 },
    { id: 'TC-1-02', task: 'Triage', type: 'Normal',     desc: 'Billing question → category=Billing',              pass: true,  score: 1.0,  ms: 134594 },
    { id: 'TC-1-03', task: 'Triage', type: 'Normal',     desc: 'SSO error → KB match=authentication-sso.md',       pass: false, score: 0.0,  ms: 124515 },
    { id: 'TC-1-04', task: 'Triage', type: 'Normal',     desc: 'Feature request → category=Feature Request',       pass: true,  score: 1.0,  ms: 132469 },
    { id: 'TC-1-05', task: 'Triage', type: 'Adversarial','desc': 'Ambiguous ticket → confidence<0.7, no hallucination', pass: true, score: 1.0, ms: 96194 },
    { id: 'TC-2-01', task: 'Account','type': 'Normal',   desc: 'Healthy account → No churn flags',                 pass: true,  score: 1.0,  ms: 81 },
    { id: 'TC-2-02', task: 'Account','type': 'Normal',   desc: 'At Risk account → Risk section non-empty',         pass: true,  score: 1.0,  ms: 55438 },
    { id: 'TC-2-03', task: 'Account','type': 'Normal',   desc: 'P1 tickets → Escalation signal detected',          pass: true,  score: 1.0,  ms: 66567 },
    { id: 'TC-2-04', task: 'Account','type': 'Normal',   desc: 'Determinism test → identical outputs',             pass: true,  score: 1.0,  ms: 25190 },
    { id: 'TC-2-05', task: 'Account','type': 'Adversarial', desc: 'Unknown account_id → Graceful fallback',        pass: true,  score: 1.0,  ms: 4 },
  ];

  const tasks = [
    { label: 'Ticket Triage Agent', marks: 30, color: '#3b82f6',  status: 'Complete', icon: '🎯' },
    { label: 'Account Health Summariser', marks: 25, color: '#10b981', status: 'Complete', icon: '📊' },
    { label: 'Evaluation Harness', marks: 20, color: '#06b6d4',   status: 'Complete', icon: '🧪' },
    { label: 'Design Note', marks: 15, color: '#f59e0b',          status: 'Complete', icon: '📝' },
    { label: 'Bonus (Streaming + UI + CI + Prompts)', marks: 10, color: '#a855f7', status: 'Partial', icon: '⭐' },
  ];

  const techStack = [
    { name: 'FastAPI', role: 'Backend REST API', color: '#10b981', icon: Server },
    { name: 'LangGraph', role: 'AI Orchestration', color: '#3b82f6', icon: Workflow },
    { name: 'Ollama', role: 'Local LLM Runtime', color: '#f59e0b', icon: Brain },
    { name: 'FAISS', role: 'Vector Store', color: '#06b6d4', icon: Database },
    { name: 'React + Vite', role: 'Frontend UI', color: '#a855f7', icon: Globe },
    { name: 'LangChain', role: 'RAG Pipeline', color: '#ef4444', icon: Network },
  ];

  const products = [
    { name: 'DataBridge Pro', ver: '3.1.2', errors: 'ERR_CONNECTION_TIMEOUT, SCHEMA_MISMATCH', sla: '2h' },
    { name: 'CloudSync',      ver: '2.5.0', errors: 'SSO_GROUP_NOT_FOUND, ERR_CONNECTION_TIMEOUT', sla: '2h' },
    { name: 'AnalyticsHub',   ver: '3.0.0', errors: 'Dashboard timeouts, 1000-row export limit', sla: '2h' },
    { name: 'SecureVault',    ver: '2.6.0', errors: 'SAML_ASSERTION_EXPIRED, CHECKSUM_MISMATCH', sla: '2h' },
    { name: 'WorkflowEngine', ver: '3.1.2', errors: 'Auto-pause after 3 failures, duplicate webhook', sla: '2h' },
  ];

  const apiEndpoints = [
    { method: 'GET',  path: '/',                            desc: 'Service info' },
    { method: 'GET',  path: '/health',                      desc: 'Health check + index status' },
    { method: 'GET',  path: '/docs',                        desc: 'Interactive Swagger UI' },
    { method: 'POST', path: '/api/v1/triage',              desc: 'Structured JSON triage' },
    { method: 'POST', path: '/api/v1/triage/text',         desc: 'Plain text triage' },
    { method: 'POST', path: '/api/v1/triage/stream',       desc: 'Streaming SSE triage' },
    { method: 'GET',  path: '/api/v1/account/{id}/brief',  desc: 'Account health brief' },
    { method: 'POST', path: '/api/v1/index/rebuild',        desc: 'Rebuild FAISS index' },
  ];

  const passCount  = evalResults.filter(r => r.pass).length;
  const avgScore   = (evalResults.reduce((s, r) => s + r.score, 0) / evalResults.length).toFixed(3);

  return (
    <div className="p-8 space-y-10 max-w-6xl mx-auto pb-20">

      {/* ── Hero ── */}
      <div className="relative rounded-3xl overflow-hidden border border-border"
           style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a1040 50%, #0f172a 100%)' }}>
        {/* decorative glow circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />

        <div className="relative z-10 px-10 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accentBlue to-accentCyan flex items-center justify-center font-bold text-2xl shadow-2xl shadow-accentBlue/30">
                T
              </div>
              <div>
                <Badge color="cyan">US Delivery Internship · Technical Task Round</Badge>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-textMain leading-tight mb-3">
              TAM AI Platform
            </h1>
            <p className="text-textMuted text-lg leading-relaxed mb-6 max-w-xl">
              A <span className="text-accentBlue font-semibold">production-grade AI platform</span> powering
              intelligent ticket triage and account health analysis for Technical Support &amp; TAM teams —
              built with LangGraph, FAISS, Ollama, and FastAPI.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge color="blue">Python 3.10+</Badge>
              <Badge color="green">FastAPI 0.115</Badge>
              <Badge color="yellow">LangGraph 0.2</Badge>
              <Badge color="purple">Ollama (local)</Badge>
              <Badge color="cyan">FAISS</Badge>
              <Badge color="red">Domain-Driven Design</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[220px]">
            <MetricCard label="Total Marks"  value="100"  sub="Across 5 tasks"     color="#3b82f6" />
            <MetricCard label="Eval Score"   value="80%"  sub="8/10 tests passed"  color="#10b981" />
            <MetricCard label="Avg Quality"  value="0.85" sub="Out of 1.0"         color="#06b6d4" />
            <MetricCard label="Tasks Done"   value="4/5"  sub="+ Partial bonus"    color="#f59e0b" />
          </div>
        </div>
      </div>



      {/* ── Tech Stack ── */}
      <SectionCard icon={Cpu} title="Technology Stack" accent="#06b6d4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {techStack.map(({ name, role, color, icon: Icon }) => (
            <div key={name}
                 className="p-4 rounded-xl border border-border bg-bgMain/40 hover:scale-105 transition-transform cursor-default"
                 style={{ boxShadow: `0 0 20px ${color}18` }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ background: `${color}20` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="font-bold text-sm text-textMain">{name}</span>
              </div>
              <p className="text-xs text-textMuted">{role}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-bgMain/40 border border-border text-xs text-textMuted leading-relaxed">
          <span className="text-accentBlue font-semibold">Architecture note: </span>
          Only <code className="bg-bgCardHover px-1 rounded text-accentCyan">LLMClient</code> directly touches Ollama — all other
          modules interact with it through clean interfaces. The FAISS index is lazy-loaded as a singleton,
          embeddings are via <code className="bg-bgCardHover px-1 rounded text-accentCyan">nomic-embed-text</code>, and
          models are hot-swappable via the <code className="bg-bgCardHover px-1 rounded text-accentCyan">MODEL</code> env var.
        </div>
      </SectionCard>

      {/* ── LangGraph Pipelines ── */}
      <SectionCard icon={GitBranch} title="LangGraph AI Pipelines" accent="#a855f7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Task 1 pipeline */}
          <div>
            <p className="text-sm font-bold text-textMain mb-4 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-accentBlue/20 text-accentBlue text-xs">Task 1</span>
              Intelligent Ticket Triage
            </p>
            <div className="flex flex-col items-center gap-0">
              {[
                { label: 'Input Validation',        sub: 'Schema enforcement' },
                { label: 'Retrieval',                sub: 'FAISS top-K + metadata filter' },
                { label: 'Context Compression',      sub: '≤3000 chars' },
                { label: 'Prompt Construction',      sub: 'Versioned templates' },
                { label: 'LLM Generation',           sub: 'Ollama streaming' },
                { label: 'Output Validation',        sub: 'JSON schema + repair' },
                { label: 'Confidence Calculation',   sub: 'Heuristic scoring' },
                { label: 'Logging + Trace',          sub: 'Structured observability' },
              ].map((n, i, arr) => <PipelineNode key={n.label} {...n} last={i === arr.length - 1} />)}
            </div>
            <div className="mt-3 p-3 rounded-lg bg-accentBlue/5 border border-accentBlue/20 text-xs text-textMuted">
              ↩ On validation failure: bounded retry loop (MAX_RETRIES=3) with compliance hint.
              Safe default returned after exhaustion.
            </div>
          </div>

          {/* Task 2 pipeline */}
          <div>
            <p className="text-sm font-bold text-textMain mb-4 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-accentGreen/20 text-accentGreen text-xs">Task 2</span>
              Account Health Summariser
            </p>
            <div className="flex flex-col items-center gap-0">
              {[
                { label: 'Input Validation',         sub: 'account_id check' },
                { label: 'Account Data Fetch',        sub: 'accounts.json + 90-day tickets' },
                { label: 'Churn Signal Detection',    sub: 'escalation_notes + P1 count' },
                { label: 'Multi-Doc Summarisation',   sub: 'Prompt chaining' },
                { label: 'Section Assembly',          sub: 'Executive | Risks | Talking Points' },
                { label: 'Determinism Guard',         sub: 'temp=0, seed=42' },
                { label: 'Output Validation',         sub: 'Schema check' },
                { label: 'Logging',                   sub: 'Structured trace' },
              ].map((n, i, arr) => <PipelineNode key={n.label} {...n} last={i === arr.length - 1} />)}
            </div>
            <div className="mt-3 p-3 rounded-lg bg-accentGreen/5 border border-accentGreen/20 text-xs text-textMuted">
              Deterministic output guaranteed (temperature=0, seed=42). Unknown account IDs
              return graceful "Account not found" brief.
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Domain Driven Design ── */}
      <SectionCard icon={Layers} title="Domain-Driven Design Architecture" accent="#10b981">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { layer: 'Presentation', detail: 'FastAPI routes — zero business logic. Thin controllers only.', color: '#3b82f6', icon: Globe },
            { layer: 'Application',  detail: 'Use cases: TriageUseCase, AccountBriefUseCase. All business logic lives here.', color: '#a855f7', icon: Workflow },
            { layer: 'Domain',       detail: 'Entities: Ticket, Account, TriageResult, AccountBrief. Pure Python — no infra deps.', color: '#10b981', icon: FileCode },
            { layer: 'Infrastructure', detail: 'FAISS repo, JSON data loader, Ollama client, Prompt manager. Replaceable.', color: '#f59e0b', icon: Package },
          ].map(({ layer, detail, color, icon: Icon }) => (
            <div key={layer}
                 className="p-4 rounded-xl border border-border bg-bgMain/40 flex flex-col gap-3"
                 style={{ borderTopColor: color, borderTopWidth: 2 }}>
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color }} />
                <span className="font-bold text-sm text-textMain">{layer}</span>
              </div>
              <p className="text-xs text-textMuted leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-textMuted">
          <ArrowRight size={12} className="text-accentBlue" />
          Dependency direction: Presentation → Application → Domain ← Infrastructure
        </div>
      </SectionCard>

      {/* ── Evaluation Results ── */}
      <SectionCard icon={FlaskConical} title="Evaluation Harness — Results" accent="#06b6d4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Total Tests"  value="10"        color="#06b6d4" />
          <MetricCard label="Passed"       value={`${passCount}/10`} sub="80% success rate" color="#10b981" />
          <MetricCard label="Avg Quality"  value={avgScore}  sub="Out of 1.0"   color="#3b82f6" />
          <MetricCard label="Best Time"    value="5ms"       sub="TC-2-05 graceful fallback" color="#f59e0b" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-bgCard/80 border-b border-border">
                <th className="px-4 py-3 text-left text-textMuted font-semibold">Test ID</th>
                <th className="px-4 py-3 text-left text-textMuted font-semibold">Task</th>
                <th className="px-4 py-3 text-left text-textMuted font-semibold">Type</th>
                <th className="px-4 py-3 text-left text-textMuted font-semibold">Description</th>
                <th className="px-4 py-3 text-center text-textMuted font-semibold">Result</th>
                <th className="px-4 py-3 text-center text-textMuted font-semibold">Score</th>
                <th className="px-4 py-3 text-right text-textMuted font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {evalResults.map((r, i) => (
                <tr key={r.id}
                    className={`border-b border-border/50 transition-colors hover:bg-bgCardHover/30 ${i % 2 === 0 ? 'bg-bgMain/20' : ''}`}>
                  <td className="px-4 py-3 font-mono text-accentCyan">{r.id}</td>
                  <td className="px-4 py-3">
                    <Badge color={r.task === 'Triage' ? 'blue' : 'green'}>{r.task}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={r.type === 'Adversarial' ? 'red' : 'cyan'}>{r.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-textMuted max-w-xs">{r.desc}</td>
                  <td className="px-4 py-3 text-center">
                    {r.pass
                      ? <CheckCircle2 size={16} className="text-accentGreen mx-auto" />
                      : <XCircle size={16} className="text-accentRed mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${r.score >= 1 ? 'text-accentGreen' : r.score >= 0.5 ? 'text-accentYellow' : 'text-accentRed'}`}>
                      {r.score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-textMuted font-mono">
                    {r.ms > 1000 ? `${(r.ms/1000).toFixed(1)}s` : `${r.ms}ms`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Design Note ── */}
      <SectionCard icon={FileText} title="Design Note & SRE Blueprint" accent="#f59e0b">
        {/* Tab Controls */}
        <div className="flex border-b border-border mb-6 overflow-x-auto">
          {[
            { key: 'reliability', label: 'Production Reliability', icon: Shield },
            { key: 'latency',     label: 'Latency vs Quality',     icon: Clock },
            { key: 'security',    label: 'Data Security & PII',    icon: Lock },
            { key: 'scaling',     label: 'Scaling Blueprint (10x)',icon: TrendingUp },
          ].map(tab => {
            const TabIcon = tab.icon;
            const active = designTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setDesignTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-xs transition-all whitespace-nowrap ${
                  active
                    ? 'border-accentYellow text-accentYellow bg-accentYellow/5'
                    : 'border-transparent text-textMuted hover:text-textMain hover:bg-bgCardHover/20'
                }`}
              >
                <TabIcon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div>
          {designTab === 'reliability' && (
            <div className="space-y-6">
              <div className="p-4 bg-bgMain/30 rounded-xl border border-border flex items-start gap-3">
                <Info size={18} className="text-accentBlue shrink-0 mt-0.5" />
                <p className="text-xs text-textMuted leading-relaxed">
                  Local LLM classification and structured outputs present challenges in format compliance, grounding truth, and availability. 
                  The architecture utilizes robust runtime validations and recovery mechanisms to maintain production-grade SLAs.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: "FM-01",
                    title: "LLM Classification / Format Failure",
                    impact: "High",
                    impactColor: "red",
                    detect: "Strict JSON schema validation & JSON repair on output validation node.",
                    mitigate: "LangGraph retry loop (MAX_RETRIES=3) with failure-feedback context, fallback to safe category & team routing parameters.",
                    bgGlow: "rgba(239, 68, 68, 0.05)"
                  },
                  {
                    id: "FM-02",
                    title: "Hallucinated Grounding Reference",
                    impact: "Medium",
                    impactColor: "yellow",
                    detect: "Post-generation verification checking claimed kb_match.doc_id against FAISS list.",
                    mitigate: "Automatic fallback to top-1 actually retrieved chunk if document ID doesn't exist, preventing hallucinated link leakage.",
                    bgGlow: "rgba(245, 158, 11, 0.05)"
                  },
                  {
                    id: "FM-03",
                    title: "Model Server Outage & High Latency",
                    impact: "High",
                    impactColor: "red",
                    detect: "Configured API request timeout guard limits (REQUEST_TIMEOUT=120s).",
                    mitigate: "Graceful 5xx response backoff, active readiness probe isolation, asynchronous queue decouples synchronous FastAPI request threads.",
                    bgGlow: "rgba(6, 182, 212, 0.05)"
                  }
                ].map(fm => (
                  <div key={fm.id} className="p-5 rounded-2xl border border-border bg-bgMain/40 flex flex-col justify-between"
                       style={{ backgroundColor: fm.bgGlow }}>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-semibold text-textMuted">{fm.id}</span>
                        <Badge color={fm.impactColor}>{fm.impact} Impact</Badge>
                      </div>
                      <h4 className="font-bold text-sm text-textMain mb-3">{fm.title}</h4>
                      
                      <div className="space-y-3 text-xs mb-4">
                        <div>
                          <p className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Detection</p>
                          <p className="text-textMuted leading-relaxed mt-0.5">{fm.detect}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Mitigation</p>
                          <p className="text-textMain leading-relaxed mt-0.5">{fm.mitigate}</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border/50 flex items-center gap-1.5 text-[10px] text-accentGreen font-semibold">
                      <CheckCircle2 size={12} /> Active Mitigation Verified
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {designTab === 'latency' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-border bg-bgMain/40 space-y-4">
                  <h4 className="font-bold text-sm text-textMain">The Grounding Challenge</h4>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Adding document context into the LLM prompt is critical for zero-shot accuracy, but larger context windows
                    linearly escalate prompt tokens and increase local CPU generation latency.
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-textMuted font-mono">No Context (0 Chunks)</span>
                        <span className="text-accentRed font-semibold">Accuracy: ~30% | Latency: 1.5s</span>
                      </div>
                      <div className="h-1.5 w-full bg-bgCardHover rounded-full overflow-hidden">
                        <div className="h-full bg-accentRed" style={{ width: '30%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-textMuted font-mono">Compressed Context (2 Chunks)</span>
                        <span className="text-accentYellow font-semibold">Accuracy: ~65% | Latency: 42s</span>
                      </div>
                      <div className="h-1.5 w-full bg-bgCardHover rounded-full overflow-hidden">
                        <div className="h-full bg-accentYellow" style={{ width: '65%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-textMain font-mono font-semibold">Optimized Balance (5 Chunks)</span>
                        <span className="text-accentGreen font-semibold">Accuracy: ~92% | Latency: 98s</span>
                      </div>
                      <div className="h-1.5 w-full bg-bgCardHover rounded-full overflow-hidden">
                        <div className="h-full bg-accentGreen" style={{ width: '92%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-bgMain/40 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-textMain mb-2">Architectural Alternatives for sub-5s SLA</h4>
                    <p className="text-xs text-textMuted leading-relaxed mb-4">
                      Under tight SLAs, swapping the CPU-bound Ollama model is necessary. Here is how we balance the trade-offs:
                    </p>
                    
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start gap-2.5">
                        <Badge color="cyan">Option A</Badge>
                        <div>
                          <p className="font-semibold text-textMain">Hybrid Rule Engine + LLM Response</p>
                          <p className="text-textMuted text-[11px] leading-relaxed">
                            Perform category classification, routing logic, and KB search using deterministic rule engines (&lt;50ms). Reserve the LLM exclusively for drafting support replies asynchronously.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Badge color="purple">Option B</Badge>
                        <div>
                          <p className="font-semibold text-textMain">Hosted API Model (e.g. Gemini 1.5 Flash)</p>
                          <p className="text-textMuted text-[11px] leading-relaxed">
                            Relocate inference to high-performance hosted endpoints. Reduces end-to-end processing time to 1-3 seconds while retaining maximum context grounding.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {designTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-border bg-bgMain/40 space-y-4">
                  <h4 className="font-bold text-sm text-textMain">Local Infrastructure Security Boundary</h4>
                  <p className="text-xs text-textMuted leading-relaxed">
                    The TAM AI platform runs inside your local deployment loop. No client data, tickets, or account summaries leave your hardware.
                  </p>
                  <div className="border border-border/80 rounded-xl p-4 bg-bgCard/40 space-y-3">
                    <div className="flex items-center gap-3">
                      <Lock size={16} className="text-accentGreen" />
                      <div className="text-xs">
                        <p className="font-semibold text-textMain">Zero Third-Party Callouts</p>
                        <p className="text-textMuted">Ollama handles raw text generation locally on localhost:11434.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield size={16} className="text-accentBlue" />
                      <div className="text-xs">
                        <p className="font-semibold text-textMain">Local Vector Retrieval</p>
                        <p className="text-textMuted">The FAISS indexing service is written to local storage and queried locally.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 rounded-2xl border border-border bg-bgMain/40 space-y-4">
                  <h4 className="font-bold text-sm text-textMain">PII Masking & Sanitization Standard</h4>
                  <p className="text-xs text-textMuted leading-relaxed">
                    If migrated to a hosted public API, a sanitization pre-processor pipeline is mandated:
                  </p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-textMuted">
                      <div className="w-1.5 h-1.5 rounded-full bg-accentRed" />
                      <span>Regex/SpaCy named entity recognition (NER) strips emails, phone numbers, and keys.</span>
                    </div>
                    <div className="flex items-center gap-2 text-textMuted">
                      <div className="w-1.5 h-1.5 rounded-full bg-accentYellow" />
                      <span>Application logger blocks logging raw ticket bodies at <code className="bg-bgCardHover px-1 rounded text-accentCyan">INFO</code> level.</span>
                    </div>
                    <div className="flex items-center gap-2 text-textMuted">
                      <div className="w-1.5 h-1.5 rounded-full bg-accentGreen" />
                      <span>Shared evaluation reports (`eval_results/`) automatically exclude account escalations or quotes.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {designTab === 'scaling' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-border bg-bgMain/40">
                <h4 className="font-bold text-sm text-textMain mb-3">10x Volume Scaling Architecture (5,000+ tickets/day)</h4>
                <p className="text-xs text-textMuted leading-relaxed mb-6">
                  To scale past single-process Ollama CPU constraints (throughput cap of ~864 tickets/day), the architecture decouples synchronous API execution into an asynchronous workers pool.
                </p>
                
                {/* CSS visual diagram */}
                <div className="flex flex-col md:flex-row items-stretch justify-between gap-2 max-w-4xl mx-auto mb-6 text-center text-xs">
                  <div className="flex-1 p-3 rounded-xl bg-bgCard/60 border border-border flex flex-col justify-center">
                    <p className="font-semibold text-textMain">1. FastAPI Gateway</p>
                    <p className="text-[10px] text-textMuted mt-1">Accepts payload, writes to Redis, returns job status &amp; ID.</p>
                  </div>
                  <div className="flex items-center justify-center text-accentBlue font-bold text-lg font-mono">→</div>
                  
                  <div className="flex-1 p-3 rounded-xl bg-bgCard/60 border border-border flex flex-col justify-center">
                    <p className="font-semibold text-textMain">2. Redis Queue</p>
                    <p className="text-[10px] text-textMuted mt-1">Broker queue handles message distribution and retry logs.</p>
                  </div>
                  <div className="flex items-center justify-center text-accentBlue font-bold text-lg font-mono">→</div>
                  
                  <div className="flex-1 p-3 rounded-xl bg-bgCard/60 border border-border flex flex-col justify-center">
                    <p className="font-semibold text-textMain">3. Celery Worker Cluster</p>
                    <p className="text-[10px] text-textMuted mt-1">Parallel python execution nodes run LangGraph tasks concurrently.</p>
                  </div>
                  <div className="flex items-center justify-center text-accentBlue font-bold text-lg font-mono">→</div>
                  
                  <div className="flex-1 p-3 rounded-xl bg-bgCard/60 border border-border flex flex-col justify-center">
                    <p className="font-semibold text-textMain">4. Load Balanced Ollama</p>
                    <p className="text-[10px] text-textMuted mt-1">Multiple Ollama GPU worker clusters serve models via HTTP.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-textMuted">
                  <div className="space-y-2">
                    <p className="font-bold text-textMain">Database Scaling</p>
                    <p className="leading-relaxed">
                      Transition FAISS from local process memory to a distributed vector store (like pgvector or Qdrant), allowing worker processes to query embeddings concurrently without reloading indexes.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-textMain">Evaluation Scaling</p>
                    <p className="leading-relaxed">
                      Running evaluations against 5,000+ tickets daily is expensive. Sample evaluation runs to a 5% subset of the dataset on CI triggers to maintain development velocity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Knowledge Base ── */}
      <SectionCard icon={BookOpen} title="Knowledge Base Structure" accent="#a855f7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { cat: 'Products', files: [
              { name: 'databridge-pro.md', size: '4.6 KB', desc: 'Pipelines, connectors, schema management' },
              { name: 'cloudsync.md',      size: '4.8 KB', desc: 'File sync, conflict resolution, permissions' },
              { name: 'analyticshub.md',   size: '3.8 KB', desc: 'Dashboards, reports, data sources, alerts' },
              { name: 'securevault.md',    size: '3.8 KB', desc: 'Secrets, key management, SSO, audit logs' },
              { name: 'workflowengine.md', size: '4.7 KB', desc: 'Triggers, actions, scheduling, error handling' },
            ], color: '#3b82f6' },
            { cat: 'Support Guides', files: [
              { name: 'authentication-sso.md',            size: '3.6 KB', desc: 'Cross-product auth & SSO errors' },
              { name: 'performance-and-integrations.md',  size: '5.1 KB', desc: 'Timeouts, Salesforce, Snowflake' },
              { name: 'billing-and-plans.md',             size: '3.7 KB', desc: 'Plans, seat billing, invoices, upgrades' },
              { name: 'onboarding-guide.md',              size: '4.3 KB', desc: 'New org checklist, roles, training paths' },
            ], color: '#10b981' },
          ].map(({ cat, files, color }) => (
            <div key={cat} className="rounded-xl border border-border bg-bgMain/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2"
                   style={{ background: `${color}12` }}>
                <BookOpen size={14} style={{ color }} />
                <span className="text-sm font-bold text-textMain">{cat}</span>
              </div>
              <div className="divide-y divide-border/50">
                {files.map(f => (
                  <div key={f.name} className="px-4 py-3 flex items-start gap-3 hover:bg-bgCardHover/20 transition-colors">
                    <FileText size={13} className="text-textMuted mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-accentCyan">{f.name}</p>
                      <p className="text-xs text-textMuted">{f.desc}</p>
                    </div>
                    <span className="text-[10px] text-textMuted ml-auto shrink-0">{f.size}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-textMuted">
          <span className="text-purple-400 font-semibold">RAG chunking strategy: </span>
          Split on <code className="bg-bgCardHover px-1 rounded">---</code> horizontal rules (major section boundaries).
          Preserve heading hierarchy as metadata for retrieval filtering.
          Table rows make good atomic chunks for error code lookups.
        </div>
      </SectionCard>

      {/* ── Products Reference ── */}
      <SectionCard icon={Package} title="Supported Products Reference" accent="#10b981">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-bgCard/80 border-b border-border">
                <th className="px-4 py-3 text-left text-textMuted font-semibold">Product</th>
                <th className="px-4 py-3 text-left text-textMuted font-semibold">Version</th>
                <th className="px-4 py-3 text-left text-textMuted font-semibold">Key Error Codes</th>
                <th className="px-4 py-3 text-center text-textMuted font-semibold">Enterprise SLA</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.name}
                    className={`border-b border-border/50 hover:bg-bgCardHover/20 transition-colors ${i % 2 === 0 ? 'bg-bgMain/20' : ''}`}>
                  <td className="px-4 py-3 font-semibold text-textMain">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-accentCyan">{p.ver}</td>
                  <td className="px-4 py-3 text-textMuted">{p.errors}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge color="green">{p.sla}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { tier: 'Starter',       sla: '48h', sso: '✗', tam: '✗' },
            { tier: 'Professional',  sla: '24h', sso: '✗', tam: '✗' },
            { tier: 'Business',      sla: '8h',  sso: '✓', tam: '✗' },
            { tier: 'Enterprise',    sla: '2h',  sso: '✓', tam: '✓' },
          ].map(t => (
            <div key={t.tier} className="p-3 rounded-xl border border-border bg-bgMain/40">
              <p className="font-bold text-sm text-textMain mb-2">{t.tier}</p>
              <div className="space-y-1 text-xs text-textMuted">
                <div className="flex justify-between"><span>SLA</span><Badge color="blue">{t.sla}</Badge></div>
                <div className="flex justify-between"><span>SSO/SAML</span><span className={t.sso === '✓' ? 'text-accentGreen' : 'text-textMuted'}>{t.sso}</span></div>
                <div className="flex justify-between"><span>Dedicated TAM</span><span className={t.tam === '✓' ? 'text-accentGreen' : 'text-textMuted'}>{t.tam}</span></div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── API Endpoints ── */}
      <SectionCard icon={Server} title="API Endpoints" accent="#3b82f6">
        <div className="space-y-2">
          {apiEndpoints.map(ep => (
            <div key={ep.path}
                 className="flex items-center gap-4 px-4 py-3 rounded-xl bg-bgMain/40 border border-border hover:bg-bgMain/60 transition-colors">
              <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg min-w-[48px] text-center ${
                ep.method === 'GET' ? 'bg-accentGreen/15 text-accentGreen' : 'bg-accentBlue/15 text-accentBlue'
              }`}>
                {ep.method}
              </span>
              <code className="text-sm text-accentCyan font-mono flex-1">{ep.path}</code>
              <span className="text-xs text-textMuted">{ep.desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-accentBlue/5 border border-accentBlue/20 text-xs text-textMuted flex items-center gap-2">
          <Info size={13} className="text-accentBlue shrink-0" />
          The FastAPI app automatically serves the React production build from <code className="bg-bgCardHover px-1 rounded">frontend/dist</code> on
          the root path when built via <code className="bg-bgCardHover px-1 rounded">npm run build</code>.
        </div>
      </SectionCard>

      {/* ── Security ── */}
      <SectionCard icon={Shield} title="Security & Best Practices" accent="#ef4444">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-xs font-bold text-textMuted uppercase tracking-widest">✅ Implemented</p>
            {[
              'All secrets via .env (never committed)',
              'Input validation at Presentation layer',
              'Prompt sanitization (injection prevention)',
              'PII masking in logs (emails, names)',
              'Structured JSON logging + request IDs',
              'No external data — fully local inference',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-textMuted">
                <CheckCircle2 size={13} className="text-accentGreen shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold text-textMuted uppercase tracking-widest">🚫 Never Do</p>
            {[
              'No hardcoded classifications or KB mappings',
              'No fake streaming or static placeholder data',
              'No prompts embedded in Python source files',
              'No Ollama imports outside LLMClient',
              'No business logic inside FastAPI route handlers',
              'Temperature > 0 for Task 2 (determinism required)',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-textMuted">
                <XCircle size={13} className="text-accentRed shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Prompt Management ── */}
      <SectionCard icon={Code2} title="Prompt Management Standard" accent="#f59e0b">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-textMuted mb-3 leading-relaxed">
              Every prompt in <code className="bg-bgCardHover px-1 rounded text-accentCyan">prompts/</code> follows
              a strict YAML frontmatter standard for versioning and traceability. Prompts are
              <strong className="text-accentYellow"> NEVER</strong> embedded inside Python source files.
            </p>
            <div className="space-y-2">
              {['triage_v1.md', 'account_brief_v1.md', 'churn_detection_v1.md', 'llm_judge_v1.md'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-bgMain/40 border border-border">
                  <FileCode size={12} className="text-accentYellow" />
                  <code className="text-accentCyan">{f}</code>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-bgMain/60 border border-border overflow-hidden">
            <div className="px-4 py-2 bg-bgCard/60 border-b border-border text-xs text-textMuted font-mono">
              prompt header template
            </div>
            <pre className="p-4 text-xs text-accentCyan font-mono overflow-x-auto leading-relaxed">{`---
name: triage_v1
purpose: Classify ticket & generate triage
version: 1.0.0
inputs:
  - ticket_subject: string
  - ticket_body: string
  - retrieved_context: string
  - account_tier: string
expected_output: JSON → TriageResult
changelog:
  - 1.0.0: Initial version
---`}</pre>
          </div>
        </div>
      </SectionCard>

      {/* ── Data Schema ── */}
      <SectionCard icon={Database} title="Data Schema Reference" accent="#06b6d4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Collapsible title="📋 tickets.json — Field Reference" defaultOpen>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 text-left text-textMuted">Field</th>
                    <th className="py-2 pr-4 text-left text-textMuted">Type</th>
                    <th className="py-2 text-left text-textMuted">Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {[
                    { f: 'ticket_id',     t: 'string', v: 'TKT-XXXXX' },
                    { f: 'account_id',    t: 'string', v: 'ACC-XXXX' },
                    { f: 'category',      t: 'enum',   v: 'Bug, Performance, Billing, Integration, How-To, Onboarding, Feature Request, Data Loss' },
                    { f: 'urgency',       t: 'enum',   v: 'P1 (~5%), P2 (~20%), P3 (~45%), P4 (~30%)' },
                    { f: 'status',        t: 'enum',   v: 'Open, In Progress, Pending Customer, Resolved, Closed' },
                    { f: 'plan_tier',     t: 'enum',   v: 'Starter, Professional, Business, Enterprise' },
                    { f: 'channel',       t: 'enum',   v: 'email, portal, chat, phone' },
                    { f: 'satisfaction_score', t: 'int|null', v: '1–5 CSAT' },
                  ].map(row => (
                    <tr key={row.f}>
                      <td className="py-2 pr-4 font-mono text-accentCyan">{row.f}</td>
                      <td className="py-2 pr-4 text-purple-400">{row.t}</td>
                      <td className="py-2 text-textMuted">{row.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Collapsible>

          <Collapsible title="🏢 accounts.json — Field Reference" defaultOpen>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 text-left text-textMuted">Field</th>
                    <th className="py-2 pr-4 text-left text-textMuted">Type</th>
                    <th className="py-2 text-left text-textMuted">Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {[
                    { f: 'account_id',      t: 'string', v: 'ACC-XXXX' },
                    { f: 'arr_usd',         t: 'int',    v: 'Annual recurring revenue' },
                    { f: 'health_status',   t: 'enum',   v: 'Healthy, At Risk, Churning, New' },
                    { f: 'usage_trend',     t: 'enum',   v: 'Increasing, Stable, Declining, Inactive' },
                    { f: 'p1_tickets_last_30d', t: 'int', v: 'Critical ticket count' },
                    { f: 'escalation_notes', t: 'array', v: 'Churn signals (KEY for Task 2)' },
                    { f: 'nps_score',       t: 'int|null', v: '1–10 NPS' },
                    { f: 'renewal_date',    t: 'date',   v: 'YYYY-MM-DD' },
                  ].map(row => (
                    <tr key={row.f}>
                      <td className="py-2 pr-4 font-mono text-accentCyan">{row.f}</td>
                      <td className="py-2 pr-4 text-purple-400">{row.t}</td>
                      <td className="py-2 text-textMuted">{row.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Collapsible>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-accentYellow/5 border border-accentYellow/20 text-xs text-textMuted flex gap-2">
          <AlertTriangle size={13} className="text-accentYellow shrink-0 mt-0.5" />
          Not every account_id in tickets.json has a matching record in accounts.json — the platform handles
          this gracefully by returning a "Account not found" brief rather than crashing.
        </div>
      </SectionCard>

      {/* ── Build Phases ── */}
      <SectionCard icon={TrendingUp} title="Project Build Phases" accent="#10b981">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { phase: 'Phase 1', label: 'Foundation', time: '2h', items: ['Project structure', 'Data loader', 'FAISS index', 'LLM client', 'Domain entities'], color: '#3b82f6' },
            { phase: 'Phase 2', label: 'Core AI',    time: '3h', items: ['LangGraph state', 'Graph nodes', 'Task 1 triage', 'Task 2 brief', 'Streaming SSE'], color: '#a855f7' },
            { phase: 'Phase 3', label: 'Evaluation', time: '1h', items: ['Test fixtures', 'Metric framework', 'Eval runner', 'Report generator'], color: '#10b981' },
            { phase: 'Phase 4', label: 'Polish',     time: '1h', items: ['React UI', 'GitHub Actions CI', 'Prompt versioning', 'DESIGN_NOTE.md'], color: '#f59e0b' },
            { phase: 'Phase 5', label: 'Submission', time: '30m', items: ['Final test run', 'Loom recording', 'Push to GitHub'], color: '#06b6d4' },
          ].map(p => (
            <div key={p.phase}
                 className="rounded-xl border border-border bg-bgMain/40 overflow-hidden"
                 style={{ borderTopColor: p.color, borderTopWidth: 2 }}>
              <div className="px-3 py-3 border-b border-border">
                <p className="font-bold text-xs" style={{ color: p.color }}>{p.phase}</p>
                <p className="font-semibold text-sm text-textMain">{p.label}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={10} className="text-textMuted" />
                  <span className="text-[10px] text-textMuted">{p.time}</span>
                </div>
              </div>
              <div className="p-3 space-y-1">
                {p.items.map(item => (
                  <div key={item} className="flex items-center gap-1.5 text-[10px] text-textMuted">
                    <div className="w-1 h-1 rounded-full shrink-0" style={{ background: p.color }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Footer ── */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border border-border bg-bgCard/40">
          <Award size={20} className="text-accentYellow" />
          <div className="text-left">
            <p className="text-sm font-bold text-textMain">TAM AI Platform</p>
            <p className="text-xs text-textMuted">Built for the US Delivery Internship Technical Task Round</p>
          </div>
          <div className="flex gap-1 ml-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="text-accentYellow fill-accentYellow" />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
