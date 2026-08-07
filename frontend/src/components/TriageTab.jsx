import { useState } from 'react';
import { Bot, FastForward, CheckCircle2 } from 'lucide-react';

const PRESETS = {
  databridge: {
    subject: "DataBridge pipeline stopped - ERR_CONNECTION_TIMEOUT",
    account_id: "ACC-3847",
    plan_tier: "Enterprise",
    body: "Hi team,\n\nOur DataBridge Pro Connectors pipeline has been failing since this morning. Error: ERR_CONNECTION_TIMEOUT after 30s. This is impacting 47 users in Engineering. We have tried restarting but the issue persists.\n\nEnvironment: Production\nVersion: 3.1.2"
  },
  sso: {
    subject: "SAML Assertion Expired - Users locked out of SecureVault",
    account_id: "ACC-9912",
    plan_tier: "Enterprise",
    body: "CRITICAL: None of our administrators can log into SecureVault. Error message: SAML_ASSERTION_EXPIRED. SSO authentication is failing across our entire cluster. Immediate escalation required."
  },
  cloudsync: {
    subject: "CloudSync file conflict resolution question",
    account_id: "ACC-1044",
    plan_tier: "Business",
    body: "Hello,\n\nWhen two users edit the same document in CloudSync offline, how does conflict resolution work? A user lost changes yesterday when another user synced their version later."
  },
  billing: {
    subject: "Question about extra seat charges on monthly invoice",
    account_id: "ACC-5021",
    plan_tier: "Starter",
    body: "Hi Support,\n\nWe were billed for 50 active seats this month, but our admin portal only shows 32 assigned users. Can someone explain how active seat count is calculated?"
  }
};

