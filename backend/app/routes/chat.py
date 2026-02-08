"""Chat API endpoints for AI-powered todo management."""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.auth import get_current_user, UserContext
from app.database import get_session
from app.schemas.chat import ChatRequest, ChatResponse, ConversationHistory, HistoryMessage
from app.services.chat_service import ChatService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ChatResponse:
    """
    Send a chat message and get AI response.

    The AI assistant interprets natural language and executes
    appropriate task operations (add, list, complete, update, delete).
    """
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )

    try:
        service = ChatService(session, current_user.id)
        result = await service.process_message(request.message)

        return ChatResponse(
            message=result["message"],
            tool_calls=result.get("tool_calls"),
            conversation_id=result.get("conversation_id")
        )
    except ValueError as e:
        # Missing API key or configuration error
        logger.error(f"Configuration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Please contact support."
        )
    except Exception as e:
        logger.error(f"Chat processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable. Please try again."
        )


@router.get("/history", response_model=ConversationHistory)
async def get_history(
    limit: int = 50,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ConversationHistory:
    """Get conversation history for the authenticated user."""
    if limit < 1 or limit > 100:
        limit = 50

    service = ChatService(session, current_user.id)
    conversation = service.get_or_create_conversation()
    messages_data = service.get_history_messages(conversation.id, limit=limit)

    return ConversationHistory(
        conversation_id=conversation.id,
        messages=[HistoryMessage(**m) for m in messages_data]
    )


@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
async def clear_history(
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> None:
    """Clear conversation history for the authenticated user."""
    service = ChatService(session, current_user.id)
    service.clear_conversation()
