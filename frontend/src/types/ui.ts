import { PaymentAnalysisRequest, PaymentAnalysisResponse } from './api';

export type ActivePage =
  | 'dashboard'
  | 'analysis'
  | 'queue'
  | 'rules'
  | 'compare'
  | 'activity'
  | 'system';

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  durationMs: number;
  requestBody?: any;
  responseBody?: any;
  error?: string;
}

export type ReviewQueueStatus = 'Pending Review' | 'Information Requested' | 'Reviewed & Cleared' | 'Escalated to AML';

export interface ReviewQueueItem {
  id: string;
  paymentId: string;
  customerId: string;
  amount: number;
  currency: string;
  timestamp: string;
  riskScore: number;
  riskLevel: string;
  recommendation: string;
  primaryReason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: ReviewQueueStatus;
  reviewerNotes?: string;
  requestPayload: PaymentAnalysisRequest;
  lastAnalysis?: PaymentAnalysisResponse;
}

export interface DemoScenario {
  id: string;
  title: string;
  badge: string;
  description: string;
  payload: PaymentAnalysisRequest;
}
