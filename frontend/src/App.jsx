import { useState } from 'react';
import { Activity, TicketCheck } from 'lucide-react';
import TriageTab from './components/TriageTab';
import DashboardTab from './components/DashboardTab';

function App() {
  const [activeTab, setActiveTab] = useState('triage');

  return (
    <div className="flex h-screen overflow-hidden bg-bgMain text-textMain">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-bgCard/50 flex flex-col">
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
          <button
            onClick={() => setActiveTab('triage')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'triage' ? 'bg-accentBlue/10 text-accentBlue font-medium' : 'hover:bg-bgCardHover text-textMuted hover:text-textMain'}`}
          >
            <TicketCheck size={20} />
            Ticket Triage
          </button>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-accentBlue/10 text-accentBlue font-medium' : 'hover:bg-bgCardHover text-textMuted hover:text-textMain'}`}
          >
            <Activity size={20} />
            System Dashboard
          </button>
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
      <main className="flex-1 overflow-auto bg-gradient-to-br from-bgMain to-[#020617]">
        {activeTab === 'triage' && <TriageTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
      </main>
    </div>
  );
}

export default App;
