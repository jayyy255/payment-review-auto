import React from 'react';
import { RefreshCw, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { useApiHealth } from '../../hooks/useApiHealth';

export const Header: React.FC = () => {
  const { status, versionInfo, checkNow } = useApiHealth();

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Brand Title & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', margin: 0 }}>
            Payment Review Intelligence Platform
          </h1>
          <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>
            Enterprise Decision-Support & Workflow Routing
          </span>
        </div>
      </div>

      {/* Right Controls: Demo Badge & Backend Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Demo Mode Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#334155',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
            }}
          />
          Demo Mode (Synthetic Data)
        </div>

        {/* Backend Connection Indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: status === 'connected' ? '#ecfdf5' : status === 'checking' ? '#fffbeb' : '#fef2f2',
            border: `1px solid ${status === 'connected' ? '#a7f3d0' : status === 'checking' ? '#fde68a' : '#fecaca'}`,
            borderRadius: '9999px',
            fontSize: '0.75rem',
            color: status === 'connected' ? '#065f46' : status === 'checking' ? '#92400e' : '#991b1b',
            fontWeight: 500,
          }}
        >
          {status === 'connected' ? (
            <>
              <Wifi size={13} color="#059669" />
              <span>Backend Connected ({versionInfo?.version || 'v0.1.0'})</span>
            </>
          ) : status === 'checking' ? (
            <>
              <RefreshCw size={12} className="animate-spin" color="#d97706" />
              <span>Connecting to API...</span>
            </>
          ) : (
            <>
              <WifiOff size={13} color="#dc2626" />
              <span>Backend Offline</span>
              <button
                type="button"
                onClick={checkNow}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#dc2626',
                  textDecoration: 'underline',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
