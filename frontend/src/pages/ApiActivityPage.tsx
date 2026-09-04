import React, { useEffect, useState } from 'react';
import { Activity, Clock } from 'lucide-react';
import { getApiLogsHistory, subscribeApiLogs } from '../api/client';
import { JsonViewer } from '../components/common/JsonViewer';
import { ApiLogEntry } from '../types/ui';

export const ApiActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);

  useEffect(() => {
    setLogs(getApiLogsHistory());
    const unsubscribe = subscribeApiLogs((newEntry) => {
      setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Live API Activity & Inspector
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Real-time telemetry showing live REST calls dispatched between the frontend and the Python backend.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
            Logged Transactions: <strong>{logs.length}</strong>
          </span>
        </div>
      </div>

      {logs.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px dashed #cbd5e1',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Activity size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
            No API Activity Recorded Yet
          </h4>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Trigger a payment analysis, batch scenario run, or rule inspection to view live request and response telemetry.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '16px 20px',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      backgroundColor: log.method === 'POST' ? '#eff6ff' : '#f1f5f9',
                      color: log.method === 'POST' ? '#1d4ed8' : '#334155',
                      border: `1px solid ${log.method === 'POST' ? '#bfdbfe' : '#cbd5e1'}`,
                    }}
                  >
                    {log.method}
                  </span>
                  <code style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                    {log.endpoint}
                  </code>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {log.durationMs}ms
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontWeight: 600,
                      backgroundColor: log.status >= 200 && log.status < 300 ? '#ecfdf5' : '#fef2f2',
                      color: log.status >= 200 && log.status < 300 ? '#065f46' : '#991b1b',
                      border: `1px solid ${log.status >= 200 && log.status < 300 ? '#a7f3d0' : '#fecaca'}`,
                    }}
                  >
                    HTTP {log.status || 'ERR'}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Collapsible Payloads */}
              <div style={{ display: 'grid', gridTemplateColumns: log.requestBody ? '1fr 1fr' : '1fr', gap: '12px' }}>
                {log.requestBody && (
                  <JsonViewer data={log.requestBody} title="Request Body (Sent)" />
                )}
                <JsonViewer
                  data={log.responseBody || { error: log.error }}
                  title="Response Body (Received)"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
