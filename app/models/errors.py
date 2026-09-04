"""Standardized error models for consistent API error responses."""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Consistent error payload across all endpoints."""

    success: bool = Field(default=False, description="Always false for error responses")
    error_code: str = Field(..., description="Machine-readable error classification code", examples=["INVALID_PAYMENT_AMOUNT"])
    message: str = Field(..., description="Human-readable summary of the error", examples=["Payment amount must be greater than zero"])
    details: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Detailed validation breakdown or contextual error info")
