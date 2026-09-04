"""Explanation service generating clear, human-readable rationale for payment reviews."""

from typing import List
from app.models.enums import RecommendationType, RiskLevel
from app.models.responses import RiskIndicator


class ExplanationService:
    """Generates auditable explanations from risk indicators and recommendations."""

    @staticmethod
    def generate_explanation(
        risk_level: RiskLevel,
        recommendation: RecommendationType,
        indicators: List[RiskIndicator],
        missing_fields: List[str],
    ) -> str:
        """Compose human-readable narrative explaining the risk assessment."""
        if risk_level == RiskLevel.INSUFFICIENT_INFORMATION:
            missing_str = ", ".join(missing_fields) if missing_fields else "critical historical context"
            return (
                f"Evaluation is inconclusive due to missing customer context ({missing_str}). "
                "Recommendation is to request additional information before re-evaluating or releasing the payment."
            )

        if not indicators or risk_level == RiskLevel.LOW_RISK:
            return (
                "Payment matches standard historical customer behavior with no elevated risk indicators detected. "
                "Recommended for straight-through automated processing."
            )

        # Synthesize summaries of triggered indicators
        reasons = []
        for ind in indicators:
            if ind.code == "AMOUNT_SPIKE":
                reasons.append("unusually high transaction amount compared to customer baseline")
            elif ind.code == "NEW_BENEFICIARY":
                reasons.append("beneficiary is new with no prior transaction history")
            elif ind.code == "COUNTRY_MISMATCH":
                reasons.append("cross-border destination mismatch")
            elif ind.code == "VELOCITY_SPIKE":
                reasons.append("sudden acceleration in transaction frequency")
            elif ind.code == "HIGH_RISK_CHANNEL":
                reasons.append("high-risk transaction origination channel")
            elif ind.code == "MISSING_AMOUNT_HISTORY":
                reasons.append("absence of historical average amount baseline")

        reason_text = ", ".join(reasons) if reasons else "multiple moderate risk indicators"

        if recommendation == RecommendationType.ESCALATE_FOR_INVESTIGATION:
            return (
                f"The payment presents severe risk factors: {reason_text}. "
                "Immediate escalation for specialized financial crime investigation is recommended."
            )

        return (
            f"The payment was classified as {risk_level.value.replace('_', ' ')} because of: {reason_text}. "
            "Human review is required to verify transaction authenticity prior to execution."
        )
