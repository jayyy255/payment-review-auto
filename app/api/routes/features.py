"""Feature calculation API routes."""

from fastapi import APIRouter, Depends
from app.models.requests import FeatureCalculationRequest
from app.models.responses import FeatureCalculationResponse
from app.services.feature_engine import FeatureEngine
from app.utils.logging import logger, mask_identifier
from app.utils.security import verify_api_key

router = APIRouter(prefix="/api/v1/payments", tags=["Feature Extraction"])


@router.post(
    "/features",
    response_model=FeatureCalculationResponse,
    summary="Extract Analytical and Behavioral Risk Features",
    dependencies=[Depends(verify_api_key)],
)
async def calculate_features(request: FeatureCalculationRequest) -> FeatureCalculationResponse:
    """Calculate statistical and behavioral features from transaction and customer context."""
    logger.info(
        f"Feature extraction requested for payment_id={request.payment_id}, customer_id={mask_identifier(request.customer_id)}"
    )
    features, missing_fields = FeatureEngine.calculate_features(request)
    return FeatureCalculationResponse(
        success=True,
        payment_id=request.payment_id,
        features=features,
        missing_fields=missing_fields,
    )
