"""Workflow recommendation API routes."""

from fastapi import APIRouter, Depends
from app.models.enums import RiskLevel, SeverityLevel
from app.models.requests import RecommendationRequest
from app.models.responses import RecommendationResponse, RiskIndicator
from app.services.recommendation_engine import RecommendationEngine
from app.utils.logging import logger
from app.utils.security import verify_api_key

router = APIRouter(prefix="/api/v1/payments", tags=["Workflow Recommendations"])


@router.post(
    "/recommendation",
    response_model=RecommendationResponse,
    summary="Generate Operational Routing Recommendation for Power Automate",
    dependencies=[Depends(verify_api_key)],
)
async def generate_recommendation(request: RecommendationRequest) -> RecommendationResponse:
    """Generate workflow recommendation, priority, and required reviewer actions."""
    logger.info(
        f"Recommendation requested for payment_id={request.payment_id}, risk_level={request.risk_level}, risk_score={request.risk_score}"
    )
    try:
        risk_level = RiskLevel(request.risk_level)
    except ValueError:
        risk_level = RiskLevel.MEDIUM_RISK

    parsed_indicators: list[RiskIndicator] = []
    for ind_data in request.risk_indicators or []:
        try:
            parsed_indicators.append(
                RiskIndicator(
                    code=ind_data.get("code", "UNKNOWN"),
                    severity=SeverityLevel(ind_data.get("severity", "medium")),
                    message=ind_data.get("message", ""),
                )
            )
        except Exception:
            continue

    recommendation, review_required, priority, required_actions = RecommendationEngine.generate_recommendation(
        risk_score=request.risk_score,
        risk_level=risk_level,
        indicators=parsed_indicators,
        missing_fields=request.missing_information or [],
    )

    return RecommendationResponse(
        success=True,
        payment_id=request.payment_id,
        risk_level=risk_level,
        recommendation=recommendation,
        review_required=review_required,
        priority=priority,
        required_actions=required_actions,
    )
