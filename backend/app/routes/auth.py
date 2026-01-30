from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.auth import get_current_user, UserContext

router = APIRouter(prefix="/api", tags=["Auth"])


class UserResponse(BaseModel):
    """Response model for current user info."""

    id: str
    email: str | None


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserContext = Depends(get_current_user),
) -> UserResponse:
    """Get current authenticated user information."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
    )
