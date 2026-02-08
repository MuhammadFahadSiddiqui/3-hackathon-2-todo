from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    """Task model representing a todo item."""

    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(index=True)
    title: str = Field(max_length=500)
    description: Optional[str] = Field(default=None)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    # Reminder fields
    deadline_at: Optional[datetime] = Field(default=None)
    reminder_interval_minutes: Optional[int] = Field(default=None)
    last_reminded_at: Optional[datetime] = Field(default=None)
