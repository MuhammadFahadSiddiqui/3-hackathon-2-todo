# Implementation Tasks: Todo AI Chatbot Backend

**Feature Branch**: `004-todo-ai-backend`
**Generated**: 2026-02-07
**Source**: [plan.md](./plan.md) | [spec.md](./spec.md)

## Summary

This document contains implementation tasks for the Todo AI Chatbot Backend feature. Tasks are organized by phase with clear dependencies, acceptance criteria, and test cases.

**Total Tasks**: 18
**Estimated Phases**: 6

---

## Task Dependencies Graph

```
TASK-01 ─────────────────────────────────────────────────────────┐
                                                                 │
TASK-02 ─────────────────────────────────────────────────────────┤
                                                                 ├──► TASK-06 ──► TASK-07 ──► TASK-08
TASK-03 ──► TASK-04 ──► TASK-05 ─────────────────────────────────┤
                                                                 │
TASK-09 ──► TASK-10 ──► TASK-11 ──► TASK-12 ─────────────────────┤
                                                                 │
TASK-13 ──► TASK-14 ──────────────────────────────────────────────┤
                                                                 │
                                                                 └──► TASK-15 ──► TASK-16 ──► TASK-17 ──► TASK-18
```

---

## Phase 0: Setup & Environment

### TASK-01: Add OpenAI Dependencies
**Priority**: P0 | **Blocked By**: None | **Blocks**: TASK-06

Add required Python dependencies for AI and MCP functionality.

**Files to Modify**:
- `backend/requirements.txt`

**Acceptance Criteria**:
- [X] `openai>=1.0.0` added to requirements.txt
- [X] Dependencies install successfully with `pip install -r requirements.txt`

**Test Cases**:
```bash
# Test: Verify dependencies install
cd backend
pip install -r requirements.txt
python -c "import openai; print(openai.__version__)"
# Expected: Version 1.x.x or higher
```

---

### TASK-02: Configure Environment Variables
**Priority**: P0 | **Blocked By**: None | **Blocks**: TASK-06

Add OpenAI configuration to environment setup.

**Files to Modify**:
- `backend/.env.example`
- `backend/.env` (local only)

**Acceptance Criteria**:
- [X] `OPENAI_API_KEY` placeholder added to `.env.example`
- [X] `OPENAI_MODEL` with default `gpt-4o-mini` added to `.env.example`
- [ ] Local `.env` has valid OpenAI API key (user must configure)

**Test Cases**:
```bash
# Test: Verify environment variables load
cd backend
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('OPENAI_API_KEY', 'NOT SET')[:10])"
# Expected: First 10 chars of API key (sk-xxxxxx)
```

---

## Phase 1: Database Models

### TASK-03: Create Conversation Model
**Priority**: P1 | **Blocked By**: None | **Blocks**: TASK-04

Create SQLModel entity for chat conversations.

**Files to Create**:
- `backend/app/models/conversation.py`

**Implementation**:
```python
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, max_length=36)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Acceptance Criteria**:
- [X] `Conversation` model defined with id, user_id, created_at, updated_at
- [X] `user_id` field is indexed for fast lookups
- [X] Model follows SQLModel conventions

**Test Cases**:
```bash
# Test: Model imports successfully
cd backend
python -c "from app.models.conversation import Conversation; print(Conversation.__tablename__)"
# Expected: conversations
```

**Traces**: FR-012 (persist conversations)

---

### TASK-04: Create Message Model
**Priority**: P1 | **Blocked By**: TASK-03 | **Blocks**: TASK-05

Create SQLModel entity for chat messages.

**Files to Create**:
- `backend/app/models/message.py`

**Implementation**:
```python
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    role: str = Field(max_length=20)  # user | assistant | tool
    content: str = Field(default="")
    tool_calls: Optional[str] = Field(default=None)  # JSON string
    tool_results: Optional[str] = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Acceptance Criteria**:
- [X] `Message` model defined with all required fields
- [X] `conversation_id` has foreign key relationship
- [X] `tool_calls` and `tool_results` are nullable JSON strings

**Test Cases**:
```bash
# Test: Model imports successfully
cd backend
python -c "from app.models.message import Message; print(Message.__tablename__)"
# Expected: messages
```

**Traces**: FR-013 (persist messages)

---

### TASK-05: Register Models in Database
**Priority**: P1 | **Blocked By**: TASK-04 | **Blocks**: TASK-06

Update database initialization to include new models.

**Files to Modify**:
- `backend/app/models/__init__.py`
- `backend/app/database.py`

