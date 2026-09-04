"""Configuration settings module using Pydantic BaseSettings."""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application and Risk Engine configuration settings."""

    # Service metadata
    app_name: str = "payment-review-automation"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = False
    port: int = 8000
    host: str = "0.0.0.0"

    # Security & API Key
    api_key_enabled: bool = False
    api_key: str = "sample_secret_key_12345"

    # Risk Engine Thresholds
    amount_ratio_medium_threshold: float = 3.0
    amount_ratio_high_threshold: float = 10.0
    frequency_spike_threshold: float = 2.5
    medium_risk_threshold: float = 0.40
    high_risk_threshold: float = 0.70

    # Risk Weights
    weight_amount_spike: float = 0.35
    weight_new_beneficiary: float = 0.20
    weight_country_mismatch: float = 0.15
    weight_frequency_spike: float = 0.20
    weight_unusual_channel: float = 0.10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Return cached instance of Settings."""
    return Settings()
