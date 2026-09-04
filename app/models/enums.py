"""Domain enums for payment risk evaluation and workflow routing."""

from enum import Enum


class RiskLevel(str, Enum):
    """Calculated risk categorization."""

    LOW_RISK = "low_risk"
    MEDIUM_RISK = "medium_risk"
    HIGH_RISK = "high_risk"
    INSUFFICIENT_INFORMATION = "insufficient_information"
    MANUAL_REVIEW_REQUIRED = "manual_review_required"


class RecommendationType(str, Enum):
    """Operational workflow recommendation for Power Automate."""

    PROCEED_TO_NORMAL_PROCESSING = "proceed_to_normal_processing"
    REQUEST_ADDITIONAL_INFORMATION = "request_additional_information"
    CREATE_HUMAN_REVIEW_CASE = "create_human_review_case"
    ESCALATE_FOR_INVESTIGATION = "escalate_for_investigation"


class SeverityLevel(str, Enum):
    """Severity classification for specific risk indicators."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PriorityLevel(str, Enum):
    """Priority score for case routing in Dataverse."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class PaymentChannel(str, Enum):
    """Channel through which transaction originated."""

    ONLINE = "online"
    MOBILE = "mobile"
    WIRE = "wire"
    BATCH = "batch"
    POS = "pos"
    ATM = "atm"
    IN_BRANCH = "in_branch"
    OTHER = "other"
