/**
 * Centralized API Client with activity logging and latency metrics.
 */

import {
  FeatureCalculationResponse,
  HealthResponse,
  PaymentAnalysisRequest,
  PaymentAnalysisResponse,
  RecommendationResponse,
  RiskRulesResponse,
  RiskScoreResponse,
  SimulationRequest,
  SimulationResponse,
  VersionResponse,
} from '../types/api';
import { ApiLogEntry } from '../types/ui';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

type LogListener = (entry: ApiLogEntry) => void;
const logListeners: LogListener[] = [];

export function subscribeApiLogs(listener: LogListener): () => void {
  logListeners.push(listener);
  return () => {
    const idx = logListeners.indexOf(listener);
    if (idx !== -1) logListeners.splice(idx, 1);
  };
}

const apiLogsHistory: ApiLogEntry[] = [];

export function getApiLogsHistory(): ApiLogEntry[] {
  return [...apiLogsHistory];
}

function recordLog(entry: ApiLogEntry) {
  apiLogsHistory.unshift(entry);
  if (apiLogsHistory.length > 50) apiLogsHistory.pop();
  logListeners.forEach((fn) => fn(entry));
}

async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const startTime = performance.now();
  const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const timestamp = new Date().toISOString();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const durationMs = Math.round(performance.now() - startTime);
    const contentType = res.headers.get('content-type');
    let responseData: any = null;

    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
    } else {
      responseData = await res.text();
    }

    recordLog({
      id: logId,
      timestamp,
      method,
      endpoint,
      status: res.status,
      durationMs,
      requestBody: body,
      responseBody: responseData,
      error: !res.ok ? responseData?.message || `HTTP ${res.status}` : undefined,
    });

    if (!res.ok) {
      const errMsg = responseData?.message || `API Error: ${res.statusText} (${res.status})`;
      const error: any = new Error(errMsg);
      error.status = res.status;
      error.details = responseData;
      throw error;
    }

    return responseData as T;
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    if (!err.status) {
      // Network / Fetch error
      recordLog({
        id: logId,
        timestamp,
        method,
        endpoint,
        status: 0,
        durationMs,
        requestBody: body,
        responseBody: null,
        error: err.message || 'Network connection failed',
      });
    }
    throw err;
  }
}

export const apiClient = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/health', 'GET');
  },

  async getVersion(): Promise<VersionResponse> {
    return request<VersionResponse>('/api/v1/version', 'GET');
  },

  async getRiskRules(): Promise<RiskRulesResponse> {
    return request<RiskRulesResponse>('/api/v1/risk-rules', 'GET');
  },

  async analyzePayment(payload: PaymentAnalysisRequest): Promise<PaymentAnalysisResponse> {
    return request<PaymentAnalysisResponse>('/api/v1/payments/analyze', 'POST', payload);
  },

  async calculateFeatures(payload: PaymentAnalysisRequest): Promise<FeatureCalculationResponse> {
    return request<FeatureCalculationResponse>('/api/v1/payments/features', 'POST', payload);
  },

  async scorePayment(paymentId: string, features: Record<string, any>): Promise<RiskScoreResponse> {
    return request<RiskScoreResponse>('/api/v1/payments/score', 'POST', {
      payment_id: paymentId,
      features,
    });
  },

  async getRecommendation(
    paymentId: string,
    riskScore: number,
    riskLevel: string,
    riskIndicators: any[] = [],
    missingInfo: string[] = []
  ): Promise<RecommendationResponse> {
    return request<RecommendationResponse>('/api/v1/payments/recommendation', 'POST', {
      payment_id: paymentId,
      risk_score: riskScore,
      risk_level: riskLevel,
      risk_indicators: riskIndicators,
      missing_information: missingInfo,
    });
  },

  async simulateScenarios(payload: SimulationRequest): Promise<SimulationResponse> {
    return request<SimulationResponse>('/api/v1/payments/simulate', 'POST', payload);
  },

  async validatePayment(payload: PaymentAnalysisRequest): Promise<{ success: boolean; valid: boolean; message: string }> {
    return request<{ success: boolean; valid: boolean; message: string }>('/api/v1/payments/validate', 'POST', payload);
  },
};
