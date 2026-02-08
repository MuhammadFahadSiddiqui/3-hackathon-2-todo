from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, field_validator


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str
    description: Optional[str] = None
    deadline_at: Optional[datetime] = None
    reminder_interval_minutes: Optional[int] = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        if len(v) > 500:
            raise ValueError("Title must be 500 characters or less")
        return v.strip()

    @field_validator("reminder_interval_minutes")
    @classmethod
    def validate_reminder_interval(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 1:
            raise ValueError("Reminder interval must be at least 1 minute")
        return v


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""

    title: str
    description: Optional[str] = None
    deadline_at: Optional[datetime] = None
    reminder_interval_minutes: Optional[int] = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        if len(v) > 500:
            raise ValueError("Title must be 500 characters or less")
        return v.strip()

    @field_validator("reminder_interval_minutes")
    @classmethod
    def validate_reminder_interval(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 1:
            raise ValueError("Reminder interval must be at least 1 minute")
        return v


class TaskResponse(BaseModel):
    """Schema for task response."""

    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    deadline_at: Optional[datetime]
    reminder_interval_minutes: Optional[int]
    last_reminded_at: Optional[datetime]

    model_config = {"from_attributes": True}
