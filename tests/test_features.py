"""Unit tests for FeatureEngine calculation logic."""

from app.models.requests import PaymentAnalysisRequest
from app.services.feature_engine import FeatureEngine


def test_amount_to_average_ratio_calculation():
    """Test accurate ratio computation."""
    payload = PaymentAnalysisRequest(
        payment_id="pay-1",
        customer_id="cust-1",
        amount=15000.0,
        currency="USD",
        beneficiary_id="ben-1",
        beneficiary_country="US",
        customer_country="US",
        transaction_timestamp="2026-01-01T00:00:00Z",
        customer_average_amount=1500.0,
    )
    features, missing = FeatureEngine.calculate_features(payload)
    assert features["amount_to_average_ratio"] == 10.0
    assert "customer_average_amount" not in missing


def test_new_beneficiary_indicator():
    """Test new beneficiary detection logic."""
    # When previous_beneficiary is False
    req1 = PaymentAnalysisRequest(
        payment_id="pay-1",
        customer_id="cust-1",
        amount=500.0,
        currency="USD",
        beneficiary_id="ben-1",
        beneficiary_country="US",
        customer_country="US",
        transaction_timestamp="2026-01-01T00:00:00Z",
        previous_beneficiary=False,
    )
    features1, _ = FeatureEngine.calculate_features(req1)
    assert features1["new_beneficiary_indicator"] == 1

    # When previous_beneficiary is True
    req2 = PaymentAnalysisRequest(
        payment_id="pay-2",
        customer_id="cust-1",
        amount=500.0,
        currency="USD",
        beneficiary_id="ben-1",
        beneficiary_country="US",
        customer_country="US",
        transaction_timestamp="2026-01-01T00:00:00Z",
        previous_beneficiary=True,
    )
    features2, _ = FeatureEngine.calculate_features(req2)
    assert features2["new_beneficiary_indicator"] == 0


def test_country_mismatch_indicator():
    """Test cross-border geography mismatch detection."""
    req_mismatch = PaymentAnalysisRequest(
        payment_id="pay-1",
        customer_id="cust-1",
        amount=500.0,
        currency="USD",
        beneficiary_id="ben-1",
        beneficiary_country="GB",
        customer_country="IN",
        transaction_timestamp="2026-01-01T00:00:00Z",
    )
    features, _ = FeatureEngine.calculate_features(req_mismatch)
    assert features["country_mismatch_indicator"] == 1
    assert features["origin_country"] == "IN"
    assert features["destination_country"] == "GB"


def test_missing_features_tracking():
    """Test that missing context is properly logged and completeness scored."""
    req_sparse = PaymentAnalysisRequest(
        payment_id="pay-sparse",
        customer_id="cust-sparse",
        amount=100.0,
        currency="USD",
        beneficiary_id="ben-sparse",
        beneficiary_country="US",
        customer_country="US",
        transaction_timestamp="2026-01-01T00:00:00Z",
    )
    features, missing = FeatureEngine.calculate_features(req_sparse)
    assert "customer_average_amount" in missing
    assert "customer_transaction_count" in missing
    assert features["customer_history_completeness"] == 0.0
