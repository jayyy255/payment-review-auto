"""Health and service version inspection routes."""

from fastapi import APIRouter, Depends
from app.config import Settings, get_settings
from app.models.responses import HealthResponse, VersionResponse

router = APIRouter(tags=["System & Health"])


@router.get("/health", response_model=HealthResponse, summary="Service Health Check")
async def get_health() -> HealthResponse:
    """Return health status of the Payment Review API."""
    return HealthResponse(status="healthy")


@router.get("/api/v1/version", response_model=VersionResponse, summary="API and Model Version")
async def get_version(settings: Settings = Depends(get_settings)) -> VersionResponse:
    """Return active service version, rule engine version, and runtime environment."""
    return VersionResponse(
        service=settings.app_name,
        version=settings.app_version,
        model_version="rule-based-v1",
        environment=settings.environment,
    )
