/**
 * TypeScript API interfaces strictly matching backend Pydantic models
 */

export type RiskLevel =
  | 'low_risk'
  | 'medium_risk'
  | 'high_risk'
  | 'insufficient_information'
  | 'manual_review_required';

export type RecommendationType =
  | 'proceed_to_normal_processing'
  | 'request_additional_information'
  | 'create_human_review_case'
  | 'escalate_for_investigation';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface RiskIndicator {
  code: string;
  severity: SeverityLevel;
  message: string;
}

export interface ScoreComponent {
  feature: string;
  contribution: number;
  raw_value?: any;
  weight?: number;
}

export interface PaymentAnalysisRequest {
  payment_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  beneficiary_id: string;
  beneficiary_country: string;
  customer_country: string;
  transaction_timestamp: string;
  payment_channel?: string;
  customer_average_amount?: number | null;
  customer_transaction_count?: number | null;
  recent_transaction_count?: number | null;
  previous_beneficiary?: boolean | null;
  previous_beneficiary_count?: number | null;
  customer_risk_rating?: string | null;
  previous_review_notes?: string | null;
}

export interface PaymentAnalysisResponse {
  success: boolean;
  payment_id: string;
  customer_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  recommendation: RecommendationType;
  review_required: boolean;
  risk_indicators: RiskIndicator[];
  missing_information: string[];
  explanation: string;
  model_version: string;
}

export interface FeatureCalculationResponse {
  success: boolean;
  payment_id: string;
  features: Record<string, any>;
  missing_fields: string[];
}

export interface RiskScoreResponse {
  success: boolean;
  payment_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  score_components: ScoreComponent[];
  recommendation: RecommendationType;
  model_version: string;
}

export interface RecommendationResponse {
  success: boolean;
  payment_id: string;
  risk_level: RiskLevel;
  recommendation: RecommendationType;
  review_required: boolean;
  priority: PriorityLevel;
  required_actions: string[];
}

export interface SimulationScenarioItem {
  scenario_name: string;
  payment: PaymentAnalysisRequest;
}

export interface SimulationRequest {
  scenarios: SimulationScenarioItem[];
}

export interface SimulationScenarioResult {
  scenario_name: string;
  result: PaymentAnalysisResponse;
}

export interface SimulationResponse {
  success: boolean;
  total_scenarios: number;
  results: SimulationScenarioResult[];
}

export interface HealthResponse {
  status: string;
}

export interface VersionResponse {
  service: string;
  version: string;
  model_version: string;
  environment: string;
}

export interface RiskRuleItem {
  code: string;
  name: string;
  category: string;
  description: string;
  weight: number;
  thresholds: Record<string, any>;
  enabled: boolean;
}

export interface RiskRulesResponse {
  success: boolean;
  active_rules_count: number;
  rules: RiskRuleItem[];
}

export interface ApiErrorResponse {
  success: false;
  error_code: string;
  message: string;
  details?: Record<string, any>;
}
