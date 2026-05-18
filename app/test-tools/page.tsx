"use client";

import { useState } from 'react';

export default function TestTools() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleResetQuota = async () => {
    setLoading(true);
    addLog("--- Sending single webhook to reset Provider 1's quota ---");
    
    const eventId = `evt_${Date.now()}`;
    
    try {
      const res = await fetch('/api/webhook/reset-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, providerId: 1 })
      });
      const data = await res.json();
      addLog(`Result: ${data.message || data.error}`);
    } catch (err) {
      addLog('Failed to trigger webhook.');
    }
    setLoading(false);
  };

  const handleIdempotencyTest = async () => {
    setLoading(true);
    addLog("--- Firing 3 identical webhooks simultaneously ---");
    
    const sharedEventId = `evt_idempotent_${Date.now()}`; 
    const payload = JSON.stringify({ eventId: sharedEventId, providerId: 2 }); 

    const fireWebhook = () => fetch('/api/webhook/reset-quota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    }).then(r => r.json());

    try {
      const results = await Promise.all([fireWebhook(), fireWebhook(), fireWebhook()]);
      
      results.forEach((res, index) => {
        addLog(`Call ${index + 1}: ${res.message || res.error}`);
      });
      addLog("✅ Notice how only the first succeeds, and the others say 'already processed'!");
    } catch (err) {
      addLog('Test failed.');
    }
    setLoading(false);
  };

  const handleConcurrencyTest = async () => {
    setLoading(true);
    addLog("--- Firing 10 leads simultaneously for Service 1 ---");

    const promises = Array.from({ length: 10 }).map((_, i) => {
      const randomPhone = `99900${Math.floor(1000 + Math.random() * 9000)}${i}`; 
      
      return fetch('/api/request-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Concurrent User ${i + 1}`,
          phone: randomPhone,
          city: 'Load Test City',
          serviceId: '1',
          description: 'Testing database locks'
        })
      }).then(r => r.json());
    });

    try {
      const results = await Promise.all(promises);
      const successes = results.filter(r => r.success).length;
      const errors = results.filter(r => r.error).length;
      
      addLog(`✅ Successfully created leads: ${successes}`);
      if (errors > 0) addLog(`❌ Errors: ${errors}`);
      addLog("Check the Dashboard! The leads should be perfectly distributed among the pool.");
    } catch (err) {
      addLog('Concurrency test failed.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 border-b pb-4 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Backend Testing Suite</h1>
        <p className="text-gray-500 mt-1">Tools to evaluate concurrency, idempotency, and database locks.</p>
      </div>
      
      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Action Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            disabled={loading} 
            onClick={handleResetQuota}
            className="flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 p-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            🔄 Reset Quotas (Webhook)
          </button>

          <button 
            disabled={loading} 
            onClick={handleIdempotencyTest}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold transition disabled:opacity-50 shadow-sm"
          >
            🛡️ Test Idempotency
          </button>

          <button 
            disabled={loading} 
            onClick={handleConcurrencyTest}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-semibold transition disabled:opacity-50 shadow-sm"
          >
            ⚡ Fire 10 Concurrent Leads
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-400 text-xs font-mono ml-2">server-terminal ~ bash</span>
        </div>
        <div className="p-4 h-96 overflow-y-auto font-mono text-sm text-green-400 leading-relaxed">
          {logs.length === 0 && <span className="text-gray-500">System idle. Waiting for test execution...</span>}
          {logs.map((log, i) => {
            let color = 'text-green-400';
            if (log.includes('❌') || log.includes('failed')) color = 'text-red-400';
            if (log.includes('---')) color = 'text-blue-400';
            if (log.includes('✅')) color = 'text-green-300 font-bold';

            return <div key={i} className={`mt-1 ${color}`}>{`> ${log}`}</div>;
          })}
        </div>
      </div>
    </div>
  );
}