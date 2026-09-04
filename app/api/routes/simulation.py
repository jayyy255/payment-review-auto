"""Simulation and scenario comparison routes for portfolio demonstration."""

from fastapi import APIRouter, Depends
from app.config import Settings, get_settings
from app.models.requests import SimulationRequest
from app.models.responses import (
    PaymentAnalysisResponse,
    SimulationResponse,
    SimulationScenarioResult,
)
from app.services.explanation_service import ExplanationService
from app.services.feature_engine import FeatureEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.risk_engine import RiskEngine
from app.utils.logging import logger
from app.utils.security import verify_api_key

router = APIRouter(prefix="/api/v1/payments", tags=["Scenario Simulation"])


@router.post(
    "/simulate",
    response_model=SimulationResponse,
    summary="Batch Scenario Simulation and Risk Comparison",
    description="Evaluates multiple payment scenarios side-by-side for portfolio demonstration and rule tuning.",
    dependencies=[Depends(verify_api_key)],
)
async def simulate_payment_scenarios(
    request: SimulationRequest,
    settings: Settings = Depends(get_settings),
) -> SimulationResponse:
    """Run risk analysis across multiple test scenarios in a single batch call."""
    logger.info(f"Batch simulation requested with {len(request.scenarios)} scenarios")
    risk_engine = RiskEngine(settings)
    scenario_results: list[SimulationScenarioResult] = []

    for scenario in request.scenarios:
        pay_req = scenario.payment
        features, missing_fields = FeatureEngine.calculate_features(pay_req)
        risk_score, risk_level, score_components, risk_indicators = risk_engine.evaluate_risk(
            features=features,
            missing_fields=missing_fields,
        )
        recommendation, review_required, priority, required_actions = RecommendationEngine.generate_recommendation(
            risk_score=risk_score,
            risk_level=risk_level,
            indicators=risk_indicators,
            missing_fields=missing_fields,
        )
        explanation = ExplanationService.generate_explanation(
            risk_level=risk_level,
            recommendation=recommendation,
            indicators=risk_indicators,
            missing_fields=missing_fields,
        )

        analysis_res = PaymentAnalysisResponse(
            success=True,
            payment_id=pay_req.payment_id,
            customer_id=pay_req.customer_id,
            risk_score=risk_score,
            risk_level=risk_level,
            recommendation=recommendation,
            review_required=review_required,
            risk_indicators=risk_indicators,
            missing_information=missing_fields,
            explanation=explanation,
            model_version="rule-based-v1",
        )

        scenario_results.append(
            SimulationScenarioResult(
                scenario_name=scenario.scenario_name,
                result=analysis_res,
            )
        )

    return SimulationResponse(
        success=True,
        total_scenarios=len(scenario_results),
        results=scenario_results,
    )
