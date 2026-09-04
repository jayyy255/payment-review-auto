import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calculator,
  CheckCircle,
  FileCheck,
  Play,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../api/client';
import { RecommendationBanner } from '../components/cards/RecommendationBanner';
import { JsonViewer } from '../components/common/JsonViewer';
import { RiskScoreBar } from '../components/common/RiskScoreBar';
import { SeverityBadge } from '../components/common/Badge';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import {
  FeatureCalculationResponse,
  PaymentAnalysisRequest,
  PaymentAnalysisResponse,
} from '../types/api';

interface PaymentAnalysisPageProps {
  initialPayload?: PaymentAnalysisRequest;
}

export const PaymentAnalysisPage: React.FC<PaymentAnalysisPageProps> = ({ initialPayload }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-high-spike');
  const [formData, setFormData] = useState<PaymentAnalysisRequest>(
    initialPayload || SAMPLE_SCENARIOS[1].payload
  );

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PaymentAnalysisResponse | null>(null);
  const [featuresResult, setFeaturesResult] = useState<FeatureCalculationResponse | null>(null);
  const [validationResult, setValidationResult] = useState<{ success: boolean; valid: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPayload) {
      setFormData(initialPayload);
    }
  }, [initialPayload]);

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scenarioId = e.target.value;
    setSelectedScenarioId(scenarioId);
    const found = SAMPLE_SCENARIOS.find((s) => s.id === scenarioId);
    if (found) {
      setFormData({ ...found.payload });
      setAnalysisResult(null);
      setFeaturesResult(null);
      setValidationResult(null);
      setError(null);
    }
  };

  const handleInputChange = (field: keyof PaymentAnalysisRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setFeaturesResult(null);
    setValidationResult(null);
    try {
      const res = await apiClient.analyzePayment(formData);
      setAnalysisResult(res);
    } catch (err: any) {
      setError(err.message || 'Payment analysis failed');
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateFeatures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.calculateFeatures(formData);
      setFeaturesResult(res);
    } catch (err: any) {
      setError(err.message || 'Feature calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.validatePayment(formData);
      setValidationResult(res);
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Payment Risk Analysis Workbench
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Submit payment context to the Python risk engine for anomaly scoring, rule breakdown, and workflow routing.
          </p>
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#475569' }}>Load Preset Scenario:</span>
          <select
            value={selectedScenarioId}
            onChange={handleScenarioChange}
            style={{ fontWeight: 500, minWidth: '240px' }}
          >
            {SAMPLE_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.badge})
              </option>
            ))}
          </select>
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

      {/* Main Grid: Form Inputs & Live Evaluation Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(380px, 1.25fr)', gap: '24px' }}>
        {/* Left Column: Transaction Input Parameters */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Transaction & Customer Context
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Enriched context passed from Core Banking / Power Automate
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Payment ID
              </label>
              <input
                type="text"
                value={formData.payment_id}
                onChange={(e) => handleInputChange('payment_id', e.target.value)}
                style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Customer ID
              </label>
              <input
                type="text"
                value={formData.customer_id}
                onChange={(e) => handleInputChange('customer_id', e.target.value)}
                style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                style={{ width: '100%', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Currency
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value.toUpperCase())}
                style={{ width: '100%', textTransform: 'uppercase' }}
                maxLength={3}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Beneficiary ID
              </label>
              <input
                type="text"
                value={formData.beneficiary_id}
                onChange={(e) => handleInputChange('beneficiary_id', e.target.value)}
                style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Channel
              </label>
              <select
                value={formData.payment_channel || 'online'}
                onChange={(e) => handleInputChange('payment_channel', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="online">Online / Web</option>
                <option value="mobile">Mobile App</option>
                <option value="wire">Urgent Wire</option>
                <option value="international_wire">International Wire</option>
                <option value="batch">Batch ACH</option>
                <option value="crypto_ramp">Crypto Ramp</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Customer Country
              </label>
              <input
                type="text"
                value={formData.customer_country}
                onChange={(e) => handleInputChange('customer_country', e.target.value.toUpperCase())}
                style={{ width: '100%' }}
                maxLength={3}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Beneficiary Country
              </label>
              <input
                type="text"
                value={formData.beneficiary_country}
                onChange={(e) => handleInputChange('beneficiary_country', e.target.value.toUpperCase())}
                style={{ width: '100%' }}
                maxLength={3}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Historical Baselines (Context)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Customer Avg Amount
              </label>
              <input
                type="number"
                value={formData.customer_average_amount ?? ''}
                placeholder="null"
                onChange={(e) =>
                  handleInputChange(
                    'customer_average_amount',
                    e.target.value === '' ? null : parseFloat(e.target.value)
                  )
                }
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Total Lifetime Count
              </label>
              <input
                type="number"
                value={formData.customer_transaction_count ?? ''}
                placeholder="null"
                onChange={(e) =>
                  handleInputChange(
                    'customer_transaction_count',
                    e.target.value === '' ? null : parseInt(e.target.value, 10)
                  )
                }
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Recent Count (24h)
              </label>
              <input
                type="number"
                value={formData.recent_transaction_count ?? ''}
                placeholder="null"
                onChange={(e) =>
                  handleInputChange(
                    'recent_transaction_count',
                    e.target.value === '' ? null : parseInt(e.target.value, 10)
                  )
                }
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Previous Beneficiary?
              </label>
              <select
                value={
                  formData.previous_beneficiary === null
                    ? 'null'
                    : formData.previous_beneficiary
                    ? 'true'
                    : 'false'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  handleInputChange(
                    'previous_beneficiary',
                    val === 'null' ? null : val === 'true'
                  );
                }}
                style={{ width: '100%' }}
              >
                <option value="true">Yes (Known)</option>
                <option value="false">No (New Beneficiary)</option>
                <option value="null">Unspecified / Missing</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={loading}
              style={{ width: '100%', padding: '10px' }}
            >
              <Play size={16} />
              {loading ? 'Evaluating Risk Rules...' : 'Analyze Payment (Full Pipeline)'}
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCalculateFeatures}
                disabled={loading}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                <Calculator size={14} />
                Extract Features
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleValidate}
                disabled={loading}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                <FileCheck size={14} />
                Validate Schema
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Risk Assessment Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Validation Feedback */}
          {validationResult && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '6px',
                color: '#065f46',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle size={16} color="#059669" />
              <span>{validationResult.message}</span>
            </div>
          )}

          {/* Full Analysis Result */}
          {analysisResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Recommendation Banner */}
              <RecommendationBanner
                recommendation={analysisResult.recommendation}
                riskLevel={analysisResult.risk_level}
                reviewRequired={analysisResult.review_required}
                explanation={analysisResult.explanation}
              />

              {/* Risk Gauge Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  padding: '18px 20px',
                }}
              >
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                  Risk Score Calibration
                </h4>
                <RiskScoreBar score={analysisResult.risk_score} />
              </div>

              {/* Triggered Risk Indicators List */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                    Triggered Risk Indicators ({analysisResult.risk_indicators.length})
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Rule Model: <code className="font-mono">{analysisResult.model_version}</code>
                  </span>
                </div>

                {analysisResult.risk_indicators.length === 0 ? (
                  <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', color: '#166534', fontSize: '0.8125rem' }}>
                    No elevated risk indicators triggered. All transaction metrics adhere to safe boundaries.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analysisResult.risk_indicators.map((ind, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <code style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                              {ind.code}
                            </code>
                            <SeverityBadge severity={ind.severity} />
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0 }}>
                            {ind.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Information Alert */}
              {analysisResult.missing_information.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    padding: '14px 16px',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
                    Missing Contextual Fields
                  </span>
                  <p style={{ fontSize: '0.8125rem', color: '#78350f', marginTop: '4px', margin: 0 }}>
                    {analysisResult.missing_information.join(', ')}
                  </p>
                </div>
              )}

              {/* Raw JSON Payload */}
              <JsonViewer data={analysisResult} title="Technical API Response (POST /api/v1/payments/analyze)" />
            </div>
          ) : featuresResult ? (
            /* Standalone Feature Calculation Result */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                }}
              >
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '14px' }}>
                  Extracted Risk Features (POST /api/v1/payments/features)
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Feature Name</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Computed Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(featuresResult.features).map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 500, color: '#334155' }}>{k}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
                            {v === null ? <span style={{ color: '#94a3b8' }}>null</span> : String(v)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <JsonViewer data={featuresResult} title="Raw Features JSON" />
            </div>
          ) : (
            /* Empty State */
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
              <Sparkles size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Ready to Evaluate Payment
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '340px', margin: '0 auto 16px' }}>
                Click <strong>"Analyze Payment"</strong> to run the full Python feature extraction, weighted risk scoring, and workflow routing engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