**Acceptance Criteria**:
- [X] `Conversation` and `Message` exported from `app/models/__init__.py`
- [X] Models imported in `database.py` for table creation
- [X] Tables auto-created on server startup

**Test Cases**:
```bash
# Test: Tables created in database
cd backend
uvicorn app.main:app --port 8001 &
sleep 3
# Verify tables exist via psql or API health check
curl http://localhost:8001/
kill %1
```

---

## Phase 2: MCP Tools Implementation

### TASK-06: Create Chat Schemas
**Priority**: P1 | **Blocked By**: TASK-01, TASK-02, TASK-05 | **Blocks**: TASK-07

Create Pydantic schemas for chat API request/response.

**Files to Create**:
- `backend/app/schemas/chat.py`

**Implementation**:
```python
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)

class ToolCallInfo(BaseModel):
    name: str
    arguments: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    tool_calls: Optional[List[ToolCallInfo]] = None
    conversation_id: Optional[int] = None

class HistoryMessage(BaseModel):
    id: int
    role: str
    content: str
    created_at: str

class ConversationHistory(BaseModel):
    conversation_id: Optional[int] = None
    messages: List[HistoryMessage] = []
```

**Acceptance Criteria**:
- [X] `ChatRequest` validates message length (1-2000 chars)
- [X] `ChatResponse` includes message, tool_calls, and conversation_id
- [X] `ConversationHistory` returns messages for history endpoint

**Test Cases**:
```bash
# Test: Schema validation works
cd backend
python -c "from app.schemas.chat import ChatRequest; r = ChatRequest(message='hello'); print(r.message)"
# Expected: hello
```

**Traces**: chat-api.yaml contract

---

### TASK-07: Create MCP Tools Module
**Priority**: P1 | **Blocked By**: TASK-06 | **Blocks**: TASK-08

Implement MCP tool definitions for task CRUD operations.

**Files to Create**:
- `backend/app/ai/tools.py`

**Implementation**:
```python
from typing import List, Dict, Any, Optional
from sqlmodel import Session, select
from app.models.task import Task
from datetime import datetime

# Tool definitions for OpenAI function calling
TASK_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Optional task description"}
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "Get user's tasks filtered by status",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "description": "Filter by completion status"
                    }
                },
                "required": []
            }
        }
    },
    # ... complete_task, update_task, delete_task definitions
]

# Tool execution functions
def execute_add_task(session: Session, user_id: str, title: str, description: str = "") -> Dict[str, Any]:
    task = Task(user_id=user_id, title=title, description=description)
    session.add(task)
    session.commit()
    session.refresh(task)
    return {"success": True, "task": {"id": task.id, "title": task.title}}

def execute_list_tasks(session: Session, user_id: str, status: str = "all") -> Dict[str, Any]:
    query = select(Task).where(Task.user_id == user_id)
    if status == "pending":
        query = query.where(Task.is_completed == False)
    elif status == "completed":
        query = query.where(Task.is_completed == True)
    tasks = session.exec(query).all()
    return {"tasks": [{"id": t.id, "title": t.title, "is_completed": t.is_completed} for t in tasks]}

# ... execute_complete_task, execute_update_task, execute_delete_task
```

**Acceptance Criteria**:
- [X] All 5 MCP tools defined: add_task, list_tasks, complete_task, update_task, delete_task
- [X] Tool definitions follow OpenAI function calling format
- [X] Each tool has an execution function that uses existing Task model
- [X] All operations are user-scoped (filter by user_id)

**Test Cases**:
```bash
# Test: Tools module imports and has definitions
cd backend
python -c "from app.ai.tools import TASK_TOOLS; print(len(TASK_TOOLS))"
# Expected: 5
```

**Traces**: FR-007 to FR-011 (MCP tools)

---

### TASK-08: Create AI Agent Module
**Priority**: P1 | **Blocked By**: TASK-07 | **Blocks**: TASK-09

Configure OpenAI agent with system prompt and tool registration.

**Files to Create**:
- `backend/app/ai/agent.py`

