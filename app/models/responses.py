"""Response data models for structured, predictable API responses."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.models.enums import PriorityLevel, RecommendationType, RiskLevel, SeverityLevel


class RiskIndicator(BaseModel):
    """Structured individual risk indicator."""

    code: str = Field(..., description="Unique machine-readable indicator code (e.g. AMOUNT_SPIKE)")
    severity: SeverityLevel = Field(..., description="Severity level: low, medium, high, critical")
    message: str = Field(..., description="Human-readable explanation of why this indicator triggered")


class ScoreComponent(BaseModel):
    """Individual feature contribution breakdown to the final risk score."""

    feature: str = Field(..., description="Feature identifier")
    contribution: float = Field(..., description="Calculated contribution score to final risk")
    raw_value: Optional[Any] = Field(default=None, description="Original raw value of the feature")
    weight: Optional[float] = Field(default=None, description="Configured weight multiplier")


class PaymentAnalysisResponse(BaseModel):
    """Complete end-to-end risk analysis and recommendation response."""

    success: bool = Field(default=True, description="Indicates successful analysis execution")
    payment_id: str = Field(..., description="Payment identifier")
    customer_id: str = Field(..., description="Customer identifier")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Normalized risk score [0.0 - 1.0]")
    risk_level: RiskLevel = Field(..., description="Calculated risk categorization")
    recommendation: RecommendationType = Field(..., description="Workflow routing recommendation for Power Automate")
    review_required: bool = Field(..., description="Whether a human review task should be created")
    risk_indicators: List[RiskIndicator] = Field(default_factory=list, description="List of triggered indicators")
    missing_information: List[str] = Field(default_factory=list, description="List of missing contextual fields")
    explanation: str = Field(..., description="Comprehensive natural-language explanation of findings")
    model_version: str = Field(default="rule-based-v1", description="Active rule engine or model version")


class FeatureCalculationResponse(BaseModel):
    """Response payload for pure feature calculation."""

    success: bool = Field(default=True)
    payment_id: str = Field(..., description="Payment identifier")
    features: Dict[str, Any] = Field(..., description="Map of calculated numerical & boolean feature values")
    missing_fields: List[str] = Field(default_factory=list, description="Fields that were missing during calculation")


class RiskScoreResponse(BaseModel):
    """Response payload for pure risk score evaluation."""

    success: bool = Field(default=True)
    payment_id: str = Field(..., description="Payment identifier")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Overall risk score")
    risk_level: RiskLevel = Field(..., description="Categorized risk level")
    score_components: List[ScoreComponent] = Field(default_factory=list, description="Feature contribution breakdown")
    recommendation: RecommendationType = Field(..., description="Workflow recommendation")
    model_version: str = Field(default="rule-based-v1")


class RecommendationResponse(BaseModel):
    """Response payload for pure operational recommendation generation."""

    success: bool = Field(default=True)
    payment_id: str = Field(..., description="Payment identifier")
    risk_level: RiskLevel = Field(..., description="Risk level")
    recommendation: RecommendationType = Field(..., description="Recommended workflow action")
    review_required: bool = Field(..., description="Whether human review is needed")
    priority: PriorityLevel = Field(..., description="Review routing priority in Dataverse")
    required_actions: List[str] = Field(default_factory=list, description="Checklist actions for human reviewer")


class SimulationScenarioResult(BaseModel):
    """Result of a single simulated scenario."""

    scenario_name: str
    result: PaymentAnalysisResponse


class SimulationResponse(BaseModel):
    """Response payload for scenario simulation comparisons."""

    success: bool = Field(default=True)
    total_scenarios: int
    results: List[SimulationScenarioResult]


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(default="healthy", description="Service health state")


class VersionResponse(BaseModel):
    """Service version response schema."""

    service: str = Field(..., description="Service name")
    version: str = Field(..., description="Service version")
    model_version: str = Field(default="rule-based-v1", description="Active risk model version")
    environment: str = Field(..., description="Runtime environment")


class RiskRuleItem(BaseModel):
    """Metadata describing an active risk rule."""

    code: str
    name: str
    category: str
    description: str
    weight: float
    thresholds: Dict[str, Any]
    enabled: bool


class RiskRulesResponse(BaseModel):
    """Response for rule catalog inspection."""

    success: bool = Field(default=True)
    active_rules_count: int
    rules: List[RiskRuleItem]
