# Power Automate Integration Guide

This guide explains how to integrate the **Payment Review Automation API** into a **Microsoft Power Automate Cloud Flow** and connect it with **Microsoft Dataverse**.

---

## 1. End-to-End Flow Design

```
+-------------------------------------------------------------+
| Step 1: Trigger - When a new Payment Transaction is added    |
|         (Dataverse / Webhook / Service Bus)                 |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Step 2: Retrieve Context - Get Customer row & history       |
|         (Dataverse "Get row by ID" / Aggregation Flow)      |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Step 3: HTTP Action - Call Python Risk Analysis API         |
|         POST http://<api-url>/api/v1/payments/analyze       |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Step 4: Parse JSON - Parse response schema                  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Step 5: Switch on body('Parse_JSON')?['recommendation']     |
+-------------------------------------------------------------+
      |                       |                       |
      v                       v                       v
+------------------+  +------------------+  +--------------------+
| Case A: Proceed  |  | Case B: Info Req |  | Case C: Review/Esc |
| Update Status to |  | Create Task &    |  | Create Dataverse   |
| "Approved"       |  | Send Email Alert |  | Case + Teams Card  |
+------------------+  +------------------+  +--------------------+
                              |
                              v
+-------------------------------------------------------------+
| Step 6: Insert Risk Assessment & Audit Log into Dataverse   |
+-------------------------------------------------------------+
```

---

## 2. Step-by-Step Flow Configuration

### Step 1: Trigger
- **Connector**: Microsoft Dataverse
- **Trigger**: *When an action is performed / When a row is added, modified or deleted*
- **Table Name**: `Payment Transactions` (`cr_payment_transaction`)
- **Scope**: Organization

### Step 2: Context Retrieval
1. Add action **Get row by ID** from Dataverse:
   - Table: `Customers`
   - Row ID: `triggerOutputs()?['body/_customer_id_value']`
2. Extract `customer_average_amount`, `customer_transaction_count`, and `customer_country`.

### Step 3: HTTP Action Calling Python API
- **Action**: **HTTP**
- **Method**: `POST`
- **URI**: `https://<your-backend-domain>/api/v1/payments/analyze`
- **Headers**:
  - `Content-Type`: `application/json`
  - `X-API-Key`: `@{parameters('API_KEY')}` (if enabled)
- **Body**:
```json
{
  "payment_id": "@{triggerOutputs()?['body/cr_payment_id']}",
  "customer_id": "@{triggerOutputs()?['body/_cr_customer_id_value']}",
  "amount": @{triggerOutputs()?['body/cr_amount']},
  "currency": "@{triggerOutputs()?['body/cr_currency']}",
  "beneficiary_id": "@{triggerOutputs()?['body/cr_beneficiary_id']}",
  "beneficiary_country": "@{triggerOutputs()?['body/cr_beneficiary_country']}",
  "customer_country": "@{body('Get_Customer_Row')?['cr_country']}",
  "transaction_timestamp": "@{triggerOutputs()?['body/createdon']}",
  "payment_channel": "@{triggerOutputs()?['body/cr_channel']}",
  "customer_average_amount": @{body('Get_Customer_Row')?['cr_average_amount']},
  "customer_transaction_count": @{body('Get_Customer_Row')?['cr_transaction_count']},
  "recent_transaction_count": @{outputs('Get_Recent_Transactions_Count')},
  "previous_beneficiary": @{outputs('Check_Previous_Beneficiary_Boolean')},
  "previous_beneficiary_count": @{outputs('Get_Previous_Beneficiary_Count')}
}
```

---

### Step 4: Parse JSON Action
- **Content**: `@{body('HTTP')}`
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "payment_id": { "type": "string" },
    "customer_id": { "type": "string" },
    "risk_score": { "type": "number" },
    "risk_level": { "type": "string" },
    "recommendation": { "type": "string" },
    "review_required": { "type": "boolean" },
    "risk_indicators": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "code": { "type": "string" },
          "severity": { "type": "string" },
          "message": { "type": "string" }
        }
      }
    },
    "missing_information": {
      "type": "array",
      "items": { "type": "string" }
    },
    "explanation": { "type": "string" },
    "model_version": { "type": "string" }
  }
}
```

---

### Step 5: Switch on Recommendation

Add a **Switch** control evaluating:
`body('Parse_JSON')?['recommendation']`

#### Branch 1: `proceed_to_normal_processing`
1. Update `Payment Transactions` status to `Released for Processing`.
2. Insert Dataverse `Audit Log` record: `Action: Auto-Approved via Low Risk Assessment`.

#### Branch 2: `request_additional_information`
1. Create a row in `Payment Review Cases` (Status: `Information Requested`).
2. Send automated email notification to relationship manager requesting customer documentation.

#### Branch 3: `create_human_review_case` & `escalate_for_investigation`
1. Create a row in `Payment Review Cases` (Status: `Under Review`, Priority: `body('Parse_JSON')?['risk_level']`).
2. Post Adaptive Card to Microsoft Teams Compliance Channel:
   - Case ID, Payment ID, Amount, Currency.
   - Risk Score & Risk Indicators.
   - Action Buttons: `Approve`, `Request Info`, `Escalate`.
3. Wait for Reviewer Action and log the decision back into Dataverse `Review Decisions` and `Audit Logs`.