**Implementation**:
```python
import os
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI
from sqlmodel import Session
from app.ai.tools import TASK_TOOLS, execute_tool

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

SYSTEM_PROMPT = """You are a helpful todo assistant. You help users manage their tasks through natural language conversation.

Available actions:
- Add new tasks
- List tasks (all, pending, or completed)
- Mark tasks as complete
- Update task titles or descriptions
- Delete tasks

Be concise and friendly in your responses. Always confirm actions you've taken."""

async def process_with_agent(
    messages: List[Dict[str, str]],
    session: Session,
    user_id: str
) -> Dict[str, Any]:
    """Process messages with OpenAI agent and execute tool calls."""

    # Add system prompt
    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    response = client.chat.completions.create(
        model=MODEL,
        messages=full_messages,
        tools=TASK_TOOLS,
        tool_choice="auto"
    )

    # Handle tool calls if any
    message = response.choices[0].message
    tool_calls_info = []

    if message.tool_calls:
        for tool_call in message.tool_calls:
            result = execute_tool(
                session, user_id,
                tool_call.function.name,
                json.loads(tool_call.function.arguments)
            )
            tool_calls_info.append({
                "name": tool_call.function.name,
                "arguments": json.loads(tool_call.function.arguments),
                "result": result
            })

        # Get final response after tool execution
        # ... continue conversation with tool results

    return {
        "content": message.content or "",
        "tool_calls": tool_calls_info if tool_calls_info else None
    }
```

**Acceptance Criteria**:
- [X] OpenAI client initialized with API key from environment
- [X] System prompt defines assistant behavior
- [X] `process_with_agent` function handles message processing
- [X] Tool calls are detected, executed, and results incorporated
- [X] Agent continues conversation after tool execution

**Test Cases**:
```bash
# Test: Agent module imports successfully
cd backend
python -c "from app.ai.agent import SYSTEM_PROMPT, MODEL; print(MODEL)"
# Expected: gpt-4o-mini
```

**Traces**: FR-004 to FR-006 (AI agent & tool selection)

---

## Phase 3: Chat Service Layer

### TASK-09: Create Chat Service
**Priority**: P1 | **Blocked By**: TASK-08 | **Blocks**: TASK-10

Implement chat business logic with conversation management.

**Files to Create**:
- `backend/app/services/chat_service.py`

**Implementation**:
```python
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import Session, select
from app.models.conversation import Conversation
from app.models.message import Message
from app.ai.agent import process_with_agent
import json

class ChatService:
    def __init__(self, session: Session, user_id: str):
        self.session = session
        self.user_id = user_id

    def get_or_create_conversation(self) -> Conversation:
        """Get active conversation or create new one."""
        statement = select(Conversation).where(Conversation.user_id == self.user_id)
        conversation = self.session.exec(statement).first()
        if not conversation:
            conversation = Conversation(user_id=self.user_id)
            self.session.add(conversation)
            self.session.commit()
            self.session.refresh(conversation)
        return conversation

    def get_messages(self, conversation_id: int, limit: int = 20) -> List[Dict[str, str]]:
        """Get recent messages for context."""
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        messages = self.session.exec(statement).all()
        return [{"role": m.role, "content": m.content} for m in reversed(messages)]

    def save_message(self, conversation_id: int, role: str, content: str,
                     tool_calls: Optional[str] = None, tool_results: Optional[str] = None):
        """Persist a message to the database."""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
            tool_results=tool_results
        )
        self.session.add(message)
        self.session.commit()

    async def process_message(self, user_message: str) -> Dict[str, Any]:
        """Main entry point for processing a chat message."""
        # 1. Get or create conversation
        conversation = self.get_or_create_conversation()

        # 2. Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        self.session.add(conversation)

        # 3. Load conversation history
        history = self.get_messages(conversation.id)

        # 4. Save user message
        self.save_message(conversation.id, "user", user_message)

        # 5. Process with AI agent
        history.append({"role": "user", "content": user_message})
        result = await process_with_agent(history, self.session, self.user_id)

        # 6. Save assistant response
        self.save_message(
            conversation.id,
            "assistant",
            result["content"],
            tool_calls=json.dumps(result["tool_calls"]) if result["tool_calls"] else None
        )

        self.session.commit()

        return {
            "message": result["content"],
            "tool_calls": result["tool_calls"],
            "conversation_id": conversation.id
        }
```

**Acceptance Criteria**:
- [X] `ChatService` class manages conversation lifecycle
- [X] Conversation is created on first message per user
- [X] Message history loaded from DB (limited to 20 for token efficiency)
- [X] User and assistant messages persisted
- [X] Tool calls and results stored in message records

**Test Cases**:
```bash
# Test: ChatService imports successfully
cd backend
python -c "from app.services.chat_service import ChatService; print('OK')"
# Expected: OK
```

**Traces**: FR-002, FR-012-FR-015 (stateless persistence)

---

### TASK-10: Create Chat API Endpoint
**Priority**: P1 | **Blocked By**: TASK-09 | **Blocks**: TASK-11

Implement POST /api/chat endpoint with JWT authentication.

**Files to Create**:
- `backend/app/routes/chat.py`

