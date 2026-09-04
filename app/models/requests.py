"""Request data models with strict validation for payment review APIs."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
import re


class PaymentAnalysisRequest(BaseModel):
    """Payload for full payment risk evaluation and recommendation generation."""

    payment_id: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Unique transaction reference identifier",
        examples=["pay-001"],
    )
    customer_id: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Unique customer identifier",
        examples=["cust-001"],
    )
    amount: float = Field(
        ...,
        gt=0,
        description="Payment amount (must be strictly positive)",
        examples=[15000.00],
    )
    currency: str = Field(
        ...,
        min_length=3,
        max_length=3,
        description="Three-letter ISO 4217 currency code",
        examples=["USD"],
    )
    beneficiary_id: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Beneficiary account/entity identifier",
        examples=["ben-009"],
    )
    beneficiary_country: str = Field(
        ...,
        min_length=2,
        max_length=3,
        description="Beneficiary country code (ISO 3166-1 alpha-2 or alpha-3)",
        examples=["GB"],
    )
    customer_country: str = Field(
        ...,
        min_length=2,
        max_length=3,
        description="Customer country code (ISO 3166-1 alpha-2 or alpha-3)",
        examples=["IN"],
    )
    transaction_timestamp: str = Field(
        ...,
        description="ISO 8601 formatted transaction timestamp",
        examples=["2026-01-15T10:30:00Z"],
    )
    payment_channel: Optional[str] = Field(
        default="online",
        description="Payment origination channel (online, mobile, wire, etc.)",
        examples=["online"],
    )
    customer_average_amount: Optional[float] = Field(
        default=None,
        ge=0,
        description="Customer historical average transaction amount",
        examples=[1200.0],
    )
    customer_transaction_count: Optional[int] = Field(
        default=None,
        ge=0,
        description="Total lifetime transaction count of the customer",
        examples=[85],
    )
    recent_transaction_count: Optional[int] = Field(
        default=None,
        ge=0,
        description="Transaction count in the recent monitoring window (e.g. 24h)",
        examples=[12],
    )
    previous_beneficiary: Optional[bool] = Field(
        default=None,
        description="Whether customer has previously paid this beneficiary",
        examples=[False],
    )
    previous_beneficiary_count: Optional[int] = Field(
        default=None,
        ge=0,
        description="Number of past transactions sent to this beneficiary",
        examples=[0],
    )
    customer_risk_rating: Optional[str] = Field(
        default=None,
        description="Optional pre-existing customer risk tier (low, medium, high)",
        examples=["low"],
    )
    previous_review_notes: Optional[str] = Field(
        default=None,
        description="Optional contextual notes from prior human reviews",
    )

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        v_upper = v.strip().upper()
        if not re.match(r"^[A-Z]{3}$", v_upper):
            raise ValueError("Currency must be a valid 3-letter uppercase ISO 4217 code (e.g. USD, EUR, GBP)")
        return v_upper

    @field_validator("beneficiary_country", "customer_country")
    @classmethod
    def validate_country_code(cls, v: str) -> str:
        v_upper = v.strip().upper()
        if not (2 <= len(v_upper) <= 3 and v_upper.isalpha()):
            raise ValueError("Country code must be a 2 or 3 letter ISO code (e.g. US, GBR, IN)")
        return v_upper

    @field_validator("transaction_timestamp")
    @classmethod
    def validate_iso_timestamp(cls, v: str) -> str:
        try:
            # Validate ISO 8601 parsing
            datetime.fromisoformat(v.replace("Z", "+00:00"))
        except Exception:
            raise ValueError("transaction_timestamp must be a valid ISO 8601 timestamp (e.g. 2026-01-15T10:30:00Z)")
        return v


class FeatureCalculationRequest(PaymentAnalysisRequest):
    """Payload for extracting statistical and behavioral risk features."""
    pass


class RiskScoreRequest(BaseModel):
    """Payload for computing risk score either from raw payment or extracted features."""

    payment_id: str = Field(..., description="Unique transaction identifier")
    features: Dict[str, Any] = Field(..., description="Calculated feature dictionary")


class RecommendationRequest(BaseModel):
    """Payload for generating workflow recommendation from risk level and score."""

    payment_id: str = Field(..., description="Unique transaction identifier")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Normalized risk score [0.0 - 1.0]")
    risk_level: str = Field(..., description="Categorized risk level (low_risk, medium_risk, high_risk, etc.)")
    risk_indicators: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Triggered indicators")
    missing_information: Optional[List[str]] = Field(default_factory=list, description="List of missing context fields")


class SimulationScenario(BaseModel):
    """Individual scenario for simulation testing."""

    scenario_name: str = Field(..., description="Label or name of the test scenario")
    payment: PaymentAnalysisRequest = Field(..., description="Payment data payload")


class SimulationRequest(BaseModel):
    """Batch simulation request for portfolio demonstrations."""

    scenarios: List[SimulationScenario] = Field(..., min_length=1, description="List of payment scenarios to evaluate")
