"""Security utilities and API key verification dependency for FastAPI."""

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from app.config import get_settings

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(api_key: str | None = Security(API_KEY_HEADER)) -> bool:
    """Verify incoming X-API-Key header if authentication is enabled."""
    settings = get_settings()
    if not settings.api_key_enabled:
        return True

    if not api_key or api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error_code": "UNAUTHORIZED",
                "message": "Invalid or missing API key in X-API-Key header",
                "details": {},
            },
        )
    return True
