import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  FileSearch,
  Layers,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '../api/client';
import { MetricCard } from '../components/cards/MetricCard';
import { PriorityBadge, RecommendationBadge, RiskBadge } from '../components/common/Badge';
import { RiskScoreBar } from '../components/common/RiskScoreBar';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import { PaymentAnalysisResponse } from '../types/api';
import { ActivePage } from '../types/ui';

interface DashboardPageProps {
  onNavigate: (page: ActivePage, scenarioPayload?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [runningBatch, setRunningBatch] = useState(false);
  const [recentResults, setRecentResults] = useState<{ name: string; response: PaymentAnalysisResponse }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleRunAllDemoScenarios = async () => {
    setRunningBatch(true);
    setError(null);
    try {
      const simReq = {
        scenarios: SAMPLE_SCENARIOS.map((s) => ({
          scenario_name: s.title,
          payment: s.payload,
        })),
      };
      const res = await apiClient.simulateScenarios(simReq);
      setRecentResults(
        res.results.map((r) => ({
          name: r.scenario_name,
          response: r.result,
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to execute batch simulation');
    } finally {
      setRunningBatch(false);
    }
  };

  // Demo metric calculations
  const totalDemo = SAMPLE_SCENARIOS.length;
  const highRiskCount = 1;
  const medRiskCount = 3;
  const lowRiskCount = 1;
  const missingContextCount = 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Operational Review Dashboard
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Decision-support overview of automated payment risk evaluations and triage routing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate('compare')}
          >
            <Layers size={16} />
            Scenario Comparison
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleRunAllDemoScenarios}
            disabled={runningBatch}
          >
            <Play size={16} />
            {runningBatch ? 'Evaluating Scenarios...' : 'Run All Demo Scenarios'}
          </button>
        </div>
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

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <MetricCard
          title="Demo Scenarios"
          value={totalDemo}
          subtitle="Pre-configured synthetic test cases"
          icon={<ShieldCheck size={20} />}
          badgeText="Demo Metrics"
          variant="info"
        />
        <MetricCard
          title="Straight-Through (Low Risk)"
          value={lowRiskCount}
          subtitle="Direct release to payment rails"
          icon={<CheckCircle2 size={20} />}
          variant="success"
        />
        <MetricCard
          title="Requires Human Review"
          value={medRiskCount}
          subtitle="Moderate anomaly flags detected"
          icon={<AlertTriangle size={20} />}
          variant="warning"
        />
        <MetricCard
          title="Escalated for AML"
          value={highRiskCount}
          subtitle="Severe composite risk anomaly"
          icon={<AlertCircle size={20} />}
          variant="danger"
        />
        <MetricCard
          title="Missing Context"
          value={missingContextCount}
          subtitle="Incomplete customer profile"
          icon={<FileSearch size={20} />}
          variant="default"
        />
      </div>

      {/* Quick Launch Scenarios Grid */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Synthetic Payment Scenarios
            </h3>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Select any pre-configured scenario to analyze with the Python risk engine
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
          {SAMPLE_SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '14px 16px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.15s ease, background-color 0.15s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                    {scenario.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                    }}
                  >
                    {scenario.badge}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '10px', lineHeight: 1.4 }}>
                  {scenario.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>
                  Amount: <strong style={{ color: '#0f172a' }}>{scenario.payload.amount} {scenario.payload.currency}</strong> | Route: {scenario.payload.customer_country} → {scenario.payload.beneficiary_country}
                </div>
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => onNavigate('analysis', scenario.payload)}
              >
                <span>Analyze in Workbench</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Simulation Stream / Recent Results */}
      {recentResults.length > 0 && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Batch Simulation Results (Real Backend API Response)
            </h3>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Live evaluation executed via POST /api/v1/payments/simulate
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600 }}>
                  <th style={{ padding: '10px 12px' }}>Scenario</th>
                  <th style={{ padding: '10px 12px' }}>Payment ID</th>
                  <th style={{ padding: '10px 12px' }}>Risk Score</th>
                  <th style={{ padding: '10px 12px' }}>Risk Level</th>
                  <th style={{ padding: '10px 12px' }}>Workflow Recommendation</th>
                  <th style={{ padding: '10px 12px' }}>Review Required</th>
                  <th style={{ padding: '10px 12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentResults.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: '#0f172a' }}>{item.name}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>
                      {item.response.payment_id}
                    </td>
                    <td style={{ padding: '10px 12px', minWidth: '130px' }}>
                      <RiskScoreBar score={item.response.risk_score} showLabel={false} />
                      <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                        Score: {item.response.risk_score.toFixed(2)}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <RiskBadge level={item.response.risk_level} />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <RecommendationBadge recommendation={item.response.recommendation} />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {item.response.review_required ? (
                        <PriorityBadge priority="high" />
                      ) : (
                        <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 500 }}>No (Auto)</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => onNavigate('analysis', SAMPLE_SCENARIOS[idx]?.payload)}
                      >
                        Inspect
                      </button>
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
