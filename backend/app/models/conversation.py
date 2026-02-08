from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Conversation(SQLModel, table=True):
    """Conversation model representing a chat session between user and AI."""

    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, max_length=36)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
