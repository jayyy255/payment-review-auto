"""Risk scoring API routes."""

from fastapi import APIRouter, Depends
from app.config import Settings, get_settings
from app.models.requests import RiskScoreRequest
from app.models.responses import RiskScoreResponse
from app.services.recommendation_engine import RecommendationEngine
from app.services.risk_engine import RiskEngine
from app.utils.logging import logger
from app.utils.security import verify_api_key

router = APIRouter(prefix="/api/v1/payments", tags=["Risk Scoring"])


@router.post(
    "/score",
    response_model=RiskScoreResponse,
    summary="Compute Risk Score from Calculated Features",
    dependencies=[Depends(verify_api_key)],
)
async def score_payment_features(
    request: RiskScoreRequest,
    settings: Settings = Depends(get_settings),
) -> RiskScoreResponse:
    """Convert calculated risk features into transparent risk score and breakdown."""
    logger.info(f"Risk scoring requested for payment_id={request.payment_id}")
    risk_engine = RiskEngine(settings)
    score, risk_level, components, indicators = risk_engine.evaluate_risk(
        features=request.features,
        missing_fields=[],
    )

    recommendation, _, _, _ = RecommendationEngine.generate_recommendation(
        risk_score=score,
        risk_level=risk_level,
        indicators=indicators,
        missing_fields=[],
    )

    return RiskScoreResponse(
        success=True,
        payment_id=request.payment_id,
        risk_score=score,
        risk_level=risk_level,
        score_components=components,
        recommendation=recommendation,
        model_version="rule-based-v1",
    )
