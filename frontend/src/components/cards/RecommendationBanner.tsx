import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { RecommendationType, RiskLevel } from '../../types/api';
import { PriorityBadge, RecommendationBadge, RiskBadge } from '../common/Badge';

interface RecommendationBannerProps {
  recommendation: RecommendationType | string;
  riskLevel: RiskLevel | string;
  reviewRequired: boolean;
  priority?: string;
  requiredActions?: string[];
  explanation?: string;
}

export const RecommendationBanner: React.FC<RecommendationBannerProps> = ({
  recommendation,
  riskLevel,
  reviewRequired,
  priority = 'medium',
  requiredActions = [],
  explanation,
}) => {
  const getBannerStyles = () => {
    switch (recommendation) {
      case 'proceed_to_normal_processing':
        return {
          bg: '#f0fdf4',
          border: '#bbf7d0',
          titleColor: '#166534',
          icon: <CheckCircle2 size={22} color="#16a34a" />,
          title: 'Automated Processing Recommended',
          desc: 'This transaction satisfies all baseline parameters and requires no manual intervention.',
        };
      case 'request_additional_information':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          titleColor: '#92400e',
          icon: <AlertCircle size={22} color="#d97706" />,
          title: 'Additional Customer Information Required',
          desc: 'Missing transaction baseline prevents reliable scoring. Query core banking or request customer documentation.',
        };
      case 'create_human_review_case':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          titleColor: '#991b1b',
          icon: <AlertTriangle size={22} color="#dc2626" />,
          title: 'Human Review Case Required',
          desc: 'Anomalies detected. Power Automate will route this case to the operational compliance review queue.',
        };
      case 'escalate_for_investigation':
        return {
          bg: '#fef2f2',
          border: '#f87171',
          titleColor: '#991b1b',
          icon: <ShieldAlert size={22} color="#b91c1c" />,
          title: 'Urgent AML / Financial Crime Escalation',
          desc: 'Severe compound risk factors identified. Immediate escalation to specialized investigation teams.',
        };
      default:
        return {
          bg: '#f8fafc',
          border: '#cbd5e1',
          titleColor: '#334155',
          icon: <AlertCircle size={22} color="#64748b" />,
          title: 'Review Assessment Generated',
          desc: 'Follow standard workflow routing instructions.',
        };
    }
  };

  const style = getBannerStyles();

  return (
    <div
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '8px',
        padding: '18px 20px',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ marginTop: '2px', flexShrink: 0 }}>{style.icon}</div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: style.titleColor, margin: 0 }}>
              {style.title}
            </h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <RiskBadge level={riskLevel} />
              <RecommendationBadge recommendation={recommendation} />
              {reviewRequired && <PriorityBadge priority={priority} />}
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '6px', marginBottom: '10px' }}>
            {style.desc}
          </p>

          {explanation && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                padding: '10px 14px',
                borderRadius: '6px',
                border: `1px solid ${style.border}`,
                fontSize: '0.8125rem',
                color: '#334155',
                marginTop: '8px',
                lineHeight: 1.45,
              }}
            >
              <strong style={{ color: '#0f172a' }}>Reasoning: </strong>
              {explanation}
            </div>
          )}

          {requiredActions.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Operational Checklist for Reviewer:
              </span>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {requiredActions.map((action, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8125rem',
                      color: '#1e293b',
                    }}
                  >
                    <ArrowRight size={13} color="#64748b" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
