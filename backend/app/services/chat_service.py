"""Chat service for managing conversations and messages."""
from datetime import datetime
from typing import Optional, List, Dict, Any
import json
from sqlmodel import Session, select
from app.models.conversation import Conversation
from app.models.message import Message
from app.ai.agent import process_with_agent


class ChatService:
    """Service for handling chat operations with conversation persistence."""

    def __init__(self, session: Session, user_id: str):
        self.session = session
        self.user_id = user_id

    def get_or_create_conversation(self) -> Conversation:
        """Get the user's active conversation or create a new one."""
        statement = select(Conversation).where(
            Conversation.user_id == self.user_id
        ).order_by(Conversation.updated_at.desc())

        conversation = self.session.exec(statement).first()

        if not conversation:
            conversation = Conversation(user_id=self.user_id)
            self.session.add(conversation)
            self.session.commit()
            self.session.refresh(conversation)

        return conversation

    def validate_conversation_ownership(self, conversation_id: int) -> Conversation:
        """Validate that the conversation belongs to the current user."""
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == self.user_id
        )
        conversation = self.session.exec(statement).first()
        if not conversation:
            raise ValueError("Conversation not found or access denied")
        return conversation

    def get_messages(
        self,
        conversation_id: int,
        limit: int = 20
    ) -> List[Dict[str, str]]:
        """Get recent messages for conversation context."""
        # Validate ownership before fetching messages
        self.validate_conversation_ownership(conversation_id)

        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .where(Message.role.in_(["user", "assistant"]))  # Exclude tool messages for context
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        messages = self.session.exec(statement).all()

        # Return in chronological order (oldest first)
        return [
            {"role": m.role, "content": m.content}
            for m in reversed(messages)
            if m.content  # Only include messages with content
        ]

    def get_history_messages(
        self,
        conversation_id: int,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get messages for history display (includes all details)."""
        # Validate ownership before fetching messages
        self.validate_conversation_ownership(conversation_id)

        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .where(Message.role.in_(["user", "assistant"]))
            .order_by(Message.created_at.asc())
            .limit(limit)
        )
        messages = self.session.exec(statement).all()

        return [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat() + "Z"
            }
            for m in messages
        ]

    def save_message(
        self,
        conversation_id: int,
        role: str,
        content: str,
        tool_calls: Optional[str] = None,
        tool_results: Optional[str] = None
    ) -> Message:
        """Save a message to the conversation."""
        # Validate ownership before saving message
        self.validate_conversation_ownership(conversation_id)

        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
            tool_results=tool_results
        )
        self.session.add(message)
        self.session.commit()
        self.session.refresh(message)
        return message

    async def process_message(self, user_message: str) -> Dict[str, Any]:
        """
        Process a user message and return AI response.

        This is the main entry point for chat processing:
        1. Gets or creates conversation
        2. Loads conversation history
        3. Saves user message
        4. Processes with AI agent (may execute tools)
        5. Saves assistant response
        6. Returns response

        Args:
            user_message: The user's chat message

        Returns:
            Dict with 'message', 'tool_calls', and 'conversation_id'
        """
        # 1. Get or create conversation
        conversation = self.get_or_create_conversation()

        # 2. Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        self.session.add(conversation)
        self.session.commit()

        # 3. Load conversation history for context
        history = self.get_messages(conversation.id, limit=20)

        # 4. Save user message
        self.save_message(conversation.id, "user", user_message)

        # 5. Add current message to history for AI processing
        history.append({"role": "user", "content": user_message})

        # 6. Process with AI agent
        result = await process_with_agent(history, self.session, self.user_id)

        # 7. Save assistant response
        self.save_message(
            conversation.id,
            "assistant",
            result["content"],
            tool_calls=json.dumps(result["tool_calls"]) if result["tool_calls"] else None
        )

        return {
            "message": result["content"],
            "tool_calls": result["tool_calls"],
            "conversation_id": conversation.id
        }

    def clear_conversation(self) -> bool:
        """Delete all messages in the user's conversation."""
        conversation = self.get_or_create_conversation()

        # Delete all messages
        statement = select(Message).where(
            Message.conversation_id == conversation.id
        )
        messages = self.session.exec(statement).all()

        for message in messages:
            self.session.delete(message)

        self.session.commit()
        return True
