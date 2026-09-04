"""Recommendation engine mapping risk assessments to operational workflows."""

from typing import List
from app.models.enums import PriorityLevel, RecommendationType, RiskLevel, SeverityLevel
from app.models.responses import RiskIndicator


class RecommendationEngine:
    """Derives actionable routing recommendations for Power Automate and reviewers."""

    @staticmethod
    def generate_recommendation(
        risk_score: float,
        risk_level: RiskLevel,
        indicators: List[RiskIndicator],
        missing_fields: List[str],
    ) -> tuple[RecommendationType, bool, PriorityLevel, List[str]]:
        """Generate workflow recommendation, review necessity, priority, and required actions."""
        required_actions: List[str] = []

        # Check for critical indicators or extreme scores
        has_critical_indicators = any(ind.severity == SeverityLevel.CRITICAL for ind in indicators)
        indicator_codes = {ind.code for ind in indicators}

        if risk_level == RiskLevel.INSUFFICIENT_INFORMATION:
            recommendation = RecommendationType.REQUEST_ADDITIONAL_INFORMATION
            review_required = True
            priority = PriorityLevel.MEDIUM
            required_actions.extend([
                "Request historical customer transaction profile from core banking system",
                "Verify customer baseline spending volume",
                "Obtain verified beneficiary relationship confirmation",
            ])
            if missing_fields:
                required_actions.append(f"Collect missing data fields: {', '.join(missing_fields)}")

        elif risk_level == RiskLevel.HIGH_RISK or has_critical_indicators or risk_score >= 0.85:
            if risk_score >= 0.85 or has_critical_indicators:
                recommendation = RecommendationType.ESCALATE_FOR_INVESTIGATION
                priority = PriorityLevel.URGENT
                required_actions.append("Escalate case to Senior Financial Crime / Fraud Investigation Queue")
            else:
                recommendation = RecommendationType.CREATE_HUMAN_REVIEW_CASE
                priority = PriorityLevel.HIGH

            review_required = True

            # Populate specific actionable checklist based on triggered indicators
            if "AMOUNT_SPIKE" in indicator_codes:
                required_actions.append("Confirm transaction amount legitimacy with customer via secondary channel")
            if "NEW_BENEFICIARY" in indicator_codes:
                required_actions.append("Verify beneficiary account details, name match, and account age")
            if "COUNTRY_MISMATCH" in indicator_codes:
                required_actions.append("Perform sanctions and cross-border jurisdiction compliance check")
            if "VELOCITY_SPIKE" in indicator_codes:
                required_actions.append("Investigate potential account takeover or automated burst transfers")
            if "HIGH_RISK_CHANNEL" in indicator_codes:
                required_actions.append("Validate device fingerprint and channel authentication factors")

        elif risk_level == RiskLevel.MEDIUM_RISK:
            recommendation = RecommendationType.CREATE_HUMAN_REVIEW_CASE
            review_required = True
            priority = PriorityLevel.MEDIUM

            if "AMOUNT_SPIKE" in indicator_codes:
                required_actions.append("Review payment amount against recent invoice or customer profile")
            if "NEW_BENEFICIARY" in indicator_codes:
                required_actions.append("Confirm new beneficiary addition authorization")
            if "COUNTRY_MISMATCH" in indicator_codes:
                required_actions.append("Verify expected cross-border destination country")
            if not required_actions:
                required_actions.append("Perform standard 4-eyes payment verification")

        else:  # LOW_RISK
            recommendation = RecommendationType.PROCEED_TO_NORMAL_PROCESSING
            review_required = False
            priority = PriorityLevel.LOW
            required_actions.append("Release payment to payment rail for automated straight-through processing")

        return recommendation, review_required, priority, required_actions
