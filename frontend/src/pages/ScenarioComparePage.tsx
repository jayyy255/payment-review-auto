import React, { useEffect, useState } from 'react';
import { AlertCircle, Play } from 'lucide-react';
import { apiClient } from '../api/client';
import { RecommendationBadge, RiskBadge } from '../components/common/Badge';
import { RiskScoreBar } from '../components/common/RiskScoreBar';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import { SimulationResponse } from '../types/api';

export const ScenarioComparePage: React.FC = () => {
  const [simulationData, setSimulationData] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        scenarios: SAMPLE_SCENARIOS.map((s) => ({
          scenario_name: s.title,
          payment: s.payload,
        })),
      };
      const res = await apiClient.simulateScenarios(payload);
      setSimulationData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to run batch scenario simulation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Batch Scenario Comparison
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Multi-scenario side-by-side risk score calibration and routing evaluation via <code className="font-mono">POST /api/v1/payments/simulate</code>.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={runComparison}
          disabled={loading}
        >
          <Play size={16} />
          {loading ? 'Evaluating All Scenarios...' : 'Re-run Comparison'}
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

      {/* Comparison Table */}
      {simulationData && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Evaluated Scenarios ({simulationData.total_scenarios})
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Scenario Name</th>
                  <th style={{ padding: '12px 16px' }}>Payment Ref</th>
                  <th style={{ padding: '12px 16px' }}>Risk Calibration Score</th>
                  <th style={{ padding: '12px 16px' }}>Risk Level</th>
                  <th style={{ padding: '12px 16px' }}>Workflow Recommendation</th>
                  <th style={{ padding: '12px 16px' }}>Triggered Indicators</th>
                  <th style={{ padding: '12px 16px' }}>Human Review?</th>
                </tr>
              </thead>
              <tbody>
                {simulationData.results.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                      {item.scenario_name}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>
                      {item.result.payment_id}
                    </td>
                    <td style={{ padding: '12px 16px', minWidth: '150px' }}>
                      <RiskScoreBar score={item.result.risk_score} showLabel={false} />
                      <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                        Score: {item.result.risk_score.toFixed(2)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <RiskBadge level={item.result.risk_level} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <RecommendationBadge recommendation={item.result.recommendation} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 600, color: item.result.risk_indicators.length > 0 ? '#b91c1c' : '#059669' }}>
                        {item.result.risk_indicators.length} {item.result.risk_indicators.length === 1 ? 'flag' : 'flags'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          color: item.result.review_required ? '#dc2626' : '#059669',
                        }}
                      >
                        {item.result.review_required ? 'Required' : 'Auto Approved'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
