import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

const EvaluationTab = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
    // Poll every 10 seconds in case it's still running
    const interval = setInterval(fetchReport, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchReport = async () => {
    try {
      const res = await fetch('/api/v1/evaluation/report');
      if (!res.ok) {
        throw new Error('Failed to fetch evaluation report');
      }
      const data = await res.json();
      setReport(data);
      if (data.status === 'Completed') {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading && !report) {
    return (
      <div className="h-full flex items-center justify-center text-textMuted">
        <Activity className="animate-spin mr-3" /> Loading Evaluation Report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-accentRed">
        <h2 className="text-xl font-bold mb-2">Error Loading Report</h2>
        <p>{error}</p>
      </div>
    );
  }

  const { summary, tasks, status } = report || {};

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accentCyan to-accentBlue mb-2">
            Evaluation Harness
          </h1>
          <p className="text-textMuted">Automated test suite results for LLM workflows</p>
        </div>
        <div className="text-sm">
          Status: <span className={status === 'Completed' ? 'text-accentGreen font-bold' : 'text-accentYellow font-bold animate-pulse'}>{status}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-bgCard/40 border border-border rounded-xl p-4 flex flex-col items-center">
          <div className="text-textMuted text-sm mb-1">Total Tests</div>
          <div className="text-3xl font-bold">{summary?.total || 0}</div>
        </div>
        <div className="bg-bgCard/40 border border-accentGreen/30 rounded-xl p-4 flex flex-col items-center">
          <div className="text-accentGreen text-sm mb-1 flex items-center gap-1"><CheckCircle size={14}/> Passed</div>
          <div className="text-3xl font-bold text-accentGreen">{summary?.passed || 0}</div>
        </div>
        <div className="bg-bgCard/40 border border-accentRed/30 rounded-xl p-4 flex flex-col items-center">
          <div className="text-accentRed text-sm mb-1 flex items-center gap-1"><XCircle size={14}/> Failed</div>
          <div className="text-3xl font-bold text-accentRed">{summary?.failed || 0}</div>
        </div>
        <div className="bg-bgCard/40 border border-accentBlue/30 rounded-xl p-4 flex flex-col items-center">
          <div className="text-accentBlue text-sm mb-1">Success Rate</div>
          <div className="text-3xl font-bold text-accentBlue">{((summary?.success_rate || 0) * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="space-y-8">
        {tasks && Object.entries(tasks).map(([taskName, taskResults]) => (
          <div key={taskName} className="bg-bgCard border border-border rounded-xl overflow-hidden">
            <div className="bg-bgCardHover p-4 border-b border-border">
              <h2 className="text-lg font-bold">{taskName}</h2>
            </div>
            <div className="divide-y divide-border">
              {taskResults.map((res) => (
                <div key={res.test_id} className="p-4 flex items-start gap-4 hover:bg-bgCardHover/50 transition-colors">
                  <div className="mt-1">
                    {res.passed ? (
                      <CheckCircle className="text-accentGreen" size={20} />
                    ) : (
                      <XCircle className="text-accentRed" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm px-2 py-0.5 rounded bg-bgMain border border-border text-textMuted">
                        {res.test_id}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${res.type === 'Adversarial' ? 'bg-accentRed/20 text-accentRed' : 'bg-accentBlue/20 text-accentBlue'}`}>
                        {res.type}
                      </span>
                      <span className="text-textMain font-medium">{res.description}</span>
                    </div>
                    
                    {!res.passed && (
                      <div className="mt-2 text-sm text-accentRed bg-accentRed/10 p-2 rounded border border-accentRed/20">
                        <strong>Failure Reason:</strong> {res.details}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-sm text-textMuted">
                    <div className="flex items-center gap-1">
                      <Clock size={14} /> {(res.processing_time_ms / 1000).toFixed(1)}s
                    </div>
                    <div>Score: {res.score.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationTab;
