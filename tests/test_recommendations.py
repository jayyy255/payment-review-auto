"""Unit tests for RecommendationEngine workflow routing."""

from app.models.enums import PriorityLevel, RecommendationType, RiskLevel, SeverityLevel
from app.models.responses import RiskIndicator
from app.services.recommendation_engine import RecommendationEngine


def test_low_risk_recommendation():
    """Test low risk routes straight to normal processing."""
    rec, review_req, priority, actions = RecommendationEngine.generate_recommendation(
        risk_score=0.10,
        risk_level=RiskLevel.LOW_RISK,
        indicators=[],
        missing_fields=[],
    )
    assert rec == RecommendationType.PROCEED_TO_NORMAL_PROCESSING
    assert review_req is False
    assert priority == PriorityLevel.LOW
    assert len(actions) > 0


def test_insufficient_information_recommendation():
    """Test missing context routes to request additional information."""
    rec, review_req, priority, actions = RecommendationEngine.generate_recommendation(
        risk_score=0.20,
        risk_level=RiskLevel.INSUFFICIENT_INFORMATION,
        indicators=[
            RiskIndicator(
                code="INSUFFICIENT_CONTEXT",
                severity=SeverityLevel.MEDIUM,
                message="Missing customer history",
            )
        ],
        missing_fields=["customer_average_amount"],
    )
    assert rec == RecommendationType.REQUEST_ADDITIONAL_INFORMATION
    assert review_req is True
    assert priority == PriorityLevel.MEDIUM
    assert any("customer_average_amount" in a for a in actions)


def test_high_risk_escalate_recommendation():
    """Test critical or severe score routes to escalation with urgent priority."""
    rec, review_req, priority, actions = RecommendationEngine.generate_recommendation(
        risk_score=0.90,
        risk_level=RiskLevel.HIGH_RISK,
        indicators=[
            RiskIndicator(
                code="AMOUNT_SPIKE",
                severity=SeverityLevel.HIGH,
                message="Spike",
            ),
            RiskIndicator(
                code="NEW_BENEFICIARY",
                severity=SeverityLevel.MEDIUM,
                message="New ben",
            ),
        ],
        missing_fields=[],
    )
    assert rec == RecommendationType.ESCALATE_FOR_INVESTIGATION
    assert review_req is True
    assert priority == PriorityLevel.URGENT
    assert any("Escalate" in a for a in actions)
