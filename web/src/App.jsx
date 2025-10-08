import React, { useEffect, useState } from 'react';

// If you change the server port, update this:
const API_BASE = 'http://localhost:3001';

export default function App() {
  const [agents, setAgents] = useState([]);
  const [agent, setAgent] = useState('qna');
  const [question, setQuestion] = useState('What did we ingest?');
  const [proposalPrompt, setProposalPrompt] = useState('Write a cover letter for our RFP response.');
  const [result, setResult] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setError('');
        const r = await fetch(`${API_BASE}/api/agents`);
        if (!r.ok) throw new Error(`API /api/agents ${r.status}`);
        const d = await r.json();
        setAgents(d.agents || []);
      } catch (e) {
        setError(`Cannot reach backend at ${API_BASE}. Is the server running? (${e.message})`);
        setAgents([]);
      }
    })();
  }, []);

  const runAgent = async () => {
    try {
      setResult(null);
      let payload = {};
      if (agent === 'qna') payload = { question };
      if (agent === 'proposal') payload = { prompt: proposalPrompt };
      const resp = await fetch(`${API_BASE}/api/agent/${agent}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      setResult(data);
    } catch (e) {
      setError(`Run failed: ${e.message}`);
    }
  };

  const uploadCsv = async () => {
    try {
      if (!csvFile) return alert('Choose a CSV');
      const form = new FormData();
      form.append('file', csvFile);
      const resp = await fetch(`${API_BASE}/api/ingest/csv`, { method: 'POST', body: form });
      const data = await resp.json();
      setResult(data);
    } catch (e) {
      setError(`Upload failed: ${e.message}`);
    }
  };

  const syncERP = async () => {
    try {
      setSyncing(true);
      const resp = await fetch(`${API_BASE}/api/connectors/sync`);
      const data = await resp.json();
      setResult(data);
    } catch (e) {
      setError(`Sync failed: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', margin: 20 }}>
      <h1>Custom AI Agent (Alpha)</h1>
      <p style={{ opacity: 0.8 }}>Backend at {API_BASE}</p>
      {error && <div style={{ background:'#ffe9e9', border:'1px solid #f99', padding:10, marginBottom:16 }}>{error}</div>}

      <section style={{ marginBottom: 24 }}>
        <h2>1) Ingest CSV</h2>
        <input type="file" accept=".csv" onChange={(e)=>setCsvFile(e.target.files[0])} />
        <button onClick={uploadCsv} style={{ marginLeft: 12 }}>Upload</button>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>2) ERP/CRM Sync (Generic REST)</h2>
        <button onClick={syncERP} disabled={syncing}>{syncing ? 'Syncing...' : 'Sync Now'}</button>
        <p style={{ fontSize: 12, opacity: 0.8 }}>Configure in <code>server/.env</code> (ERP_BASE_URL, ERP_API_KEY)</p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>3) Run an Agent</h2>
        <label>Agent:&nbsp;</label>
        <select value={agent} onChange={e=>setAgent(e.target.value)}>
          {agents.length === 0
            ? <option value="qna">No agents loaded — check backend</option>
            : agents.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        {agent === 'qna' && (
          <div style={{ marginTop: 12 }}>
            <textarea rows={4} style={{ width: '100%' }} value={question} onChange={e=>setQuestion(e.target.value)} />
          </div>
        )}
        {agent === 'proposal' && (
          <div style={{ marginTop: 12 }}>
            <textarea rows={4} style={{ width: '100%' }} value={proposalPrompt} onChange={e=>setProposalPrompt(e.target.value)} />
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button onClick={runAgent}>Run</button>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Result</h2>
        <pre style={{ background: '#f6f6f6', padding: 12, overflow: 'auto' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </section>
    </div>
  );
}