**Implementation**:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_session
from app.auth.dependencies import get_current_user
from app.schemas.chat import ChatRequest, ChatResponse, ConversationHistory
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Send a chat message and get AI response."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        service = ChatService(session, current_user["user_id"])
        result = await service.process_message(request.message)
        return ChatResponse(**result)
    except Exception as e:
        # Log error
        raise HTTPException(status_code=503, detail="AI service is temporarily unavailable")

@router.get("/history", response_model=ConversationHistory)
async def get_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get conversation history."""
    service = ChatService(session, current_user["user_id"])
    conversation = service.get_or_create_conversation()
    messages = service.get_messages(conversation.id, limit=limit)
    return ConversationHistory(
        conversation_id=conversation.id,
        messages=messages
    )

@router.delete("/clear", status_code=204)
async def clear_history(
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Clear conversation history."""
    # Implementation: Delete all messages for user's conversation
    pass
```

**Acceptance Criteria**:
- [X] `POST /api/chat` accepts message and returns AI response
- [X] `GET /api/chat/history` returns conversation messages
- [X] `DELETE /api/chat/clear` removes conversation history
- [X] All endpoints require JWT authentication
- [X] Proper HTTP status codes (200, 204, 400, 401, 503)

**Test Cases**:
```bash
# Test: Endpoint imports successfully
cd backend
python -c "from app.routes.chat import router; print(router.prefix)"
# Expected: /api/chat
```

**Traces**: FR-001, FR-003, FR-016 (chat endpoint with auth)

---

### TASK-11: Register Chat Router
**Priority**: P1 | **Blocked By**: TASK-10 | **Blocks**: TASK-12

Add chat router to main FastAPI application.

**Files to Modify**:
- `backend/app/main.py`

**Changes**:
```python
# Add import
from app.routes.chat import router as chat_router

# Add router registration (after existing routers)
app.include_router(chat_router)
```

**Acceptance Criteria**:
- [X] Chat router imported in main.py
- [X] Router registered with `app.include_router()`
- [X] Endpoints accessible at `/api/chat`, `/api/chat/history`, `/api/chat/clear`

**Test Cases**:
```bash
# Test: Endpoints visible in OpenAPI docs
cd backend
uvicorn app.main:app --port 8001 &
sleep 3
curl http://localhost:8001/openapi.json | grep "/api/chat"
# Expected: "/api/chat" appears in output
kill %1
```

**Traces**: FR-024 (safely extend existing code)

---

## Phase 4: Error Handling & Polish

### TASK-12: Add Error Handling
**Priority**: P2 | **Blocked By**: TASK-11 | **Blocks**: TASK-15

Implement comprehensive error handling for AI and database failures.

**Files to Modify**:
- `backend/app/routes/chat.py`
- `backend/app/services/chat_service.py`
- `backend/app/ai/agent.py`

**Acceptance Criteria**:
- [X] OpenAI API errors caught and converted to 503 status
- [X] Database errors caught and converted to 500 status
- [X] Task not found returns friendly message in AI response
- [ ] Rate limit errors return 429 status with helpful message
- [X] All error messages are user-friendly (no stack traces)

**Test Cases**:
```bash
# Test: Invalid API key returns 503
# (Set invalid OPENAI_API_KEY and send request)
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
# Expected: {"detail": "AI service is temporarily unavailable"}
```

**Traces**: FR-019 to FR-021 (error handling)

---

## Phase 5: Frontend API Client

### TASK-13: Create Frontend Chat API Client
**Priority**: P2 | **Blocked By**: TASK-11 | **Blocks**: TASK-14

Create TypeScript API client for chat functionality.

**Files to Create**:
- `frontend/lib/chat-api.ts`

**Implementation**:
```typescript
import { apiRequest } from './api';

export interface ChatResponse {
  message: string;
  tool_calls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
    result?: Record<string, unknown>;
  }>;
  conversation_id?: number;
}

export interface HistoryMessage {
  id: number;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  created_at: string;
}

export interface ConversationHistory {
  conversation_id: number;
  messages: HistoryMessage[];
}

