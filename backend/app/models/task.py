"""Task SQLModel entity."""

from datetime import datetime
from typing import Optional
from uuid import uuid4
from sqlmodel import SQLModel, Field


class Task(SQLModel, table=True):
    """Task entity representing a todo item for a user."""

    __tablename__ = "tasks"

    id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
        max_length=36,
        description="Unique task identifier (UUID)",
    )
    user_id: str = Field(
        ...,
        index=True,
        max_length=255,
        description="Owner identifier",
    )
    title: str = Field(
        ...,
        max_length=255,
        description="Task title",
    )
    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Optional task details",
    )
    completed: bool = Field(
        default=False,
        description="Completion status",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp (UTC)",
    )
    completed_at: Optional[datetime] = Field(
        default=None,
        description="Completion timestamp (UTC)",
    )
