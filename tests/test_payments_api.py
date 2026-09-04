"""Integration and API tests for full payment analysis and simulation."""

from fastapi.testclient import TestClient


def test_analyze_low_risk_payment(client: TestClient, low_risk_payload: dict):
    """Test full pipeline for low-risk payment."""
    response = client.post("/api/v1/payments/analyze", json=low_risk_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["payment_id"] == low_risk_payload["payment_id"]
    assert data["risk_level"] == "low_risk"
    assert data["recommendation"] == "proceed_to_normal_processing"
    assert data["review_required"] is False
    assert len(data["risk_indicators"]) == 0
    assert "explanation" in data


def test_analyze_high_risk_payment(client: TestClient, high_risk_spike_payload: dict):
    """Test full pipeline for high-risk payment."""
    response = client.post("/api/v1/payments/analyze", json=high_risk_spike_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["risk_score"] >= 0.70
    assert data["risk_level"] == "high_risk"
    assert data["review_required"] is True
    assert len(data["risk_indicators"]) >= 2
    indicator_codes = [ind["code"] for ind in data["risk_indicators"]]
    assert "AMOUNT_SPIKE" in indicator_codes
    assert "NEW_BENEFICIARY" in indicator_codes


def test_features_endpoint(client: TestClient, low_risk_payload: dict):
    """Test standalone features endpoint."""
    response = client.post("/api/v1/payments/features", json=low_risk_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "features" in data
    assert data["features"]["amount_to_average_ratio"] is not None


def test_score_endpoint(client: TestClient):
    """Test standalone scoring endpoint."""
    payload = {
        "payment_id": "pay-score-test",
        "features": {
            "amount_to_average_ratio": 12.0,
            "new_beneficiary_indicator": 1,
            "country_mismatch_indicator": 1,
            "recent_activity_spike": 0,
            "unusual_channel_indicator": 0,
        },
    }
    response = client.post("/api/v1/payments/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["risk_score"] == 0.70
    assert len(data["score_components"]) > 0


def test_recommendation_endpoint(client: TestClient):
    """Test standalone recommendation endpoint."""
    payload = {
        "payment_id": "pay-rec-test",
        "risk_score": 0.75,
        "risk_level": "high_risk",
        "risk_indicators": [
            {
                "code": "AMOUNT_SPIKE",
                "severity": "high",
                "message": "Amount spike detected",
            }
        ],
        "missing_information": [],
    }
    response = client.post("/api/v1/payments/recommendation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["review_required"] is True
    assert len(data["required_actions"]) > 0


def test_simulation_endpoint(client: TestClient, low_risk_payload: dict, high_risk_spike_payload: dict):
    """Test batch scenario simulation endpoint."""
    payload = {
        "scenarios": [
            {"scenario_name": "Low Risk Scenario", "payment": low_risk_payload},
            {"scenario_name": "High Risk Scenario", "payment": high_risk_spike_payload},
        ]
    }
    response = client.post("/api/v1/payments/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_scenarios"] == 2
    assert len(data["results"]) == 2


def test_risk_rules_catalog_endpoint(client: TestClient):
    """Test risk rules inspection endpoint."""
    response = client.get("/api/v1/risk-rules")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["active_rules_count"] >= 5
