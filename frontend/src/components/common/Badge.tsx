import React from 'react';
import { PriorityLevel, RecommendationType, RiskLevel, SeverityLevel } from '../../types/api';

interface BadgeProps {
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral'
    | 'info';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  size = 'md',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'danger':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'neutral':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${getStyles()} ${sizeClasses} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 500,
        borderRadius: '9999px',
        borderWidth: '1px',
        borderStyle: 'solid',
        ...getInlineStyles(variant),
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
      }}
    >
      {children}
    </span>
  );
};

function getInlineStyles(variant: string) {
  switch (variant) {
    case 'success':
      return { backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' };
    case 'warning':
      return { backgroundColor: '#fffbeb', color: '#92400e', borderColor: '#fde68a' };
    case 'danger':
      return { backgroundColor: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' };
    case 'info':
      return { backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' };
    case 'neutral':
      return { backgroundColor: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1' };
    default:
      return { backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' };
  }
}

export const RiskBadge: React.FC<{ level: RiskLevel | string }> = ({ level }) => {
  switch (level) {
    case 'low_risk':
      return <Badge variant="success">Low Risk</Badge>;
    case 'medium_risk':
      return <Badge variant="warning">Medium Risk</Badge>;
    case 'high_risk':
      return <Badge variant="danger">High Risk</Badge>;
    case 'insufficient_information':
      return <Badge variant="neutral">Insufficient Info</Badge>;
    default:
      return <Badge variant="default">{level}</Badge>;
  }
};

export const RecommendationBadge: React.FC<{ recommendation: RecommendationType | string }> = ({
  recommendation,
}) => {
  switch (recommendation) {
    case 'proceed_to_normal_processing':
      return <Badge variant="success">Proceed to Processing</Badge>;
    case 'request_additional_information':
      return <Badge variant="warning">Request Additional Info</Badge>;
    case 'create_human_review_case':
      return <Badge variant="danger">Create Review Case</Badge>;
    case 'escalate_for_investigation':
      return <Badge variant="danger">Escalate to AML</Badge>;
    default:
      return <Badge variant="neutral">{recommendation}</Badge>;
  }
};

export const SeverityBadge: React.FC<{ severity: SeverityLevel | string }> = ({ severity }) => {
  switch (severity) {
    case 'low':
      return <Badge variant="neutral" size="sm">Low Severity</Badge>;
    case 'medium':
      return <Badge variant="warning" size="sm">Medium Severity</Badge>;
    case 'high':
    case 'critical':
      return <Badge variant="danger" size="sm">High Severity</Badge>;
    default:
      return <Badge variant="default" size="sm">{severity}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel | string }> = ({ priority }) => {
  switch (priority) {
    case 'low':
      return <Badge variant="neutral" size="sm">Low Priority</Badge>;
    case 'medium':
      return <Badge variant="warning" size="sm">Medium Priority</Badge>;
    case 'high':
      return <Badge variant="danger" size="sm">High Priority</Badge>;
    case 'urgent':
      return <Badge variant="danger" size="sm">Urgent Priority</Badge>;
    default:
      return <Badge variant="default" size="sm">{priority}</Badge>;
  }
};
