"""Structured and privacy-preserving logging utility."""

import logging
import sys


def setup_logger(name: str = "payment_review") -> logging.Logger:
    """Configure and return a structured logger."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%dT%H:%M:%SZ",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


def mask_identifier(value: str | None, visible_chars: int = 3) -> str:
    """Mask sensitive identifiers like customer or account numbers for audit logs."""
    if not value:
        return "N/A"
    if len(value) <= visible_chars:
        return "***"
    return f"{value[:visible_chars]}***{value[-1] if len(value) > visible_chars + 1 else ''}"


logger = setup_logger()
