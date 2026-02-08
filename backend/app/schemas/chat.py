from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request schema for sending a chat message."""
    message: str = Field(..., min_length=1, max_length=2000)


class ToolCallInfo(BaseModel):
    """Information about a tool call made by the AI."""
    name: str
    arguments: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""
    message: str
    tool_calls: Optional[List[ToolCallInfo]] = None
    conversation_id: Optional[int] = None


class HistoryMessage(BaseModel):
    """A single message in conversation history."""
    id: int
    role: str
    content: str
    created_at: str


class ConversationHistory(BaseModel):
    """Conversation history response."""
    conversation_id: Optional[int] = None
    messages: List[HistoryMessage] = []
