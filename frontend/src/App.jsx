import { useState } from 'react';
import { Activity, TicketCheck, Building2, TestTube2, Info } from 'lucide-react';
import TriageTab from './components/TriageTab';
import DashboardTab from './components/DashboardTab';
import AccountBriefTab from './components/AccountBriefTab';
import EvaluationTab from './components/EvaluationTab';
import AboutTab from './components/AboutTab';

const NAV_ITEMS = [
  { key: 'triage', label: 'Ticket Triage', task: 'Task 1', icon: TicketCheck },
  { key: 'account', label: 'Account Briefs', task: 'Task 2', icon: Building2 },
  { key: 'evaluation', label: 'Evaluation Harness', task: 'Task 3', icon: TestTube2 },
  { key: 'dashboard', label: 'System Dashboard', task: 'Bonus', icon: Activity },
  { key: 'about', label: 'About & Blueprint', task: 'Docs', icon: Info },
];

function App() {
  const [activeTab, setActiveTab] = useState('triage');
  const current = NAV_ITEMS.find((item) => item.key === activeTab);

  return (
    <div className="flex h-screen overflow-hidden bg-bgMain text-textMain">
      {/* Sidebar Navigation */}
      <aside className="w-64 shrink-0 border-r border-border bg-bgCard/50 flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-accentBlue to-accentCyan flex items-center justify-center font-bold shadow-lg shadow-accentBlue/20">
            T
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">TAM AI Platform</h1>
            <p className="text-xs text-textMuted">Enterprise Support</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map(({ key, label, task, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === key ? 'bg-accentBlue/10 text-accentBlue font-medium' : 'hover:bg-bgCardHover text-textMuted hover:text-textMain'}`}
            >
              <span className="flex items-center gap-3">
                <Icon size={20} />
                {label}
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${activeTab === key ? 'border-accentBlue/40 text-accentBlue' : 'border-border text-textMuted'}`}>
                {task}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="px-4 py-2 bg-bgCard rounded border border-border text-xs flex justify-between items-center">
            <span className="text-textMuted">Status</span>
            <span className="text-accentGreen flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accentGreen shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Live
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="shrink-0 px-8 py-3 border-b border-border bg-bgCard/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-textMuted">
            <span className="font-semibold text-textMain">{current?.label}</span>
            <span className="text-border">·</span>
            <span>{current?.task}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gradient-to-br from-bgMain to-[#020617]">
          {activeTab === 'triage' && <TriageTab />}
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'account' && <AccountBriefTab />}
          {activeTab === 'evaluation' && <EvaluationTab />}
          {activeTab === 'about' && <AboutTab />}
        </main>
      </div>
    </div>
  );
}

export default App;
