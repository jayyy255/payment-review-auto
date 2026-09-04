# API Contracts Specification

Base URL: `http://localhost:8000` (or configured deployment URL)  
Interactive Documentation: `GET /docs` (Swagger UI) and `GET /redoc` (ReDoc)

---

## 1. Summary of Endpoints

| Method | Endpoint | Description | Primary Consumer |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service health status check | Load Balancer / Monitoring |
| `GET` | `/api/v1/version` | Active service, rule, and environment versions | Operations / Admin |
| `POST` | `/api/v1/payments/analyze` | Full end-to-end payment risk analysis & recommendation | Power Automate |
| `POST` | `/api/v1/payments/features` | Pure analytical feature calculation | Analytics / Test Harness |
| `POST` | `/api/v1/payments/score` | Risk scoring from feature map | Model Evaluation |
| `POST` | `/api/v1/payments/recommendation` | Workflow recommendation mapping | Policy Validation |
| `POST` | `/api/v1/payments/simulate` | Batch multi-scenario evaluation | Portfolio Demos / Testing |
| `GET` | `/api/v1/risk-rules` | Active rulebook, weights, and thresholds catalog | Compliance Governance |

---

## 2. Endpoint Details

### 2.1 `POST /api/v1/payments/analyze`

Main integration endpoint called by Power Automate.

#### Request Schema (`application/json`)
```json
{
  "payment_id": "pay-001",
  "customer_id": "cust-001",
  "amount": 15000.00,
  "currency": "USD",
  "beneficiary_id": "ben-009",
  "beneficiary_country": "GB",
  "customer_country": "IN",
  "transaction_timestamp": "2026-01-15T10:30:00Z",
  "payment_channel": "online",
  "customer_average_amount": 1200.00,
  "customer_transaction_count": 85,
  "recent_transaction_count": 12,
  "previous_beneficiary": false,
  "previous_beneficiary_count": 0,
  "customer_risk_rating": "low",
  "previous_review_notes": "None"
}
```

#### Field Constraints
- `payment_id`: String (1-64 chars, Required)
- `customer_id`: String (1-64 chars, Required)
- `amount`: Number (`> 0.0`, Required)
- `currency`: String (3-letter uppercase ISO 4217, Required)
- `beneficiary_id`: String (1-64 chars, Required)
- `beneficiary_country`: String (2-3 letter ISO country code, Required)
- `customer_country`: String (2-3 letter ISO country code, Required)
- `transaction_timestamp`: String (Valid ISO 8601, Required)
- `payment_channel`: String (e.g. `online`, `wire`, `mobile`, Optional, default: `online`)
- `customer_average_amount`: Number (`>= 0.0`, Optional)
- `customer_transaction_count`: Integer (`>= 0`, Optional)
- `recent_transaction_count`: Integer (`>= 0`, Optional)
- `previous_beneficiary`: Boolean (Optional)
- `previous_beneficiary_count`: Integer (`>= 0`, Optional)

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "payment_id": "pay-001",
  "customer_id": "cust-001",
  "risk_score": 0.70,
  "risk_level": "high_risk",
  "recommendation": "create_human_review_case",
  "review_required": true,
  "risk_indicators": [
    {
      "code": "AMOUNT_SPIKE",
      "severity": "high",
      "message": "Payment amount is 12.5x the customer's average historical amount (high anomaly threshold is 10.0x)."
    },
    {
      "code": "NEW_BENEFICIARY",
      "severity": "medium",
      "message": "Beneficiary account has no prior transaction history with this customer."
    },
    {
      "code": "COUNTRY_MISMATCH",
      "severity": "medium",
      "message": "Cross-border transfer detected: Customer country (IN) differs from Beneficiary country (GB)."
    }
  ],
  "missing_information": [],
  "explanation": "The payment was classified as high risk because of: unusually high transaction amount compared to customer baseline, beneficiary is new with no prior transaction history, cross-border destination mismatch. Human review is required to verify transaction authenticity prior to execution.",
  "model_version": "rule-based-v1"
}
```

---

### 2.2 `POST /api/v1/payments/features`

Calculates isolated feature values.

#### Response (`200 OK`)
```json
{
  "success": true,
  "payment_id": "pay-001",
  "features": {
    "amount_to_average_ratio": 12.5,
    "customer_transaction_count": 85,
    "is_new_customer": 0,
    "new_beneficiary_indicator": 1,
    "beneficiary_history_count": 0,
    "country_mismatch_indicator": 1,
    "origin_country": "IN",
    "destination_country": "GB",
    "unusual_channel_indicator": 0,
    "payment_channel": "online",
    "transaction_frequency_change": 4.23,
    "recent_activity_spike": 1,
    "customer_history_completeness": 1.0
  },
  "missing_fields": []
}
```

---

### 2.3 `POST /api/v1/payments/score`

Computes transparent score breakdown given a feature set.

#### Request (`application/json`)
```json
{
  "payment_id": "pay-001",
  "features": {
    "amount_to_average_ratio": 12.5,
    "new_beneficiary_indicator": 1,
    "country_mismatch_indicator": 1,
    "recent_activity_spike": 0,
    "unusual_channel_indicator": 0
  }
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "payment_id": "pay-001",
  "risk_score": 0.70,
  "risk_level": "high_risk",
  "score_components": [
    {
      "feature": "amount_to_average_ratio",
      "contribution": 0.35,
      "raw_value": 12.5,
      "weight": 0.35
    },
    {
      "feature": "new_beneficiary_indicator",
      "contribution": 0.20,
      "raw_value": 1,
      "weight": 0.20
    },
    {
      "feature": "country_mismatch_indicator",
      "contribution": 0.15,
      "raw_value": 1,
      "weight": 0.15
    }
  ],
  "recommendation": "create_human_review_case",
  "model_version": "rule-based-v1"
}
```

---

### 2.4 Standard Error Contract

All validation and execution failures return a consistent schema with no leaked stack traces.

#### Example `422 Unprocessable Content`
```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request payload format or field constraint violated",
  "details": {
    "validation_errors": [
      {
        "field": "body -> amount",
        "message": "Input should be greater than 0",
        "type": "greater_than"
      }
    ]
  }
}
```
