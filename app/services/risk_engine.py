"""Transparent and explainable risk calculation engine."""

from typing import Any, Dict, List, Tuple
from app.config import Settings
from app.models.enums import RiskLevel, SeverityLevel
from app.models.responses import RiskIndicator, ScoreComponent


class RiskEngine:
    """Calculates risk score, decomposes contributions, and generates risk indicators."""

    def __init__(self, settings: Settings):
        self.settings = settings

    def evaluate_risk(
        self,
        features: Dict[str, Any],
        missing_fields: List[str],
    ) -> Tuple[float, RiskLevel, List[ScoreComponent], List[RiskIndicator]]:
        """Evaluate features using transparent rule weights and thresholds."""
        score_components: List[ScoreComponent] = []
        indicators: List[RiskIndicator] = []
        total_score = 0.0

        # --- Rule 1: Amount Spike Anomaly ---
        amount_ratio = features.get("amount_to_average_ratio")
        if amount_ratio is not None:
            if amount_ratio >= self.settings.amount_ratio_high_threshold:
                contrib = self.settings.weight_amount_spike * 1.0
                total_score += contrib
                score_components.append(
                    ScoreComponent(
                        feature="amount_to_average_ratio",
                        contribution=round(contrib, 4),
                        raw_value=amount_ratio,
                        weight=self.settings.weight_amount_spike,
                    )
                )
                indicators.append(
                    RiskIndicator(
                        code="AMOUNT_SPIKE",
                        severity=SeverityLevel.HIGH,
                        message=f"Payment amount is {amount_ratio:.1f}x the customer's average historical amount (high anomaly threshold is {self.settings.amount_ratio_high_threshold}x).",
                    )
                )
            elif amount_ratio >= self.settings.amount_ratio_medium_threshold:
                contrib = self.settings.weight_amount_spike * 0.6
                total_score += contrib
                score_components.append(
                    ScoreComponent(
                        feature="amount_to_average_ratio",
                        contribution=round(contrib, 4),
                        raw_value=amount_ratio,
                        weight=self.settings.weight_amount_spike,
                    )
                )
                indicators.append(
                    RiskIndicator(
                        code="AMOUNT_SPIKE",
                        severity=SeverityLevel.MEDIUM,
                        message=f"Payment amount is {amount_ratio:.1f}x the customer's average historical amount (medium anomaly threshold is {self.settings.amount_ratio_medium_threshold}x).",
                    )
                )
            else:
                score_components.append(
                    ScoreComponent(
                        feature="amount_to_average_ratio",
                        contribution=0.0,
                        raw_value=amount_ratio,
                        weight=self.settings.weight_amount_spike,
                    )
                )
        else:
            indicators.append(
                RiskIndicator(
                    code="MISSING_AMOUNT_HISTORY",
                    severity=SeverityLevel.MEDIUM,
                    message="Customer average amount is unavailable; baseline amount risk cannot be verified.",
                )
            )

        # --- Rule 2: New Beneficiary Indicator ---
        new_ben = features.get("new_beneficiary_indicator", 0)
        if new_ben == 1:
            contrib = self.settings.weight_new_beneficiary * 1.0
            total_score += contrib
            score_components.append(
                ScoreComponent(
                    feature="new_beneficiary_indicator",
                    contribution=round(contrib, 4),
                    raw_value=new_ben,
                    weight=self.settings.weight_new_beneficiary,
                )
            )
            indicators.append(
                RiskIndicator(
                    code="NEW_BENEFICIARY",
                    severity=SeverityLevel.MEDIUM,
                    message="Beneficiary account has no prior transaction history with this customer.",
                )
            )
        else:
            score_components.append(
                ScoreComponent(
                    feature="new_beneficiary_indicator",
                    contribution=0.0,
                    raw_value=new_ben,
                    weight=self.settings.weight_new_beneficiary,
                )
            )

        # --- Rule 3: Country Mismatch Indicator ---
        country_mismatch = features.get("country_mismatch_indicator", 0)
        origin_country = features.get("origin_country", "UNKNOWN")
        dest_country = features.get("destination_country", "UNKNOWN")
        if country_mismatch == 1:
            contrib = self.settings.weight_country_mismatch * 1.0
            total_score += contrib
            score_components.append(
                ScoreComponent(
                    feature="country_mismatch_indicator",
                    contribution=round(contrib, 4),
                    raw_value=country_mismatch,
                    weight=self.settings.weight_country_mismatch,
                )
            )
            indicators.append(
                RiskIndicator(
                    code="COUNTRY_MISMATCH",
                    severity=SeverityLevel.MEDIUM,
                    message=f"Cross-border transfer detected: Customer country ({origin_country}) differs from Beneficiary country ({dest_country}).",
                )
            )
        else:
            score_components.append(
                ScoreComponent(
                    feature="country_mismatch_indicator",
                    contribution=0.0,
                    raw_value=country_mismatch,
                    weight=self.settings.weight_country_mismatch,
                )
            )

        # --- Rule 4: Transaction Frequency / Velocity Spike ---
        recent_spike = features.get("recent_activity_spike", 0)
        freq_change = features.get("transaction_frequency_change")
        if recent_spike == 1:
            contrib = self.settings.weight_frequency_spike * 1.0
            total_score += contrib
            score_components.append(
                ScoreComponent(
                    feature="recent_activity_spike",
                    contribution=round(contrib, 4),
                    raw_value=freq_change if freq_change is not None else "spike_detected",
                    weight=self.settings.weight_frequency_spike,
                )
            )
            indicators.append(
                RiskIndicator(
                    code="VELOCITY_SPIKE",
                    severity=SeverityLevel.HIGH if (freq_change and freq_change > 5.0) else SeverityLevel.MEDIUM,
                    message="Sudden surge in transaction volume detected relative to historical baseline.",
                )
            )
        else:
            score_components.append(
                ScoreComponent(
                    feature="recent_activity_spike",
                    contribution=0.0,
                    raw_value=freq_change if freq_change is not None else 0,
                    weight=self.settings.weight_frequency_spike,
                )
            )

        # --- Rule 5: Channel Risk ---
        unusual_channel = features.get("unusual_channel_indicator", 0)
        channel = features.get("payment_channel", "online")
        if unusual_channel == 1:
            contrib = self.settings.weight_unusual_channel * 1.0
            total_score += contrib
            score_components.append(
                ScoreComponent(
                    feature="unusual_channel_indicator",
                    contribution=round(contrib, 4),
                    raw_value=channel,
                    weight=self.settings.weight_unusual_channel,
                )
            )
            indicators.append(
                RiskIndicator(
                    code="HIGH_RISK_CHANNEL",
                    severity=SeverityLevel.LOW,
                    message=f"Payment originated via high-risk or accelerated channel: {channel}.",
                )
            )

        # Normalize score into [0.0, 1.0]
        final_score = round(min(max(total_score, 0.0), 1.0), 4)

        # Determine Risk Level & Handle Missing Context
        completeness = features.get("customer_history_completeness", 1.0)
        if completeness <= 0.25 and len(missing_fields) >= 2:
            risk_level = RiskLevel.INSUFFICIENT_INFORMATION
            indicators.append(
                RiskIndicator(
                    code="INSUFFICIENT_CONTEXT",
                    severity=SeverityLevel.MEDIUM,
                    message=f"Key customer context is missing ({', '.join(missing_fields)}). Accurate risk scoring cannot be performed without further data.",
                )
            )
        elif final_score >= self.settings.high_risk_threshold:
            risk_level = RiskLevel.HIGH_RISK
        elif final_score >= self.settings.medium_risk_threshold:
            risk_level = RiskLevel.MEDIUM_RISK
        else:
            risk_level = RiskLevel.LOW_RISK

        return final_score, risk_level, score_components, indicators
