import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../api/client';
import { Badge } from '../components/common/Badge';
import { RiskRuleItem } from '../types/api';

export const RiskRulesPage: React.FC = () => {
  const [rules, setRules] = useState<RiskRuleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getRiskRules();
      setRules(res.rules || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch risk rules from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Risk Rulebook & Model Parameters
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Transparent rule catalog, feature weights, and evaluation thresholds active in the Python risk engine.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={fetchRules}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing Rules...' : 'Refresh Catalog'}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#991b1b',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Rules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {rules.map((rule) => (
          <div
            key={rule.code}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                    {rule.name}
                  </h3>
                  <code style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 700 }}>
                    {rule.code}
                  </code>
                </div>
                <Badge variant={rule.enabled ? 'success' : 'neutral'} size="sm">
                  {rule.enabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '14px', lineHeight: 1.45 }}>
                {rule.description}
              </p>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  marginBottom: '12px',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Category:</span>
                  <strong style={{ color: '#0f172a' }}>{rule.category}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Configured Weight:</span>
                  <strong style={{ color: '#2563eb', fontFamily: 'JetBrains Mono, monospace' }}>
                    {rule.weight.toFixed(2)} ({(rule.weight * 100).toFixed(0)}%)
                  </strong>
                </div>
              </div>

              {/* Thresholds Table */}
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Evaluation Thresholds:
                </span>
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Object.entries(rule.thresholds || {}).map(([level, condition]) => (
                    <div
                      key={level}
                      style={{
                        fontSize: '0.6875rem',
                        fontFamily: 'JetBrains Mono, monospace',
                        padding: '4px 8px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ color: '#475569', fontWeight: 600 }}>{level.toUpperCase()}:</span>
                      <span style={{ color: '#0f172a' }}>{String(condition)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
