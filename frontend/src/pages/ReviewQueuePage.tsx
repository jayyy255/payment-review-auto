import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Eye,
  FileSearch,
  ShieldAlert,
  X,
} from 'lucide-react';
import { PriorityBadge, RecommendationBadge, RiskBadge } from '../components/common/Badge';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import { ReviewQueueItem, ReviewQueueStatus } from '../types/ui';

export const ReviewQueuePage: React.FC = () => {
  // Initial seed from sample scenarios
  const [queueItems, setQueueItems] = useState<ReviewQueueItem[]>([
    {
      id: 'CASE-2026-001',
      paymentId: SAMPLE_SCENARIOS[1].payload.payment_id,
      customerId: SAMPLE_SCENARIOS[1].payload.customer_id,
      amount: SAMPLE_SCENARIOS[1].payload.amount,
      currency: SAMPLE_SCENARIOS[1].payload.currency,
      timestamp: SAMPLE_SCENARIOS[1].payload.transaction_timestamp,
      riskScore: 0.90,
      riskLevel: 'high_risk',
      recommendation: 'escalate_for_investigation',
      primaryReason: 'Amount spike (40x historical avg) + First-time overseas beneficiary via Wire',
      priority: 'urgent',
      status: 'Pending Review',
      requestPayload: SAMPLE_SCENARIOS[1].payload,
    },
    {
      id: 'CASE-2026-002',
      paymentId: SAMPLE_SCENARIOS[2].payload.payment_id,
      customerId: SAMPLE_SCENARIOS[2].payload.customer_id,
      amount: SAMPLE_SCENARIOS[2].payload.amount,
      currency: SAMPLE_SCENARIOS[2].payload.currency,
      timestamp: SAMPLE_SCENARIOS[2].payload.transaction_timestamp,
      riskScore: 0.40,
      riskLevel: 'medium_risk',
      recommendation: 'create_human_review_case',
      primaryReason: 'New beneficiary account encounter with no prior payment history',
      priority: 'medium',
      status: 'Pending Review',
      requestPayload: SAMPLE_SCENARIOS[2].payload,
    },
    {
      id: 'CASE-2026-003',
      paymentId: SAMPLE_SCENARIOS[4].payload.payment_id,
      customerId: SAMPLE_SCENARIOS[4].payload.customer_id,
      amount: SAMPLE_SCENARIOS[4].payload.amount,
      currency: SAMPLE_SCENARIOS[4].payload.currency,
      timestamp: SAMPLE_SCENARIOS[4].payload.transaction_timestamp,
      riskScore: 0.40,
      riskLevel: 'medium_risk',
      recommendation: 'create_human_review_case',
      primaryReason: 'Transaction frequency spike (22 transactions in 24h window)',
      priority: 'medium',
      status: 'Pending Review',
      requestPayload: SAMPLE_SCENARIOS[4].payload,
    },
    {
      id: 'CASE-2026-004',
      paymentId: SAMPLE_SCENARIOS[5].payload.payment_id,
      customerId: SAMPLE_SCENARIOS[5].payload.customer_id,
      amount: SAMPLE_SCENARIOS[5].payload.amount,
      currency: SAMPLE_SCENARIOS[5].payload.currency,
      timestamp: SAMPLE_SCENARIOS[5].payload.transaction_timestamp,
      riskScore: 0.20,
      riskLevel: 'insufficient_information',
      recommendation: 'request_additional_information',
      primaryReason: 'Missing customer baseline spending context and transaction count',
      priority: 'medium',
      status: 'Information Requested',
      requestPayload: SAMPLE_SCENARIOS[5].payload,
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedCase, setSelectedCase] = useState<ReviewQueueItem | null>(null);
  const [reviewerComment, setReviewerComment] = useState<string>('');

  const filteredItems = queueItems.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.status === activeFilter;
  });

  const handleUpdateStatus = (newStatus: ReviewQueueStatus) => {
    if (!selectedCase) return;
    setQueueItems((prev) =>
      prev.map((item) =>
        item.id === selectedCase.id
          ? {
              ...item,
              status: newStatus,
              reviewerNotes: reviewerComment || item.reviewerNotes,
            }
          : item
      )
    );
    setSelectedCase(null);
    setReviewerComment('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Compliance & Triage Review Queue
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Operational workflow queue for transactions flagged by the risk analysis engine.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
          {['All', 'Pending Review', 'Information Requested', 'Reviewed & Cleared', 'Escalated to AML'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: activeFilter === filter ? '#ffffff' : 'transparent',
                color: activeFilter === filter ? '#0f172a' : '#64748b',
                border: 'none',
                boxShadow: activeFilter === filter ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>Case ID</th>
              <th style={{ padding: '12px 16px' }}>Payment / Customer</th>
              <th style={{ padding: '12px 16px' }}>Amount</th>
              <th style={{ padding: '12px 16px' }}>Risk Score & Level</th>
              <th style={{ padding: '12px 16px' }}>Workflow Recommendation</th>
              <th style={{ padding: '12px 16px' }}>Priority</th>
              <th style={{ padding: '12px 16px' }}>Queue Status</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  No cases found in this view filter.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>
                    {item.id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.paymentId}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                      {item.customerId}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>
                    {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {item.currency}
                  </td>
                  <td style={{ padding: '12px 16px', minWidth: '130px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RiskBadge level={item.riskLevel} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                        {item.riskScore.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <RecommendationBadge recommendation={item.recommendation} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color:
                          item.status === 'Reviewed & Cleared'
                            ? '#059669'
                            : item.status === 'Escalated to AML'
                            ? '#dc2626'
                            : item.status === 'Information Requested'
                            ? '#d97706'
                            : '#475569',
                      }}
                    >
                      {item.status === 'Reviewed & Cleared' && <CheckCircle size={13} />}
                      {item.status === 'Escalated to AML' && <ShieldAlert size={13} />}
                      {item.status === 'Information Requested' && <FileSearch size={13} />}
                      {item.status === 'Pending Review' && <Clock size={13} />}
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => {
                        setSelectedCase(item);
                        setReviewerComment(item.reviewerNotes || '');
                      }}
                    >
                      <Eye size={13} />
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Case Review Modal / Drawer */}
      {selectedCase && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              border: '1px solid #cbd5e1',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Review Case: {selectedCase.id}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Transaction Ref: {selectedCase.paymentId} | Timestamp: {selectedCase.timestamp}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Case Overview Box */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '14px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '0.8125rem',
              }}
            >
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.6875rem' }}>Amount & Currency</span>
                <strong style={{ color: '#0f172a' }}>{selectedCase.amount} {selectedCase.currency}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.6875rem' }}>Risk Score</span>
                <strong style={{ color: '#0f172a' }}>{selectedCase.riskScore.toFixed(2)} ({selectedCase.riskLevel})</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.6875rem' }}>Primary Risk Flag</span>
                <span style={{ color: '#334155' }}>{selectedCase.primaryReason}</span>
              </div>
            </div>

            {/* Reviewer Checklist */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Investigation Checklist:
              </span>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#334155' }}>
                  <ArrowRight size={14} color="#64748b" /> Confirm payment purpose with customer secondary channel
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#334155' }}>
                  <ArrowRight size={14} color="#64748b" /> Verify beneficiary account legitimacy and country sanctions
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#334155' }}>
                  <ArrowRight size={14} color="#64748b" /> Cross-check recent account login IP / device fingerprint
                </li>
              </ul>
            </div>

            {/* Reviewer Comments Form */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Reviewer Disposition Rationale (Logged to Dataverse Audit Trail):
              </label>
              <textarea
                rows={3}
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                placeholder="Enter justification, customer verification notes, or AML escalations..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ backgroundColor: '#059669', fontSize: '0.75rem', padding: '8px' }}
                onClick={() => handleUpdateStatus('Reviewed & Cleared')}
              >
                <CheckCircle size={14} /> Clear & Release
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '8px' }}
                onClick={() => handleUpdateStatus('Information Requested')}
              >
                <FileSearch size={14} /> Request Info
              </button>
              <button
                type="button"
                className="btn-danger"
                style={{ fontSize: '0.75rem', padding: '8px' }}
                onClick={() => handleUpdateStatus('Escalated to AML')}
              >
                <ShieldAlert size={14} /> Escalate to AML
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
