from datetime import datetime

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """User model representing an authenticated user."""

    __tablename__ = "users"

    id: str = Field(primary_key=True, max_length=36)
    email: str = Field(unique=True, index=True, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