export default function TriageTab() {
  const [formData, setFormData] = useState({
    subject: '',
    account_id: '',
    plan_tier: 'Enterprise',
    body: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePreset = (key) => {
    setFormData(PRESETS[key]);
  };

  const handleTriage = async () => {
    if (!formData.body) {
      alert("Please enter a ticket body or select a preset.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // In production, this would call the actual FastAPI endpoint
      const response = await fetch('/api/v1/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error("HTTP error " + response.status);
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (tier) => {
    switch(tier?.toLowerCase()) {
      case 'p1': return 'bg-accentRed/20 text-accentRed border border-accentRed/30';
      case 'p2': return 'bg-accentYellow/20 text-accentYellow border border-accentYellow/30';
      case 'p3': return 'bg-accentBlue/20 text-accentBlue border border-accentBlue/30';
      default: return 'bg-bgCard text-textMuted border border-border';
    }
  };

  return (
    <div className="p-8 h-full flex gap-6 overflow-hidden">
      {/* Left Panel: Form */}
      <div className="w-1/2 flex flex-col gap-6 bg-bgCard rounded-xl p-6 border border-border shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TicketCheck className="text-accentBlue" />
            New Ticket Intake
          </h2>
        </div>

        <div className="bg-bgMain p-4 rounded-lg border border-border">
          <p className="text-sm text-textMuted font-bold mb-3 uppercase tracking-wider">Quick Demo Presets</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handlePreset('databridge')} className="text-xs bg-bgCard hover:bg-bgCardHover border border-border px-3 py-1.5 rounded transition-colors">DataBridge Timeout (P2)</button>
            <button onClick={() => handlePreset('sso')} className="text-xs bg-bgCard hover:bg-bgCardHover border border-border px-3 py-1.5 rounded transition-colors">SecureVault SAML (P1)</button>
            <button onClick={() => handlePreset('cloudsync')} className="text-xs bg-bgCard hover:bg-bgCardHover border border-border px-3 py-1.5 rounded transition-colors">CloudSync Conflicts (P3)</button>
            <button onClick={() => handlePreset('billing')} className="text-xs bg-bgCard hover:bg-bgCardHover border border-border px-3 py-1.5 rounded transition-colors">Billing Question (P4)</button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input type="text" className="w-full bg-bgMain border border-border rounded p-2 outline-none focus:border-accentBlue transition-colors" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="e.g. Pipeline failure" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account ID</label>
              <input type="text" className="w-full bg-bgMain border border-border rounded p-2 outline-none focus:border-accentBlue transition-colors" value={formData.account_id} onChange={e => setFormData({...formData, account_id: e.target.value})} placeholder="ACC-1234" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plan Tier</label>
              <select className="w-full bg-bgMain border border-border rounded p-2 outline-none focus:border-accentBlue transition-colors" value={formData.plan_tier} onChange={e => setFormData({...formData, plan_tier: e.target.value})}>
                <option value="Enterprise">Enterprise (2h SLA)</option>
                <option value="Business">Business (8h SLA)</option>
                <option value="Professional">Professional (24h SLA)</option>
                <option value="Starter">Starter (48h SLA)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ticket Body</label>
            <textarea className="w-full h-32 bg-bgMain border border-border rounded p-2 outline-none focus:border-accentBlue transition-colors resize-none" value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} placeholder="Paste full ticket body text here..."></textarea>
          </div>

          <button onClick={handleTriage} disabled={loading} className="w-full bg-accentBlue hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            {loading ? <div className="loader"></div> : <Bot size={20} />}
            {loading ? 'Processing via LangGraph...' : 'Run Intelligent Triage'}
          </button>
        </div>
      </div>

      {/* Right Panel: Results */}
      <div className="w-1/2 flex flex-col bg-bgCard rounded-xl p-6 border border-border shadow-2xl overflow-y-auto">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <FastForward className="text-accentCyan" />
          Triage & Routing Analysis
        </h2>

        {!result && !error && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-textMuted text-center p-8 border-2 border-dashed border-border rounded-xl">
            <CheckCircle2 size={48} className="mb-4 opacity-50" />
            <p>Fill out the ticket form or pick a preset on the left, then click <strong>Run Intelligent Triage</strong> to execute the LangGraph pipeline.</p>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-textMuted">
              <div className="w-12 h-12 border-4 border-bgMain border-t-accentBlue rounded-full animate-spin"></div>
              <p>Analyzing intent, searching FAISS, and formatting response...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-accentRed/20 text-accentRed p-4 rounded-lg border border-accentRed/30">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full font-bold text-sm ${getUrgencyColor(result.urgency_tier)}`}>
                {result.urgency_tier} Urgency
              </span>
              <span className="text-sm text-textMuted">Confidence: <strong className="text-textMain">{(result.confidence * 100).toFixed(0)}%</strong></span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bgMain p-4 rounded border border-border">
                <div className="text-xs text-textMuted uppercase">Detected Product</div>
                <div className="font-medium mt-1">{result.product}</div>
              </div>
              <div className="bg-bgMain p-4 rounded border border-border">
                <div className="text-xs text-textMuted uppercase">Product Area</div>
                <div className="font-medium mt-1">{result.product_area}</div>
              </div>
              <div className="bg-bgMain p-4 rounded border border-border">
                <div className="text-xs text-textMuted uppercase">Issue Category</div>
                <div className="font-medium mt-1">{result.issue_category}</div>
              </div>
              <div className="bg-bgMain p-4 rounded border border-accentCyan/30">
                <div className="text-xs text-accentCyan uppercase">Routing Team</div>
                <div className="font-bold text-accentCyan mt-1">{result.recommended_team}</div>
              </div>
            </div>

            {result.kb_match && (
              <div>
                <label className="block text-sm font-medium mb-2 text-textMuted">Knowledge Base RAG Match</label>
                <div className="bg-accentGreen/10 border border-accentGreen/20 p-4 rounded-lg">
                  <div className="font-bold text-accentGreen flex items-center gap-2">
                    <CheckCircle2 size={16} /> {result.kb_match.doc_title}
                  </div>
                  <div className="text-xs text-textMuted mt-1">Doc ID: {result.kb_match.doc_id} | Score: {(result.kb_match.relevance_score * 100).toFixed(1)}%</div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-textMuted">Urgency Reasoning</label>
              <div className="bg-bgMain p-4 rounded-lg border border-border text-sm italic">
                "{result.urgency_reasoning}"
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-textMuted">Draft First Response (v{result.prompt_version})</label>
                <button onClick={() => navigator.clipboard.writeText(result.draft_first_response)} className="text-xs bg-bgMain hover:bg-bgCardHover px-2 py-1 rounded border border-border transition-colors">Copy</button>
              </div>
              <div className="bg-bgMain p-4 rounded-lg border border-border text-sm whitespace-pre-wrap">
                {result.draft_first_response}
              </div>
            </div>
            
            <div className="text-xs text-right text-textMuted">
              Latency: {result.processing_time_ms} ms
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple icon wrapper
function TicketCheck({ className }) {
  return <svg className={className} width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m9 14 2 2 4-4"/></svg>;
}
