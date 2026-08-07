import { useState } from 'react';
import { Building2, AlertTriangle, MessageSquare, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AccountBriefTab() {
  const [accountId, setAccountId] = useState('ACC-3336');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!accountId) {
      alert("Please enter an Account ID.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`/api/v1/account/${accountId}/brief`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch account brief");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Account Health Brief
          </h2>
          <p className="text-sm text-textMuted mt-1">Generate TAM briefing materials using multi-document summarisation.</p>
        </div>
      </div>

      <div className="flex gap-6 h-full min-h-0">
        
        {/* Left Column: Input */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="bg-bgCard border border-border rounded-xl p-5 shadow-xl shadow-black/20 flex-1">
            <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-4 border-b border-border pb-2">Target Account</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Account ID</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-[#0b1021] border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue transition-colors font-mono"
                    placeholder="e.g. ACC-3336"
                  />
                  <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-accentBlue hover:bg-accentBlue/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <Building2 size={16} />
                    )}
                    Generate
                  </button>
                </div>
              </div>
              
              <div className="bg-accentBlue/5 border border-accentBlue/20 rounded-lg p-3 text-xs text-accentBlue leading-relaxed mt-6">
                <strong>How it works:</strong> The AI extracts the account profile and recent support tickets, detects churn signals, and chains prompts to generate a deterministic 3-section QBR prep brief.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="w-2/3 bg-[#0a0f1c] border border-border rounded-xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-4 border-b border-border/50 pb-2 flex justify-between items-center relative z-10">
            <span>Generated Brief</span>
            {result && (
              <span className="text-[10px] bg-[#1a2333] px-2 py-1 rounded text-gray-400 font-mono">
                {result.processing_time_ms ? (result.processing_time_ms / 1000).toFixed(2) + 's' : ''}
              </span>
            )}
          </h3>

          <div className="flex-1 overflow-auto relative z-10 pr-2 custom-scrollbar">
            {!loading && !result && !error && (
              <div className="h-full flex flex-col items-center justify-center text-textMuted opacity-50">
                <Building2 size={48} className="mb-4 text-gray-600" />
                <p>Enter an Account ID to generate a brief.</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-bgCard"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-accentBlue border-t-transparent animate-spin"></div>
                </div>
                <div className="text-accentBlue animate-pulse font-medium">Analyzing account history and tickets...</div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-start gap-3">
                <ShieldAlert className="shrink-0 mt-0.5" size={18} />
                <div className="text-sm font-medium">{error}</div>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header info */}
                <div className="flex items-center gap-3 border-b border-border/30 pb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Building2 size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-100">{result.account_id}</h4>
                    <p className="text-xs text-gray-400">Account Health Briefing</p>
                  </div>
                </div>

                {/* Churn Flags */}
                {result.churn_risk_flags && result.churn_risk_flags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.churn_risk_flags.map((flag, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-full text-xs font-medium">
                        <AlertTriangle size={12} />
                        {flag}
                      </div>
                    ))}
                  </div>
                )}
                {result.churn_risk_flags && result.churn_risk_flags.length === 0 && (
                  <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-full text-xs font-medium w-fit">
                    <CheckCircle2 size={12} />
                    Healthy - No Churn Signals Detected
                  </div>
                )}

                {/* Section 1: Executive Summary */}
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-accentBlue">
                    <CheckCircle2 size={16} />
                    1. Executive Summary
                  </h4>
                  <div className="bg-[#111727] border border-border/50 rounded-lg p-4 text-sm text-gray-300 leading-relaxed shadow-inner">
                    {result.executive_summary}
                  </div>
                </div>

                {/* Section 2: Risks & Issues */}
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-orange-400">
                    <AlertTriangle size={16} />
                    2. Open Risks & Flagged Issues
                  </h4>
                  <div className="bg-[#111727] border border-border/50 rounded-lg p-4 text-sm text-gray-300 leading-relaxed shadow-inner whitespace-pre-wrap">
                    {result.risks_and_issues}
                  </div>
                </div>

                {/* Section 3: Talking Points */}
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-accentCyan">
                    <MessageSquare size={16} />
                    3. Recommended Talking Points
                  </h4>
                  <div className="bg-[#111727] border border-border/50 rounded-lg p-4 text-sm text-gray-300 leading-relaxed shadow-inner whitespace-pre-wrap">
                    {result.talking_points}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
