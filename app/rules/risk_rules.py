"""Risk rule definitions and rule catalog for the payment risk engine."""

from typing import Any, Dict, List
from app.config import Settings


def get_rule_catalog(settings: Settings) -> List[Dict[str, Any]]:
    """Return the active rulebook definitions, descriptions, weights, and thresholds."""
    return [
        {
            "code": "AMOUNT_SPIKE",
            "name": "Payment Amount Anomaly",
            "category": "anomaly_detection",
            "description": "Compares current transaction amount against historical customer average.",
            "weight": settings.weight_amount_spike,
            "thresholds": {
                "low": f"ratio < {settings.amount_ratio_medium_threshold}",
                "medium": f"{settings.amount_ratio_medium_threshold} <= ratio < {settings.amount_ratio_high_threshold}",
                "high": f"ratio >= {settings.amount_ratio_high_threshold}",
            },
            "enabled": True,
        },
        {
            "code": "NEW_BENEFICIARY",
            "name": "First-time Beneficiary Encounter",
            "category": "relationship_risk",
            "description": "Flags transactions directed to a beneficiary never previously transacted with.",
            "weight": settings.weight_new_beneficiary,
            "thresholds": {
                "medium": "previous_beneficiary == false or previous_beneficiary_count == 0"
            },
            "enabled": True,
        },
        {
            "code": "COUNTRY_MISMATCH",
            "name": "Cross-Border Geography Mismatch",
            "category": "geographical_risk",
            "description": "Identifies cross-border transfers where beneficiary country differs from customer domicile.",
            "weight": settings.weight_country_mismatch,
            "thresholds": {
                "medium": "beneficiary_country != customer_country"
            },
            "enabled": True,
        },
        {
            "code": "VELOCITY_SPIKE",
            "name": "Transaction Frequency Spike",
            "category": "velocity_risk",
            "description": "Detects sudden surges in recent transaction volume compared to baseline activity.",
            "weight": settings.weight_frequency_spike,
            "thresholds": {
                "medium": f"recent_to_avg_ratio >= {settings.frequency_spike_threshold}"
            },
            "enabled": True,
        },
        {
            "code": "UNUSUAL_CHANNEL",
            "name": "High-Risk or Unaccustomed Channel",
            "category": "channel_risk",
            "description": "Evaluates risks associated with urgent wire or unverified remote channels.",
            "weight": settings.weight_unusual_channel,
            "thresholds": {
                "low_medium": "channel in ['wire', 'international_wire', 'crypto_ramp']"
            },
            "enabled": True,
        },
        {
            "code": "MISSING_CONTEXT",
            "name": "Incomplete Customer Context",
            "category": "governance_risk",
            "description": "Triggers review when critical historical fields (average amount, transaction count) are absent.",
            "weight": 0.0,
            "thresholds": {
                "warning": "customer_average_amount is null or customer_transaction_count is null"
            },
            "enabled": True,
        },
    ]
