import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  title?: string;
  defaultExpanded?: boolean;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, title = 'JSON Payload', defaultExpanded = false }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const formatted = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        fontSize: '0.8125rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
          borderBottom: expanded ? '1px solid #e2e8f0' : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{expanded ? '▼' : '▶'}</span>
          {title}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: '4px 8px',
              fontSize: '0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              color: copied ? '#059669' : '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {expanded && (
        <pre
          style={{
            padding: '12px',
            margin: 0,
            overflowX: 'auto',
            maxHeight: '320px',
            backgroundColor: '#0f172a',
            color: '#e2e8f0',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.75rem',
            lineHeight: 1.45,
          }}
        >
          {formatted}
        </pre>
      )}
    </div>
  );
};
