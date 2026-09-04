# Sample Case Walkthroughs

This document presents three end-to-end operational scenarios demonstrating the system's behavior across low-risk, high-risk, and incomplete-data situations.

---

## Case 1: Low-Risk Routine Payment

### Scenario Overview
A customer initiates a regular monthly payment to a known utility provider in the same country.

### Request Payload (`POST /api/v1/payments/analyze`)
```json
{
  "payment_id": "pay-sample-low-001",
  "customer_id": "cust-9001",
  "amount": 450.00,
  "currency": "USD",
  "beneficiary_id": "ben-regular-12",
  "beneficiary_country": "US",
  "customer_country": "US",
  "transaction_timestamp": "2026-03-01T14:30:00Z",
  "payment_channel": "online",
  "customer_average_amount": 500.00,
  "customer_transaction_count": 120,
  "recent_transaction_count": 2,
  "previous_beneficiary": true,
  "previous_beneficiary_count": 24
}
```

### Risk Evaluation & API Response
```json
{
  "success": true,
  "payment_id": "pay-sample-low-001",
  "customer_id": "cust-9001",
  "risk_score": 0.0,
  "risk_level": "low_risk",
  "recommendation": "proceed_to_normal_processing",
  "review_required": false,
  "risk_indicators": [],
  "missing_information": [],
  "explanation": "Payment matches standard historical customer behavior with no elevated risk indicators detected. Recommended for straight-through automated processing.",
  "model_version": "rule-based-v1"
}
```

### Operational Workflow Outcome
- **Power Automate Action**: Releases payment immediately to core banking rails.
- **Dataverse Record**: Status set to `Released`. No human case created.

---

## Case 2: High-Risk Anomaly Payment

### Scenario Overview
A customer initiates an international wire of \$48,000 to Singapore (historical average is \$1,200), with a first-time beneficiary and an elevated 24-hour transaction frequency.

### Request Payload (`POST /api/v1/payments/analyze`)
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

### Risk Evaluation & API Response
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
  "explanation": "The payment presents severe risk factors: unusually high transaction amount compared to customer baseline, beneficiary is new with no prior transaction history, cross-border destination mismatch, sudden acceleration in transaction frequency, high-risk transaction origination channel. Immediate escalation for specialized financial crime investigation is recommended.",
  "model_version": "rule-based-v1"
}
```

### Operational Workflow Outcome
- **Power Automate Action**: Halts transaction; creates Dataverse Case (`CASE-2026-0002`, Priority: `Urgent`).
- **Teams Alert**: Dispatches Adaptive Card to the Financial Crime Investigation unit.
- **Checklist Provided**:
  1. Confirm transaction amount legitimacy via secondary contact channel.
  2. Verify beneficiary account age and sanctions screening.
  3. Investigate account takeover indicators.

---

## Case 3: Incomplete Context Payment

### Scenario Overview
A transaction arrives from an external batch feed where customer historical spending profile has not yet synchronized.

### Request Payload (`POST /api/v1/payments/analyze`)
```json
{
  "payment_id": "pay-sample-missing-006",
  "customer_id": "cust-9006",
  "amount": 7500.00,
  "currency": "USD",
  "beneficiary_id": "ben-unknown-11",
  "beneficiary_country": "US",
  "customer_country": "US",
  "transaction_timestamp": "2026-03-02T18:00:00Z",
  "payment_channel": "online",
  "customer_average_amount": null,
  "customer_transaction_count": null,
  "recent_transaction_count": null,
  "previous_beneficiary": null,
  "previous_beneficiary_count": null
}
```

### Risk Evaluation & API Response
```json
{
  "success": true,
  "payment_id": "pay-sample-missing-006",
  "customer_id": "cust-9006",
  "risk_score": 0.20,
  "risk_level": "insufficient_information",
  "recommendation": "request_additional_information",
  "review_required": true,
  "risk_indicators": [
    {
      "code": "MISSING_AMOUNT_HISTORY",
      "severity": "medium",
      "message": "Customer average amount is unavailable; baseline amount risk cannot be verified."
    },
    {
      "code": "NEW_BENEFICIARY",
      "severity": "medium",
      "message": "Beneficiary account has no prior transaction history with this customer."
    },
    {
      "code": "INSUFFICIENT_CONTEXT",
      "severity": "medium",
      "message": "Key customer context is missing (customer_average_amount, customer_transaction_count, previous_beneficiary, recent_transaction_count). Accurate risk scoring cannot be performed without further data."
    }
  ],
  "missing_information": [
    "customer_average_amount",
    "customer_transaction_count",
    "previous_beneficiary",
    "recent_transaction_count"
  ],
  "explanation": "Evaluation is inconclusive due to missing customer context (customer_average_amount, customer_transaction_count, previous_beneficiary, recent_transaction_count). Recommendation is to request additional information before re-evaluating or releasing the payment.",
  "model_version": "rule-based-v1"
}
```

### Operational Workflow Outcome
- **Power Automate Action**: Flags case as `Information Requested`.
- **Automated Trigger**: Queries secondary core banking data store or notifies account officer to refresh customer KYC context.
