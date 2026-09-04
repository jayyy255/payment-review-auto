"""Unit tests for RiskEngine transparent scoring logic."""

from app.config import Settings
from app.models.enums import RiskLevel, SeverityLevel
from app.services.risk_engine import RiskEngine


def test_transparent_amount_spike_high(test_settings: Settings):
    """Test high amount anomaly scoring and indicator generation."""
    engine = RiskEngine(test_settings)
    features = {
        "amount_to_average_ratio": 15.0,
        "new_beneficiary_indicator": 0,
        "country_mismatch_indicator": 0,
        "recent_activity_spike": 0,
        "unusual_channel_indicator": 0,
        "customer_history_completeness": 1.0,
    }
    score, risk_level, components, indicators = engine.evaluate_risk(features, [])

    assert score >= 0.35  # weight_amount_spike is 0.35
    amount_comp = next(c for c in components if c.feature == "amount_to_average_ratio")
    assert amount_comp.contribution == 0.35

    spike_ind = next(ind for ind in indicators if ind.code == "AMOUNT_SPIKE")
    assert spike_ind.severity == SeverityLevel.HIGH


def test_multiple_moderate_risk_indicators_aggregation(test_settings: Settings):
    """Test that multiple moderate indicators accumulate to high risk."""
    engine = RiskEngine(test_settings)
    # Spike (0.35) + New Ben (0.20) + Country Mismatch (0.15) = 0.70 (High Risk)
    features = {
        "amount_to_average_ratio": 12.0,
        "new_beneficiary_indicator": 1,
        "country_mismatch_indicator": 1,
        "recent_activity_spike": 0,
        "unusual_channel_indicator": 0,
        "customer_history_completeness": 1.0,
    }
    score, risk_level, components, indicators = engine.evaluate_risk(features, [])

    assert score == 0.70
    assert risk_level == RiskLevel.HIGH_RISK
    assert len(indicators) == 3


def test_insufficient_information_classification(test_settings: Settings):
    """Test that severe missing context yields INSUFFICIENT_INFORMATION."""
    engine = RiskEngine(test_settings)
    features = {
        "amount_to_average_ratio": None,
        "new_beneficiary_indicator": 1,
        "country_mismatch_indicator": 0,
        "recent_activity_spike": 0,
        "unusual_channel_indicator": 0,
        "customer_history_completeness": 0.2,
    }
    score, risk_level, _, indicators = engine.evaluate_risk(
        features, ["customer_average_amount", "customer_transaction_count"]
    )

    assert risk_level == RiskLevel.INSUFFICIENT_INFORMATION
    assert any(ind.code == "INSUFFICIENT_CONTEXT" for ind in indicators)