export const chatApi = {
  sendMessage: (message: string): Promise<ChatResponse> =>
    apiRequest<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getHistory: (limit = 50): Promise<ConversationHistory> =>
    apiRequest<ConversationHistory>(`/api/chat/history?limit=${limit}`),

  clearHistory: (): Promise<void> =>
    apiRequest('/api/chat/clear', { method: 'DELETE' }),
};
```

**Acceptance Criteria**:
- [X] `chatApi.sendMessage()` sends POST request to /api/chat
- [X] `chatApi.getHistory()` fetches conversation history
- [X] `chatApi.clearHistory()` clears conversation
- [X] Uses existing `apiRequest` function for auth headers
- [X] TypeScript interfaces match API contract

**Test Cases**:
```bash
# Test: TypeScript compiles successfully
cd frontend
npx tsc --noEmit lib/chat-api.ts
# Expected: No errors
```

**Traces**: Frontend integration preparation for Spec-5

---

### TASK-14: Export Chat API from lib index
**Priority**: P2 | **Blocked By**: TASK-13 | **Blocks**: TASK-15

Add chat API export to frontend lib exports.

**Files to Modify**:
- `frontend/lib/index.ts` (if exists) or update imports in app

**Acceptance Criteria**:
- [ ] `chatApi` is importable from frontend code
- [ ] No circular dependency issues

---

## Phase 6: End-to-End Testing

### TASK-15: Test Task Creation via Chat
**Priority**: P1 | **Blocked By**: TASK-12, TASK-14 | **Blocks**: TASK-16

Verify US1: Natural language task creation works correctly.

**Test Procedure**:
```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' | jq -r '.token')

# 2. Send task creation message
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries"}' | jq

# 3. Verify task was created
curl -s http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Acceptance Criteria**:
- [ ] "Add a task to buy groceries" creates a task titled "buy groceries" or similar
- [ ] AI response confirms the task was created
- [ ] Task appears in /api/tasks list
- [ ] tool_calls contains add_task with correct arguments

**Traces**: US1 - Natural Language Task Creation

---

### TASK-16: Test Task Listing via Chat
**Priority**: P1 | **Blocked By**: TASK-15 | **Blocks**: TASK-17

Verify US2: Conversational task listing works correctly.

**Test Procedure**:
```bash
# 1. Ask to list tasks
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show my tasks"}' | jq

# 2. Ask for pending only
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What tasks are left to do?"}' | jq
```

**Acceptance Criteria**:
- [ ] "Show my tasks" returns list of all tasks
- [ ] "What tasks are left to do?" returns only pending tasks
- [ ] AI response formats task list readably
- [ ] tool_calls contains list_tasks with correct status filter

**Traces**: US2 - Conversational Task Listing

---

### TASK-17: Test Task Completion/Update/Delete via Chat
**Priority**: P2 | **Blocked By**: TASK-16 | **Blocks**: TASK-18

Verify US3, US4, US5: Task modification operations work correctly.

**Test Procedure**:
```bash
# 1. Complete a task
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Mark groceries as done"}' | jq

# 2. Update a task
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Rename groceries to buy vegetables"}' | jq

# 3. Delete a task
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Delete the vegetables task"}' | jq
```

**Acceptance Criteria**:
- [ ] Task completion changes is_completed to true
- [ ] Task update changes title correctly
- [ ] Task deletion removes task from database
- [ ] AI confirms each action with appropriate message

**Traces**: US3, US4, US5 - Task Modification Operations

---

### TASK-18: Verify Stateless Behavior
**Priority**: P2 | **Blocked By**: TASK-17 | **Blocks**: None

Verify conversation persists across server restarts (stateless architecture).

**Test Procedure**:
```bash
# 1. Send a message
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task: Test stateless behavior"}' | jq

# 2. Restart the server
# Stop with Ctrl+C, then:
uvicorn app.main:app --reload --port 8000

# 3. Check conversation persists
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What tasks do I have?"}' | jq

# Expected: "Test stateless behavior" task should appear
```

**Acceptance Criteria**:
- [ ] Conversation history persists after server restart
- [ ] Previous tasks are still accessible
- [ ] No in-memory state dependency

**Traces**: FR-014, FR-015 (stateless architecture), US6 (conversation continuity)

---

## Summary

| Phase | Tasks | Priority |
|-------|-------|----------|
| Phase 0: Setup | TASK-01, TASK-02 | P0 |
| Phase 1: Database | TASK-03, TASK-04, TASK-05 | P1 |
| Phase 2: MCP Tools | TASK-06, TASK-07, TASK-08 | P1 |
| Phase 3: Chat Service | TASK-09, TASK-10, TASK-11 | P1 |
| Phase 4: Error Handling | TASK-12 | P2 |
| Phase 5: Frontend Client | TASK-13, TASK-14 | P2 |
| Phase 6: E2E Testing | TASK-15, TASK-16, TASK-17, TASK-18 | P1/P2 |

**Critical Path**: TASK-01 → TASK-03 → TASK-04 → TASK-05 → TASK-06 → TASK-07 → TASK-08 → TASK-09 → TASK-10 → TASK-11 → TASK-15

**Ready to Start**: TASK-01, TASK-02, TASK-03 (no blockers)
