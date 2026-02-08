from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Message(SQLModel, table=True):
    """Message model representing a single message in a conversation."""

    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    role: str = Field(max_length=20)  # user | assistant | tool
    content: str = Field(default="")
    tool_calls: Optional[str] = Field(default=None)  # JSON string
    tool_results: Optional[str] = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)
