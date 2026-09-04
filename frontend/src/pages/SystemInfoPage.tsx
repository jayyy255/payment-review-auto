import React from 'react';
import {
  Globe,
  Info,
  RefreshCw,
  Server,
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Badge } from '../components/common/Badge';
import { useApiHealth } from '../hooks/useApiHealth';

export const SystemInfoPage: React.FC = () => {
  const { status, versionInfo, lastChecked, checkNow } = useApiHealth();

  const endpoints = [
    { method: 'GET', path: '/health', desc: 'Service health check endpoint' },
    { method: 'GET', path: '/api/v1/version', desc: 'API and active risk engine version inspection' },
    { method: 'GET', path: '/api/v1/risk-rules', desc: 'Active rulebook, weights, and thresholds catalog' },
    { method: 'POST', path: '/api/v1/payments/analyze', desc: 'Main entrypoint: full risk evaluation and routing recommendation' },
    { method: 'POST', path: '/api/v1/payments/features', desc: 'Pure statistical and behavioral feature extraction' },
    { method: 'POST', path: '/api/v1/payments/score', desc: 'Risk scoring from calculated feature map' },
    { method: 'POST', path: '/api/v1/payments/recommendation', desc: 'Workflow recommendation and reviewer checklist mapping' },
    { method: 'POST', path: '/api/v1/payments/simulate', desc: 'Batch multi-scenario risk simulation and comparison' },
    { method: 'POST', path: '/api/v1/payments/validate', desc: 'Payload schema and integrity verification' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            System Architecture & Telemetry
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Active backend runtime metadata, available API surface, and enterprise integration points.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={checkNow}
        >
          <RefreshCw size={14} />
          <span>Re-check Connectivity</span>
        </button>
      </div>

      {/* System Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Backend Info Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Server size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Python Backend Service
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Service Name:</span>
              <strong style={{ color: '#0f172a' }}>{versionInfo?.service || 'payment-review-automation'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Service Version:</span>
              <code style={{ color: '#0f172a', fontWeight: 600 }}>{versionInfo?.version || '0.1.0'}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Risk Engine Model:</span>
              <Badge variant="info" size="sm">{versionInfo?.model_version || 'rule-based-v1'}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Environment:</span>
              <span style={{ textTransform: 'capitalize', color: '#334155' }}>{versionInfo?.environment || 'development'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Connection Status:</span>
              <Badge variant={status === 'connected' ? 'success' : 'danger'} size="sm">
                {status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Frontend Info Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Globe size={20} color="#059669" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Frontend Client
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Framework:</span>
              <strong style={{ color: '#0f172a' }}>React 18 + Vite + TypeScript</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Target API URL:</span>
              <code style={{ color: '#2563eb', fontWeight: 600 }}>{apiClient.getBaseUrl()}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Operating Mode:</span>
              <Badge variant="neutral" size="sm">Demo Mode (Synthetic Data)</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Last Heartbeat:</span>
              <span style={{ color: '#64748b' }}>
                {lastChecked ? lastChecked.toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* API Endpoints Catalog */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
            Available REST API Endpoints
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}>
                <th style={{ padding: '10px 16px', width: '90px' }}>Method</th>
                <th style={{ padding: '10px 16px', width: '280px' }}>Endpoint</th>
                <th style={{ padding: '10px 16px' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                        backgroundColor: ep.method === 'POST' ? '#eff6ff' : '#f1f5f9',
                        color: ep.method === 'POST' ? '#1d4ed8' : '#334155',
                      }}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#0f172a' }}>
                    {ep.path}
                  </td>
                  <td style={{ padding: '10px 16px', color: '#475569' }}>
                    {ep.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Points Note */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '18px 20px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <Info size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.8125rem', color: '#1e3a8a', lineHeight: 1.5 }}>
            <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>
              Enterprise Orchestration Ready
            </strong>
            The Python backend service provides stable REST contracts designed for seamless integration with <strong>Microsoft Power Automate Cloud Flows</strong> and <strong>Microsoft Dataverse</strong> case management. Workflow triggers and automated routing policies connect directly via standard HTTP actions.
          </div>
        </div>
      </div>
    </div>
  );
};
