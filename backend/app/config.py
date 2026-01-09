"""Application configuration loaded from environment variables."""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment."""

    def __init__(self):
        self.DATABASE_URL: str = os.getenv("DATABASE_URL", "")
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is required")

    @property
    def async_database_url(self) -> str:
        """Return the async-compatible database URL."""
        # Ensure the URL uses asyncpg driver
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


settings = Settings() if os.getenv("DATABASE_URL") else None


def get_settings() -> Settings:
    """Get application settings, creating if needed."""
    global settings
    if settings is None:
        settings = Settings()
    return settings
