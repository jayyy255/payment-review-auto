"""Pytest fixtures and configuration."""

import pytest
from fastapi.testclient import TestClient
from app.config import Settings, get_settings
from app.main import app
from app.models.requests import PaymentAnalysisRequest


@pytest.fixture
def test_settings() -> Settings:
    """Return test settings with known deterministic thresholds."""
    return Settings(
        app_name="payment-review-automation-test",
        app_version="0.1.0-test",
        environment="test",
        api_key_enabled=False,
        amount_ratio_medium_threshold=3.0,
        amount_ratio_high_threshold=10.0,
        frequency_spike_threshold=2.5,
        medium_risk_threshold=0.40,
        high_risk_threshold=0.70,
        weight_amount_spike=0.35,
        weight_new_beneficiary=0.20,
        weight_country_mismatch=0.15,
        weight_frequency_spike=0.20,
        weight_unusual_channel=0.10,
    )


@pytest.fixture
def client(test_settings: Settings) -> TestClient:
    """Return FastAPI test client with injected test settings."""
    app.dependency_overrides[get_settings] = lambda: test_settings
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def low_risk_payload() -> dict:
    """Low-risk typical payment scenario."""
    return {
        "payment_id": "pay-low-001",
        "customer_id": "cust-101",
        "amount": 250.00,
        "currency": "USD",
        "beneficiary_id": "ben-regular-44",
        "beneficiary_country": "US",
        "customer_country": "US",
        "transaction_timestamp": "2026-03-01T14:20:00Z",
        "payment_channel": "online",
        "customer_average_amount": 300.00,
        "customer_transaction_count": 45,
        "recent_transaction_count": 1,
        "previous_beneficiary": True,
        "previous_beneficiary_count": 12,
    }


@pytest.fixture
def high_risk_spike_payload() -> dict:
    """High-risk payment with amount spike and new beneficiary."""
    return {
        "payment_id": "pay-high-002",
        "customer_id": "cust-202",
        "amount": 35000.00,
        "currency": "USD",
        "beneficiary_id": "ben-new-88",
        "beneficiary_country": "SG",
        "customer_country": "US",
        "transaction_timestamp": "2026-03-02T09:15:00Z",
        "payment_channel": "wire",
        "customer_average_amount": 1000.00,
        "customer_transaction_count": 60,
        "recent_transaction_count": 15,
        "previous_beneficiary": False,
        "previous_beneficiary_count": 0,
    }


@pytest.fixture
def missing_context_payload() -> dict:
    """Payload missing baseline customer history."""
    return {
        "payment_id": "pay-missing-003",
        "customer_id": "cust-new-999",
        "amount": 5000.00,
        "currency": "EUR",
        "beneficiary_id": "ben-777",
        "beneficiary_country": "DE",
        "customer_country": "DE",
        "transaction_timestamp": "2026-03-03T11:00:00Z",
        "payment_channel": "online",
        "customer_average_amount": None,
        "customer_transaction_count": None,
        "recent_transaction_count": None,
        "previous_beneficiary": None,
        "previous_beneficiary_count": None,
    }
