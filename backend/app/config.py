from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    def __init__(self):
        self.database_url: str = os.getenv("DATABASE_URL", "")
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")

        # Better Auth JWT configuration
        self.better_auth_jwks_url: str = os.getenv(
            "BETTER_AUTH_JWKS_URL", "http://localhost:3000/api/auth/jwks"
        )
        self.better_auth_issuer: str = os.getenv(
            "BETTER_AUTH_ISSUER", "http://localhost:3000"
        )
        self.frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
