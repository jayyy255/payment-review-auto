"""Error handling, input validation, and boundary tests."""

from fastapi.testclient import TestClient


def test_negative_amount_validation_error(client: TestClient, low_risk_payload: dict):
    """Test that negative amount returns 422 with structured error response."""
    payload = {**low_risk_payload, "amount": -50.00}
    response = client.post("/api/v1/payments/analyze", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "VALIDATION_ERROR"
    assert "details" in data


def test_zero_amount_validation_error(client: TestClient, low_risk_payload: dict):
    """Test that zero amount is rejected."""
    payload = {**low_risk_payload, "amount": 0.0}
    response = client.post("/api/v1/payments/analyze", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_invalid_currency_code(client: TestClient, low_risk_payload: dict):
    """Test that invalid currency string is rejected."""
    payload = {**low_risk_payload, "currency": "INVALID_CURRENCY"}
    response = client.post("/api/v1/payments/analyze", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_invalid_iso_timestamp(client: TestClient, low_risk_payload: dict):
    """Test that non-ISO timestamp is rejected."""
    payload = {**low_risk_payload, "transaction_timestamp": "yesterday-at-noon"}
    response = client.post("/api/v1/payments/analyze", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_missing_payment_id(client: TestClient, low_risk_payload: dict):
    """Test that missing payment_id returns 422."""
    payload = {**low_risk_payload}
    del payload["payment_id"]
    response = client.post("/api/v1/payments/analyze", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_empty_request_body(client: TestClient):
    """Test that empty payload is rejected with 422."""
    response = client.post("/api/v1/payments/analyze", json={})
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_insufficient_information_graceful_handling(client: TestClient, missing_context_payload: dict):
    """Test that incomplete context payload processes successfully to INSUFFICIENT_INFORMATION."""
    response = client.post("/api/v1/payments/analyze", json=missing_context_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["risk_level"] == "insufficient_information"
    assert data["recommendation"] == "request_additional_information"
    assert data["review_required"] is True
    assert len(data["missing_information"]) > 0
