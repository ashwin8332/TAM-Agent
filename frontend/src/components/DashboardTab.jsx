import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Activity, Server, CheckCircle2, Cpu, Database,
  HardDrive, Terminal, RefreshCw, Sliders, AlertCircle, Monitor
} from 'lucide-react';

export default function DashboardTab() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Index rebuilding state
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildStatus, setRebuildStatus] = useState(null);

  // Fetch metrics function
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/v1/system/metrics');
      if (!response.ok) throw new Error("Backend offline");
      const data = await response.json();
      setMetrics(data);
      setError(null);
      
      // Update time-series history for the charts
      setHistory(prev => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newTick = {
          time: timeStr,
          cpu: data.cpu.usage_percent,
          memory: data.memory.usage_percent,
          latency: Math.floor(Math.random() * 80) + 120, // baseline simulated latency
        };
        const updated = [...prev, newTick];
        if (updated.length > 20) {
          return updated.slice(1);
        }
        return updated;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMetrics();
    
    // Poll every 3 seconds
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle FAISS Index Rebuilding
  const handleRebuildIndex = async () => {
    setRebuilding(true);
    setRebuildStatus({ type: 'info', message: 'Rebuilding index from markdown files...' });
    try {
      const response = await fetch('/api/v1/index/rebuild', {
        method: 'POST'
      });
      if (!response.ok) throw new Error("Failed to rebuild index");
      const result = await response.json();
      setRebuildStatus({ type: 'success', message: result.message });
      // Re-fetch metrics to get updated stats
      fetchMetrics();
    } catch (err) {
      setRebuildStatus({ type: 'error', message: err.message });
    } finally {
      setRebuilding(false);
      // Clear status after 5 seconds
      setTimeout(() => setRebuildStatus(null), 5000);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-textMuted bg-bgMain">
        <RefreshCw className="animate-spin text-accentBlue" size={32} />
        <p className="text-sm font-semibold tracking-wider uppercase">Loading Live PC Dashboard...</p>
      </div>
    );
  }

  const activeCpu = metrics?.cpu?.usage_percent ?? 0;
  const activeMemory = metrics?.memory?.usage_percent ?? 0;
  const activeDisk = metrics?.disk?.usage_percent ?? 0;

  return (
    <div className="p-8 h-full overflow-y-auto bg-gradient-to-b from-bgMain to-[#080d1a]">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
            <Monitor className="text-accentCyan" />
            System Cockpit & Live Metrics
          </h2>
          <p className="text-sm text-textMuted">Failure-Aware Search Agents (FASA) · Local Hardware Monitor</p>
        </div>
        
        <div className="flex items-center gap-4">
          {error && (
            <div className="flex items-center gap-2 text-xs bg-accentRed/10 border border-accentRed/30 text-accentRed px-3 py-1.5 rounded-lg">
              <AlertCircle size={14} />
              <span>Backend disconnected. Reconnecting...</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs bg-bgCard px-3 py-1.5 rounded-lg border border-border">
            <span className={`w-2.5 h-2.5 rounded-full ${error ? 'bg-accentRed animate-pulse' : 'bg-accentGreen animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></span>
            <span>{error ? 'Offline' : 'Connected'}</span>
          </div>
        </div>
      </div>

      {/* Hardware Performance Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="CPU Core Load" 
          value={`${activeCpu.toFixed(1)}%`} 
          subText={`${metrics?.cpu?.physical_cores} Cores / ${metrics?.cpu?.logical_cores} Threads`}
          icon={<Cpu size={18} />} 
          color="text-accentBlue animate-pulse" 
          percentage={activeCpu}
        />
        <StatCard 
          title="RAM Usage" 
          value={`${activeMemory.toFixed(1)}%`} 
          subText={`${metrics?.memory?.used_gb} GB / ${metrics?.memory?.total_gb} GB`}
          icon={<Server size={18} />} 
          color="text-accentGreen" 
          percentage={activeMemory}
        />
        <StatCard 
          title="Storage space (C:)" 
          value={`${activeDisk.toFixed(1)}%`} 
          subText={`${metrics?.disk?.free_gb} GB Free`}
          icon={<HardDrive size={18} />} 
          color="text-accentYellow" 
          percentage={activeDisk}
        />
        <StatCard 
          title="FAISS Index Status" 
          value={metrics?.faiss?.ready ? "Ready" : "Not Loaded"} 
          subText={`${metrics?.faiss?.vector_count || 0} Context Chunks`}
          icon={<Database size={18} />} 
          color="text-accentCyan" 
          percentage={metrics?.faiss?.ready ? 100 : 0}
        />
      </div>

      {/* Charts and Active AI Environment Row */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        
        {/* Live Resource Utilization Chart */}
        <div className="col-span-2 bg-bgCard/40 backdrop-blur-md border border-border rounded-xl p-5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-accentBlue" />
              Live Resource Utilization Chart
            </h3>
            <span className="text-xs text-textMuted">History window: 1 min</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#475569" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="CPU Load" />
                <Area type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" name="RAM Usage" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ollama LLM Environment Panel */}
        <div className="col-span-1 bg-bgCard/40 backdrop-blur-md border border-border rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold mb-4 text-textMain uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} className="text-accentYellow" />
              Ollama AI Engine
            </h3>
            
            <div className="space-y-4">
              <div className="bg-bgMain/60 p-3 rounded-lg border border-border flex justify-between items-center">
                <span className="text-xs text-textMuted">Ollama Endpoint</span>
                <span className="text-xs font-mono text-textMain">{metrics?.ollama?.url}</span>
              </div>

              <div className="bg-bgMain/60 p-3 rounded-lg border border-border flex justify-between items-center">
                <span className="text-xs text-textMuted">Active LLM Model</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-accentBlue/20 text-accentBlue rounded border border-accentBlue/30">
                  {metrics?.ollama?.current_model}
                </span>
              </div>

              <div className="bg-bgMain/60 p-3 rounded-lg border border-border flex justify-between items-center">
                <span className="text-xs text-textMuted">Embedding Model</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-accentCyan/20 text-accentCyan rounded border border-accentCyan/30">
                  {metrics?.ollama?.embedding_model}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-textMuted block mb-2">Pulled Models in PC Memory</span>
                <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
                  {metrics?.ollama?.pulled_models?.length > 0 ? (
                    metrics.ollama.pulled_models.map((model) => (
                      <span key={model} className="text-[10px] bg-bgCardHover border border-border text-textMain px-2 py-1 rounded">
                        {model}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-textMuted italic">No pulled models detected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* System Details & FAISS Database Panel Row */}
      <div className="grid grid-cols-2 gap-6 pb-6">
        
        {/* Host PC Details */}
        <div className="bg-bgCard/40 backdrop-blur-md border border-border rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-bold mb-4 text-textMain uppercase tracking-wider flex items-center gap-2">
            <Terminal size={16} className="text-accentGreen" />
            Host Specifications
          </h3>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between border-b border-border/50 py-1.5">
              <span className="text-textMuted">Operating System</span>
              <span className="text-textMain font-semibold">{metrics?.os?.system} ({metrics?.os?.release})</span>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1.5">
              <span className="text-textMuted">Architecture</span>
              <span className="text-textMain font-semibold">{metrics?.os?.machine}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1.5">
              <span className="text-textMuted">Processor Spec</span>
              <span className="text-textMain max-w-[250px] truncate text-right font-semibold" title={metrics?.os?.processor}>
                {metrics?.os?.processor || "N/A"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1.5">
              <span className="text-textMuted">Python Version</span>
              <span className="text-textMain font-semibold">{metrics?.os?.python_version}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1.5">
              <span className="text-textMuted">Server Process PID</span>
              <span className="text-textMain font-semibold">{metrics?.process?.pid}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1.5">
              <span className="text-textMuted">Process Threads</span>
              <span className="text-textMain font-semibold">{metrics?.process?.threads_count} active</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-textMuted">RAM Allocated RSS</span>
              <span className="text-textMain font-semibold">{metrics?.process?.memory_rss_mb} MB</span>
            </div>
          </div>
        </div>

        {/* FAISS Vector DB Management */}
        <div className="bg-bgCard/40 backdrop-blur-md border border-border rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold mb-4 text-textMain uppercase tracking-wider flex items-center gap-2">
              <Database size={16} className="text-accentCyan" />
              FAISS Index Controller
            </h3>
            
            <div className="space-y-2 font-mono text-xs mb-4">
              <div className="flex justify-between border-b border-border/50 py-1.5">
                <span className="text-textMuted">Index Target Directory</span>
                <span className="text-textMain font-semibold">{metrics?.faiss?.index_path}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 py-1.5">
                <span className="text-textMuted">Total Knowledge Chunks</span>
                <span className="text-textMain font-semibold">{metrics?.faiss?.vector_count} nodes</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-textMuted">Status</span>
                <span className={`font-semibold flex items-center gap-1.5 ${metrics?.faiss?.ready ? 'text-accentGreen' : 'text-accentRed'}`}>
                  <span className={`w-2 h-2 rounded-full ${metrics?.faiss?.ready ? 'bg-accentGreen shadow-[0_0_6px_#10b981]' : 'bg-accentRed shadow-[0_0_6px_#ef4444]'}`}></span>
                  {metrics?.faiss?.ready ? 'Online (Indexed)' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {rebuildStatus && (
              <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                rebuildStatus.type === 'error' ? 'bg-accentRed/10 border-accentRed/30 text-accentRed' :
                rebuildStatus.type === 'success' ? 'bg-accentGreen/10 border-accentGreen/30 text-accentGreen' :
                'bg-accentBlue/10 border-accentBlue/30 text-accentBlue'
              }`}>
                {rebuildStatus.type === 'error' ? <AlertCircle size={14} /> : 
                 rebuildStatus.type === 'success' ? <CheckCircle2 size={14} /> :
                 <RefreshCw className="animate-spin" size={14} />}
                <span>{rebuildStatus.message}</span>
              </div>
            )}
            
            <button
              onClick={handleRebuildIndex}
              disabled={rebuilding}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                rebuilding 
                  ? 'bg-bgCardHover text-textMuted border-border cursor-not-allowed'
                  : 'bg-accentCyan/15 text-accentCyan hover:bg-accentCyan/25 border-accentCyan/30 active:scale-[0.98]'
              }`}
            >
              <RefreshCw className={rebuilding ? "animate-spin" : ""} size={14} />
              {rebuilding ? 'Rebuilding Index...' : 'Force Rebuild Vector Index'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, subText, icon, color, percentage }) {
  return (
    <div className="bg-bgCard/40 backdrop-blur-md border border-border rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-border/80 transition-all">
      {/* Background Subtle Progress Overlay */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-accentBlue to-accentCyan transition-all duration-1000"
        style={{ width: `${percentage}%` }}
      ></div>

      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">{title}</span>
        <span className={`${color} bg-bgMain/60 p-2 rounded-lg border border-border`}>{icon}</span>
      </div>
      
      <div className="mt-2">
        <div className="text-2xl font-bold text-textMain tracking-tight mb-0.5">{value}</div>
        <div className="text-[10px] text-textMuted font-medium font-mono">{subText}</div>
      </div>
    </div>
  );
}
