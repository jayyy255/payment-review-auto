"""Feature calculation engine for payment transactions and customer context."""

from typing import Any, Dict, List, Tuple
from app.models.requests import PaymentAnalysisRequest


class FeatureEngine:
    """Extracts analytical and behavioral risk features from payment payload."""

    @staticmethod
    def calculate_features(request: PaymentAnalysisRequest) -> Tuple[Dict[str, Any], List[str]]:
        """Calculate numerical and categorical features and track missing context fields."""
        features: Dict[str, Any] = {}
        missing_fields: List[str] = []

        # 1. Amount to Average Ratio
        if request.customer_average_amount is not None:
            if request.customer_average_amount > 0:
                features["amount_to_average_ratio"] = round(request.amount / request.customer_average_amount, 4)
            else:
                features["amount_to_average_ratio"] = float("inf") if request.amount > 0 else 1.0
        else:
            features["amount_to_average_ratio"] = None
            missing_fields.append("customer_average_amount")

        # 2. Customer Transaction Count & Completeness
        if request.customer_transaction_count is not None:
            features["customer_transaction_count"] = request.customer_transaction_count
            features["is_new_customer"] = 1 if request.customer_transaction_count < 3 else 0
        else:
            features["customer_transaction_count"] = None
            features["is_new_customer"] = 0
            missing_fields.append("customer_transaction_count")

        # 3. New Beneficiary Indicator
        if request.previous_beneficiary is not None:
            features["new_beneficiary_indicator"] = 0 if request.previous_beneficiary else 1
        elif request.previous_beneficiary_count is not None:
            features["new_beneficiary_indicator"] = 0 if request.previous_beneficiary_count > 0 else 1
        else:
            features["new_beneficiary_indicator"] = 1  # Conservative assumption if unspecified
            missing_fields.append("previous_beneficiary")

        features["beneficiary_history_count"] = (
            request.previous_beneficiary_count if request.previous_beneficiary_count is not None else 0
        )

        # 4. Country Mismatch Indicator
        cust_country = request.customer_country.strip().upper()
        ben_country = request.beneficiary_country.strip().upper()
        features["country_mismatch_indicator"] = 1 if cust_country != ben_country else 0
        features["origin_country"] = cust_country
        features["destination_country"] = ben_country

        # 5. Channel Risk Indicator
        channel = (request.payment_channel or "online").lower()
        high_risk_channels = {"wire", "international_wire", "crypto_ramp", "emergency_cash"}
        features["unusual_channel_indicator"] = 1 if channel in high_risk_channels else 0
        features["payment_channel"] = channel

        # 6. Transaction Frequency / Velocity Spike
        if (
            request.recent_transaction_count is not None
            and request.customer_transaction_count is not None
            and request.customer_transaction_count > 0
        ):
            # Baseline expected daily count: assume average active window of 30 days
            baseline_daily_rate = max(request.customer_transaction_count / 30.0, 1.0)
            velocity_ratio = round(request.recent_transaction_count / baseline_daily_rate, 4)
            features["transaction_frequency_change"] = velocity_ratio
            features["recent_activity_spike"] = 1 if velocity_ratio >= 2.5 else 0
        elif request.recent_transaction_count is not None:
            features["transaction_frequency_change"] = None
            features["recent_activity_spike"] = 1 if request.recent_transaction_count >= 10 else 0
        else:
            features["transaction_frequency_change"] = None
            features["recent_activity_spike"] = 0
            missing_fields.append("recent_transaction_count")

        # 7. Customer History Completeness Score (0.0 to 1.0)
        expected_context_items = [
            request.customer_average_amount is not None,
            request.customer_transaction_count is not None,
            request.recent_transaction_count is not None,
            request.previous_beneficiary is not None or request.previous_beneficiary_count is not None,
        ]
        completeness = sum(1 for item in expected_context_items if item) / len(expected_context_items)
        features["customer_history_completeness"] = round(completeness, 2)

        return features, missing_fields
