"""Primary payment analysis and rule catalog routes."""

from fastapi import APIRouter, Depends
from app.config import Settings, get_settings
from app.models.requests import PaymentAnalysisRequest
from app.models.responses import (
    PaymentAnalysisResponse,
    RiskRuleItem,
    RiskRulesResponse,
)
from app.rules.risk_rules import get_rule_catalog
from app.services.explanation_service import ExplanationService
from app.services.feature_engine import FeatureEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.risk_engine import RiskEngine
from app.utils.logging import logger, mask_identifier
from app.utils.security import verify_api_key

router = APIRouter(tags=["Payment Risk Analysis"])


@router.post(
    "/api/v1/payments/analyze",
    response_model=PaymentAnalysisResponse,
    summary="Complete End-to-End Payment Risk Analysis",
    description="Main entrypoint for Power Automate. Computes risk features, scores anomalies, and returns actionable routing recommendations.",
    dependencies=[Depends(verify_api_key)],
)
async def analyze_payment(
    request: PaymentAnalysisRequest,
    settings: Settings = Depends(get_settings),
) -> PaymentAnalysisResponse:
    """Analyze a payment transaction against historical context and return structured risk evaluation."""
    logger.info(
        f"Processing payment analysis for payment_id={request.payment_id}, "
        f"customer_id={mask_identifier(request.customer_id)}, "
        f"amount={request.amount} {request.currency}"
    )

    # 1. Feature Calculation
    features, missing_fields = FeatureEngine.calculate_features(request)

    # 2. Transparent Risk Scoring
    risk_engine = RiskEngine(settings)
    risk_score, risk_level, score_components, risk_indicators = risk_engine.evaluate_risk(
        features=features,
        missing_fields=missing_fields,
    )

    # 3. Recommendation Generation
    recommendation, review_required, priority, required_actions = RecommendationEngine.generate_recommendation(
        risk_score=risk_score,
        risk_level=risk_level,
        indicators=risk_indicators,
        missing_fields=missing_fields,
    )

    # 4. Explainability Service
    explanation = ExplanationService.generate_explanation(
        risk_level=risk_level,
        recommendation=recommendation,
        indicators=risk_indicators,
        missing_fields=missing_fields,
    )

    return PaymentAnalysisResponse(
        success=True,
        payment_id=request.payment_id,
        customer_id=request.customer_id,
        risk_score=risk_score,
        risk_level=risk_level,
        recommendation=recommendation,
        review_required=review_required,
        risk_indicators=risk_indicators,
        missing_information=missing_fields,
        explanation=explanation,
        model_version="rule-based-v1",
    )


@router.post(
    "/api/v1/payments/validate",
    summary="Validate Payment Request Payload",
    description="Verifies the formatting and integrity of payment payload without scoring.",
    dependencies=[Depends(verify_api_key)],
)
async def validate_payment_payload(request: PaymentAnalysisRequest) -> dict:
    """Validate payment fields and data integrity."""
    return {
        "success": True,
        "payment_id": request.payment_id,
        "valid": True,
        "message": "Payment payload adheres to all schema specifications",
    }


@router.get(
    "/api/v1/risk-rules",
    response_model=RiskRulesResponse,
    summary="Inspect Active Risk Rules Catalog",
    description="Returns the active rulebook, weights, categories, and evaluation thresholds.",
)
async def list_risk_rules(settings: Settings = Depends(get_settings)) -> RiskRulesResponse:
    """Return the complete rulebook and active thresholds."""
    rules_data = get_rule_catalog(settings)
    rule_items = [RiskRuleItem(**item) for item in rules_data]
    return RiskRulesResponse(
        success=True,
        active_rules_count=len(rule_items),
        rules=rule_items,
    )
