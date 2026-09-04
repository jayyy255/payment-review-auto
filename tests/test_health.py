"""Unit and API tests for health and version endpoints."""

from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test GET /health returns status healthy."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_version_endpoint(client: TestClient):
    """Test GET /api/v1/version returns service metadata."""
    response = client.get("/api/v1/version")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "version" in data
    assert data["model_version"] == "rule-based-v1"
    assert data["environment"] == "test"
