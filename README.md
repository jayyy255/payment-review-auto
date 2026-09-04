# Payment Review Automation

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2-E92063.svg)](https://docs.pydantic.dev/)
[![Tests](https://img.shields.io/badge/Tests-26%20Passed-success.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, explainable decision-support backend for financial payment review and operational workflow routing in banking and fintech environments.

---

## 1. Business Problem

Financial institutions process thousands of payment transactions daily. When potential anomalies or risk factors appear—such as unexpected amounts, new beneficiaries, foreign jurisdictions, or rapid velocity surges—manual review can become a significant operational bottleneck.

Reviewers typically spend critical minutes gathering context across disparate legacy systems before deciding whether a transaction should be:
1. **Approved for normal processing**
2. **Sent for additional customer information**
3. **Assigned to a compliance officer for human review**
4. **Escalated to specialized financial crime/AML teams**

---

## 2. Project Overview & Objectives

**Payment Review Automation** bridges the gap between raw transaction events and operational workflow decisions. It acts as an **intelligent decision-support system**, not an autonomous execution black-box.

### Key Objectives:
- **Stateless Feature Calculation**: Calculate statistical and behavioral ratios (e.g. amount-to-average spikes, velocity changes, cross-border indicators).
- **Explainable Rule-Based Risk Engine**: Compute normalized risk scores (`0.0` to `1.0`) with transparent score contribution breakdowns.
- **Workflow Recommendation Generation**: Map risk indicators into actionable routing directives for **Power Automate** and **Microsoft Dataverse**.
- **Human Oversight by Design**: High-risk or data-deficient transactions trigger human review tasks with targeted investigation checklists.
- **Privacy & Security**: Built with structured logging that masks sensitive customer identifiers and enforces strict payload validation.

---

## 3. High-Level Architecture

```
+-----------------------------------------------------------------------------------+
|                              FINANCIAL SERVICE SYSTEM                             |
|                                                                                   |
|  [ Payment Transaction Event ]                                                    |
|                |                                                                  |
|                v                                                                  |
|  [ Power Automate Cloud Flow ] <----+ Context Enrichment                          |
|                |                    | (Core Banking / Historical Dataverse Store) |
|                v                    +---------------------------------------------+
|  [ Python Risk Analysis REST API ]                                                |
|       - Feature Engine                                                            |
|       - Transparent Rule Engine                                                   |
|       - Recommendation Engine                                                     |
|       - Explanation Service                                                       |
|                |                                                                  |
|                v Structured Risk Assessment JSON                                  |
|  [ Power Automate Workflow Branching ]                                            |
|       +-----------------------------+-------------------------------+             |
|       |                             |                               |             |
|       v                             v                               v             |
|  [ Low Risk ]               [ Medium / High Risk ]         [ Missing Context ]    |
|       |                             |                               |             |
|  Straight-Through           Create Dataverse Case          Request Additional     |
|  Processing                 & Teams Review Task            Information            |
|       |                             |                               |             |
|       +-----------------------------+-------------------------------+             |
|                                     |                                             |
|                                     v                                             |
|                         [ Dataverse Audit Trail ]                                 |
+-----------------------------------------------------------------------------------+
```

---

## 4. Technology Stack & Directory Structure

- **Language**: Python 3.11+
- **Web Framework**: FastAPI, Uvicorn
- **Data Validation & Settings**: Pydantic v2, Pydantic-Settings
- **Testing**: Pytest, Pytest-Asyncio, HTTPX
- **Containerization**: Docker, Docker Compose

```
payment-review-auto/
├── README.md                          # Project documentation and quickstart
├── .gitignore                         # Standard Python gitignore
├── .env.example                       # Configurable thresholds template
├── requirements.txt                   # Python dependencies
├── pyproject.toml                     # Build configuration and pytest options
├── Dockerfile                         # Production-ready multi-stage Dockerfile
├── docker-compose.yml                 # Local container orchestration
│
├── app/
│   ├── main.py                        # FastAPI entrypoint and error handlers
│   ├── config.py                      # Pydantic BaseSettings configuration
│   │
│   ├── api/
│   │   └── routes/
│   │       ├── health.py              # /health & /api/v1/version
│   │       ├── payments.py            # /api/v1/payments/analyze, /validate, /risk-rules
│   │       ├── features.py            # /api/v1/payments/features
│   │       ├── scoring.py             # /api/v1/payments/score
│   │       ├── recommendations.py     # /api/v1/payments/recommendation
│   │       └── simulation.py          # /api/v1/payments/simulate
│   │
│   ├── models/
│   │   ├── enums.py                   # RiskLevel, RecommendationType, Severity
│   │   ├── requests.py                # Strict Pydantic input schemas
│   │   ├── responses.py               # Structured output contracts
│   │   └── errors.py                  # Standard error payload
│   │
│   ├── services/
│   │   ├── feature_engine.py          # Mathematical & categorical metrics
│   │   ├── risk_engine.py             # Transparent weighted scoring
│   │   ├── recommendation_engine.py   # Decision-support routing
│   │   └── explanation_service.py     # Human-readable audit narrative
│   │
│   ├── rules/
│   │   └── risk_rules.py              # Rulebook catalog definitions
│   │
│   └── utils/
│       ├── logging.py                 # Structured, privacy-preserving logging
│       └── security.py                # Optional API key authentication
│
├── tests/                             # 26 automated unit & integration tests
│   ├── conftest.py
│   ├── test_health.py
│   ├── test_features.py
│   ├── test_scoring.py
│   ├── test_recommendations.py
│   ├── test_payments_api.py
│   └── test_error_handling.py
│
├── sample_data/                       # Synthetic test payloads
│   ├── low_risk_payment.json
│   ├── high_risk_payment.json
│   ├── new_beneficiary_payment.json
│   ├── country_mismatch_payment.json
│   ├── velocity_spike_payment.json
│   └── missing_context_payment.json
│
└── docs/                              # Deep-dive architecture & integration guides
    ├── architecture.md                # System topology and sequence diagrams
    ├── api-contracts.md               # Complete REST API specification
    ├── risk-rules.md                  # Risk formulas, weights, and calibration
    ├── power-automate-integration.md  # Step-by-step Power Automate flow tutorial
    ├── dataverse-design.md            # Dataverse entity models and schema
    └── sample-case-walkthrough.md     # Walkthroughs of standard payment cases
```

---

## 5. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status check |
| `GET` | `/api/v1/version` | Active service and model versions |
| `POST` | `/api/v1/payments/analyze` | **Primary Endpoint**: Full risk evaluation & recommendation |
| `POST` | `/api/v1/payments/features` | Pure analytical risk feature calculation |
| `POST` | `/api/v1/payments/score` | Feature-based risk score decomposition |
| `POST` | `/api/v1/payments/recommendation` | Workflow routing recommendation generator |
| `POST` | `/api/v1/payments/simulate` | Batch scenario evaluation for portfolio demos |
| `POST` | `/api/v1/payments/validate` | Schema and payload integrity validation |
| `GET` | `/api/v1/risk-rules` | Inspect active rulebook, weights, and thresholds |

---

## 6. Example Request & Response

### Request (`POST /api/v1/payments/analyze`)
```json
{
  "payment_id": "pay-sample-high-002",
  "customer_id": "cust-9002",
  "amount": 48000.00,
  "currency": "USD",
  "beneficiary_id": "ben-intl-99",
  "beneficiary_country": "SG",
  "customer_country": "US",
  "transaction_timestamp": "2026-03-02T08:15:00Z",
  "payment_channel": "wire",
  "customer_average_amount": 1200.00,
  "customer_transaction_count": 80,
  "recent_transaction_count": 18,
  "previous_beneficiary": false,
  "previous_beneficiary_count": 0
}
```

### Response (`200 OK`)
```json
{
  "success": true,
  "payment_id": "pay-sample-high-002",
  "customer_id": "cust-9002",
  "risk_score": 0.90,
  "risk_level": "high_risk",
  "recommendation": "escalate_for_investigation",
  "review_required": true,
  "risk_indicators": [
    {
      "code": "AMOUNT_SPIKE",
      "severity": "high",
      "message": "Payment amount is 40.0x the customer's average historical amount (high anomaly threshold is 10.0x)."
    },
    {
      "code": "NEW_BENEFICIARY",
      "severity": "medium",
      "message": "Beneficiary account has no prior transaction history with this customer."
    },
    {
      "code": "COUNTRY_MISMATCH",
      "severity": "medium",
      "message": "Cross-border transfer detected: Customer country (US) differs from Beneficiary country (SG)."
    },
    {
      "code": "VELOCITY_SPIKE",
      "severity": "high",
      "message": "Sudden surge in transaction volume detected relative to historical baseline."
    },
    {
      "code": "HIGH_RISK_CHANNEL",
      "severity": "low",
      "message": "Payment originated via high-risk or accelerated channel: wire."
    }
  ],
  "missing_information": [],
  "explanation": "The payment presents severe risk factors: ... Immediate escalation for specialized financial crime investigation is recommended.",
  "model_version": "rule-based-v1"
}
```

---

## 7. Local Setup & Execution

### Prerequisites
- Python 3.11+
- Git

### 1. Clone & Setup Environment
```bash
git clone https://github.com/jayyy255/payment-review-auto.git
cd payment-review-auto

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
- Open Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Open ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 4. Run Automated Test Suite
```bash
pytest -v
```

---

## 8. Docker Deployment

### Run with Docker Compose
```bash
docker-compose up --build
```
The service will start on `http://localhost:8000` with automated health checks enabled.

---

## 9. Responsible AI, Governance & Limitations

- **Decision-Support Scope**: This software is an intelligent decision-support and workflow-routing prototype. It does not replace compliance officer judgment or statutory reporting obligations.
- **Synthetic Data**: All test data, scenarios, customer IDs, and transaction references included in this project are strictly synthetic.
- **Explainability First**: Every calculated score provides auditable feature decompositions rather than opaque predictions.
- **Prototype Status**: This system is designed as an architectural portfolio prototype and should be subject to enterprise validation before any production deployment.

---

## 10. Documentation Index

- [System Architecture](docs/architecture.md)
- [API Contracts & Schemas](docs/api-contracts.md)
- [Risk Rules & Calibration Guide](docs/risk-rules.md)
- [Power Automate Integration Tutorial](docs/power-automate-integration.md)
- [Microsoft Dataverse Design](docs/dataverse-design.md)
- [Sample Case Walkthroughs](docs/sample-case-walkthrough.md)