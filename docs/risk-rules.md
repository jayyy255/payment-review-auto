# Risk Rules & Scoring Logic Catalog

## 1. Risk Engine Philosophy

The risk engine is built on **explainable, deterministic decision-support logic**:
- Normalized risk score in range `[0.0, 1.0]`.
- Explicit component weighting (no hidden bias).
- Missing data is treated with caution (lowers confidence, triggers `INSUFFICIENT_INFORMATION`) rather than blindly assuming zero risk.
- High risk triggers **human review or escalation**, never an irreversible automated rejection.

---

## 2. Rule Catalog

### Rule A: Payment Amount Anomaly (`AMOUNT_SPIKE`)
- **Category**: Anomaly Detection
- **Config Weight**: `0.35`
- **Formula**:
  $$\text{Ratio} = \frac{\text{Current Transaction Amount}}{\text{Customer Historical Average Amount}}$$
- **Evaluation**:
  - If $\text{Ratio} < 3.0$: Contribution = $0.00$, Severity = Low (Normal).
  - If $3.0 \le \text{Ratio} < 10.0$: Contribution = $\text{Weight} \times 0.6 = 0.21$, Severity = Medium.
  - If $\text{Ratio} \ge 10.0$: Contribution = $\text{Weight} \times 1.0 = 0.35$, Severity = High.
- **Missing Baseline**: If `customer_average_amount` is missing, flags `MISSING_AMOUNT_HISTORY`.

---

### Rule B: First-Time Beneficiary Encounter (`NEW_BENEFICIARY`)
- **Category**: Relationship Risk
- **Config Weight**: `0.20`
- **Formula**:
  $$\text{NewBen} = \begin{cases} 1 & \text{if } \text{previous\_beneficiary} = \text{False} \lor \text{previous\_beneficiary\_count} = 0 \\ 0 & \text{otherwise} \end{cases}$$
- **Evaluation**:
  - If $\text{NewBen} = 1$: Contribution = $0.20$, Severity = Medium.
  - If $\text{NewBen} = 0$: Contribution = $0.00$.

---

### Rule C: Cross-Border Geography Mismatch (`COUNTRY_MISMATCH`)
- **Category**: Geographical Risk
- **Config Weight**: `0.15`
- **Formula**:
  $$\text{Mismatch} = \begin{cases} 1 & \text{if } \text{customer\_country} \neq \text{beneficiary\_country} \\ 0 & \text{otherwise} \end{cases}$$
- **Evaluation**:
  - If $\text{Mismatch} = 1$: Contribution = $0.15$, Severity = Medium.
  - Does not automatically condemn the payment; acts as a moderate indicator when combined with other flags.

---

### Rule D: Velocity & Frequency Spike (`VELOCITY_SPIKE`)
- **Category**: Behavioral / Velocity Risk
- **Config Weight**: `0.20`
- **Formula**:
  $$\text{Daily Baseline} = \max\left(\frac{\text{Customer Lifetime Count}}{30}, 1.0\right)$$
  $$\text{Velocity Ratio} = \frac{\text{Recent Count (24h)}}{\text{Daily Baseline}}$$
- **Evaluation**:
  - If $\text{Velocity Ratio} \ge 2.5$: Contribution = $0.20$, Severity = Medium (High if Ratio $> 5.0$).

---

### Rule E: High-Risk Channel Usage (`HIGH_RISK_CHANNEL`)
- **Category**: Channel Risk
- **Config Weight**: `0.10`
- **Evaluation**:
  - Triggered if `payment_channel` in `['wire', 'international_wire', 'crypto_ramp', 'emergency_cash']`.
  - Contribution = $0.10$, Severity = Low/Medium.

---

## 3. Score Thresholds and Risk Levels

| Score Range | Risk Level | Workflow Recommendation | Review Required | Default Priority |
| :--- | :--- | :--- | :--- | :--- |
| `0.00 - 0.39` | `low_risk` | `proceed_to_normal_processing` | No | Low |
| `0.40 - 0.69` | `medium_risk` | `create_human_review_case` | Yes | Medium |
| `0.70 - 0.84` | `high_risk` | `create_human_review_case` | Yes | High |
| `0.85 - 1.00` | `high_risk` | `escalate_for_investigation` | Yes | Urgent |
| N/A | `insufficient_information` | `request_additional_information` | Yes | Medium |

---

## 4. How to Tune Rules via Environment Variables

All thresholds and weights are dynamically configurable in `.env` without modifying application code:

```env
AMOUNT_RATIO_MEDIUM_THRESHOLD=3.0
AMOUNT_RATIO_HIGH_THRESHOLD=10.0
FREQUENCY_SPIKE_THRESHOLD=2.5
MEDIUM_RISK_THRESHOLD=0.40
HIGH_RISK_THRESHOLD=0.70

WEIGHT_AMOUNT_SPIKE=0.35
WEIGHT_NEW_BENEFICIARY=0.20
WEIGHT_COUNTRY_MISMATCH=0.15
WEIGHT_FREQUENCY_SPIKE=0.20
WEIGHT_UNUSUAL_CHANNEL=0.10
```
