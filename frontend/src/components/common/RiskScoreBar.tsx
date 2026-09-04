import React from 'react';

interface RiskScoreBarProps {
  score: number; // 0.0 to 1.0
  showLabel?: boolean;
}

export const RiskScoreBar: React.FC<RiskScoreBarProps> = ({ score, showLabel = true }) => {
  const percentage = Math.min(Math.max(Math.round(score * 100), 0), 100);

  // Soft semantic color calculation
  const getColor = () => {
    if (score < 0.40) return '#059669'; // Soft emerald
    if (score < 0.70) return '#d97706'; // Soft amber
    return '#dc2626'; // Soft red
  };

  const getLabel = () => {
    if (score < 0.40) return 'Low Risk Threshold';
    if (score < 0.70) return 'Medium Risk Threshold';
    return 'High Risk Threshold';
  };

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '6px',
            fontSize: '0.8125rem',
          }}
        >
          <span style={{ color: '#64748b', fontWeight: 500 }}>
            Calculated Risk Score: <strong style={{ color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>{score.toFixed(2)}</strong>
          </span>
          <span style={{ color: getColor(), fontWeight: 600, fontSize: '0.75rem' }}>
            {getLabel()} ({percentage}%)
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        style={{
          position: 'relative',
          height: '8px',
          width: '100%',
          backgroundColor: '#e2e8f0',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: getColor(),
            borderRadius: '9999px',
            transition: 'width 0.4s ease, background-color 0.4s ease',
          }}
        />
      </div>

      {/* Threshold Markers */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          fontSize: '0.6875rem',
          color: '#94a3b8',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <span>0.00 (Safe)</span>
        <span>0.40 (Med)</span>
        <span>0.70 (High)</span>
        <span>1.00</span>
      </div>
    </div>
  );
};
