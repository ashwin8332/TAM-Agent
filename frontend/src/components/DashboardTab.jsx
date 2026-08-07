import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Activity, Server, Clock, CheckCircle } from 'lucide-react';

// Simulated Data Generators based on FASA metrics reference
const generateTimeSeries = (count = 20) => {
  const now = new Date();
  return Array.from({ length: count }).map((_, i) => ({
    time: new Date(now.getTime() - (count - i) * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    requests: Math.floor(Math.random() * 50) + 10,
    errors: Math.floor(Math.random() * 5),
    latency: Math.floor(Math.random() * 200) + 50
  }));
};

const policyData = [
  { name: 'Confident (P1/P2)', value: 65, color: '#10b981' },
  { name: 'Hedge (P3)', value: 25, color: '#f59e0b' },
  { name: 'Re-Search (P4)', value: 8, color: '#ef4444' },
  { name: 'Error', value: 2, color: '#6366f1' }
];

export default function DashboardTab() {
  const [data, setData] = useState(generateTimeSeries());

  useEffect(() => {
    // Simulate real-time updates every 3 seconds
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1)];
        const last = next[next.length - 1];
        
        // Convert 'time' to an actual Date to manipulate it properly, then back to string.
        // For simulation, we'll just parse the current time instead.
        const now = new Date();
        next.push({
          time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
          requests: Math.floor(Math.random() * 50) + 10,
          errors: Math.floor(Math.random() * 5),
          latency: Math.floor(Math.random() * 200) + 50
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-accentCyan" />
            Service Overview (FASA)
          </h2>
          <p className="text-sm text-textMuted">Failure-Aware Search Agents - Live Metrics</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-bgCard px-3 py-1 rounded border border-border">
          <span className="w-2 h-2 rounded-full bg-accentGreen animate-pulse"></span>
          Refreshing every 3s
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Queries (10m)" value="1,248" trend="+12%" icon={<Activity size={18} />} color="text-accentBlue" />
        <StatCard title="Success Rate" value="98.4%" trend="-0.2%" icon={<CheckCircle size={18} />} color="text-accentGreen" />
        <StatCard title="Avg Latency p95" value="142ms" trend="-15ms" icon={<Clock size={18} />} color="text-accentYellow" />
        <StatCard title="System CPU %" value="34%" trend="+2%" icon={<Server size={18} />} color="text-textMain" />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        
        {/* Request Throughput */}
        <div className="col-span-2 bg-bgCard border border-border rounded-xl p-4 shadow-xl">
          <h3 className="text-sm font-bold mb-4 text-textMuted uppercase tracking-wider">Server Requests/s — Live</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorErr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReq)" name="Success" />
                <Area type="monotone" dataKey="errors" stroke="#ef4444" fillOpacity={1} fill="url(#colorErr)" name="Errors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Policy Distribution (Pie) */}
        <div className="col-span-1 bg-bgCard border border-border rounded-xl p-4 shadow-xl flex flex-col">
          <h3 className="text-sm font-bold mb-2 text-textMuted uppercase tracking-wider">Policy Distribution</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={policyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {policyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {policyData.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-textMuted">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Chart Row */}
      <div className="grid grid-cols-2 gap-6 pb-6">
        <div className="bg-bgCard border border-border rounded-xl p-4 shadow-xl">
          <h3 className="text-sm font-bold mb-4 text-textMuted uppercase tracking-wider">API Latency p50 / p95 (ms)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} dot={false} name="p95" />
                <Line type="monotone" dataKey={() => Math.random() * 50 + 20} stroke="#10b981" strokeWidth={2} dot={false} name="p50" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-bgCard border border-border rounded-xl p-4 shadow-xl">
           <h3 className="text-sm font-bold mb-4 text-textMuted uppercase tracking-wider">Host Memory Usage (GB)</h3>
           <div className="flex h-48 items-end gap-2 pb-4 pt-8">
              {/* Simulated Bar Gauge */}
              <div className="flex-1 bg-[#1e293b] rounded-t relative h-full flex items-end overflow-hidden group">
                <div className="w-full bg-accentCyan opacity-50 absolute bottom-0 transition-all duration-500" style={{height: '42%'}}></div>
                <span className="absolute bottom-2 left-2 text-xs font-bold z-10 group-hover:text-white">Used: 13.4 GB</span>
              </div>
              <div className="flex-1 bg-[#1e293b] rounded-t relative h-full flex items-end overflow-hidden group">
                <div className="w-full bg-accentGreen opacity-50 absolute bottom-0 transition-all duration-500" style={{height: '58%'}}></div>
                <span className="absolute bottom-2 left-2 text-xs font-bold z-10 group-hover:text-white">Free: 18.6 GB</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon, color }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-bgCard border border-border rounded-xl p-4 shadow-lg flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-textMuted">{title}</span>
        <span className={`${color} bg-bgMain p-1.5 rounded`}>{icon}</span>
      </div>
      <div className="text-2xl font-bold text-textMain mb-1">{value}</div>
      <div className={`text-xs ${isPositive ? 'text-accentGreen' : 'text-accentRed'}`}>
        {trend} vs last hour
      </div>
    </div>
  );
}
