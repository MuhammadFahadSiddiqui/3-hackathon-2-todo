from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text
from sqlmodel import Session

from app.auth.schemas import TokenPayload, UserContext
from app.database import get_session
from app.models.user import User

# HTTPBearer security scheme for OpenAPI documentation
security = HTTPBearer()


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_session),
) -> TokenPayload:
    """
    Verify session token by querying the session table directly.

    Args:
        credentials: Bearer token credentials from Authorization header
        db: Database session

    Returns:
        TokenPayload with user data from session

    Raises:
        HTTPException: 401 if token is invalid, expired, or missing
    """
    token = credentials.credentials

    try:
        # Query session table directly to validate token using SQLAlchemy
        query = text('''
            SELECT s."userId", s."expiresAt", u.email
            FROM session s
            JOIN "user" u ON s."userId" = u.id
            WHERE s.token = :token
        ''')
        result = db.execute(query, {"token": token}).first()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        user_id, expires_at, email = result

        # Check if session is expired
        if expires_at and expires_at < datetime.now(timezone.utc).replace(tzinfo=None):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired",
            )

        return TokenPayload(
            sub=user_id,
            iat=0,
            exp=0,
            iss=None,
            aud=None,
            email=email,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


def get_current_user(
    token_payload: TokenPayload = Depends(verify_token),
) -> UserContext:
    """
    Get current authenticated user from session token.

    Args:
        token_payload: Verified token payload with user data

    Returns:
        UserContext with user ID and email
    """
    return UserContext(
        id=token_payload.sub,
        email=token_payload.email or "",
    )
