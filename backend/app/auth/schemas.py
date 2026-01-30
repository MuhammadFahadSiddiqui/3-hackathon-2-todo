from pydantic import BaseModel


class TokenPayload(BaseModel):
    """JWT token payload structure from Better Auth."""

    sub: str  # User ID (required)
    iat: int  # Issued at timestamp
    exp: int  # Expiration timestamp
    iss: str | None = None  # Issuer URL
    aud: str | None = None  # Audience URL
    email: str | None = None  # User email for convenience


class UserContext(BaseModel):
    """Authenticated user context available to route handlers."""

    id: str  # User ID from JWT sub claim
    email: str | None = None  # Email if available in token
