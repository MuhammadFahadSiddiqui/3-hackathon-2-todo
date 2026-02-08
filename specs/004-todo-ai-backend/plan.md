# Implementation Plan: Todo AI Chatbot Backend

**Branch**: `004-todo-ai-backend` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-todo-ai-backend/spec.md`

## Summary

Add an AI-powered, stateless chatbot backend for todo management. The system uses OpenAI Agents SDK for natural language understanding and MCP (Model Context Protocol) tools for task CRUD operations. All state (conversations, messages) is persisted in Neon PostgreSQL, ensuring fully stateless request processing. The chat API endpoint (`POST /api/chat`) integrates with the existing JWT authentication system.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, MCP SDK, SQLModel, PyJWT
**Storage**: Neon Serverless PostgreSQL (existing)
**Testing**: Manual API testing (curl/Postman)
**Target Platform**: Linux server (Railway deployment)
**Project Type**: Web application (backend extension)
**Performance Goals**: <5 second response time per chat message
**Constraints**: Stateless architecture, no in-memory state, JWT authentication required
**Scale/Scope**: Single-user concurrent requests, conversation history persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | ✅ PASS | Feature derived from spec.md with FR-001 to FR-024 |
| II. Correctness Over Speed | ✅ PASS | API contracts defined, stateless architecture ensures correctness |
| III. Security-First Design | ✅ PASS | JWT auth required (FR-016), user isolation enforced (FR-017, FR-018) |
| IV. Reproducibility | ✅ PASS | All changes traced to spec, SQLModel migrations for DB schema |
| V. Maintainability | ✅ PASS | New files only, no modification to existing code |
| VI. Traceability | ✅ PASS | PHR created, all work linked to 004-todo-ai-backend spec |

**Phase-III Specific Compliance**:
- ✅ Uses OpenAI Agents SDK (mandated)
- ✅ Uses MCP SDK for tools (mandated)
- ✅ Stateless chat API with DB persistence (mandated)
- ✅ No breaking changes to existing features (mandated)

## Project Structure

### Documentation (this feature)

```text
specs/004-todo-ai-backend/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Technology research
├── data-model.md        # Phase 1: Entity definitions
├── contracts/           # Phase 1: API contracts
│   └── chat-api.yaml    # OpenAPI spec for chat endpoint
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2: Implementation tasks
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/
│   │   ├── conversation.py    # NEW: Conversation model
│   │   └── message.py         # NEW: Message model
│   ├── routes/
│   │   └── chat.py            # NEW: Chat API endpoint
│   ├── services/
│   │   └── chat_service.py    # NEW: Chat business logic
│   ├── ai/
│   │   ├── agent.py           # NEW: OpenAI Agent configuration
│   │   └── tools.py           # NEW: MCP tool definitions
│   ├── schemas/
│   │   └── chat.py            # NEW: Chat request/response schemas
│   └── main.py                # EXTEND: Add chat router (1 line)
└── requirements.txt           # EXTEND: Add openai, mcp dependencies

frontend/
├── lib/
│   └── chat-api.ts            # NEW: Chat API client
└── (Spec-5 will add chat UI components)
```

**Structure Decision**: Web application structure with backend-only changes for this spec. Frontend chat UI deferred to Spec-5. All new files added in isolation; only `main.py` receives a single router addition.

## Safe Extension Points (from codebase review)

### Backend Extensions

| Location | Action | Purpose |
|----------|--------|---------|
| `app/models/conversation.py` | CREATE | New SQLModel for conversations |
| `app/models/message.py` | CREATE | New SQLModel for messages |
| `app/routes/chat.py` | CREATE | Chat API endpoint with JWT auth |
| `app/services/chat_service.py` | CREATE | Business logic for chat processing |
| `app/ai/agent.py` | CREATE | OpenAI Agents SDK configuration |
| `app/ai/tools.py` | CREATE | MCP tool definitions for task CRUD |
| `app/schemas/chat.py` | CREATE | Pydantic schemas for chat API |
| `app/models/__init__.py` | EXTEND | Export new models (2 lines) |
| `app/main.py` | EXTEND | Include chat router (1 line) |
| `requirements.txt` | EXTEND | Add openai, mcp dependencies |

### Frontend Extensions (minimal for backend integration)

| Location | Action | Purpose |
|----------|--------|---------|
| `lib/chat-api.ts` | CREATE | Chat API client using existing apiRequest |

### Reusable Components (no modification needed)

| Component | Usage |
|-----------|-------|
| `app/auth/dependencies.py` | `Depends(get_current_user)` for JWT auth |
| `app/database.py` | `Depends(get_session)` for DB access |
| `app/models/task.py` | Existing Task model for MCP tools |
| `lib/api.ts` | `apiRequest()` function for authenticated calls |

## Implementation Phases

### Phase 1: Database Models & Schema

1. Create `Conversation` model with user_id, created_at, updated_at
2. Create `Message` model with conversation_id, role, content, tool_calls, created_at
3. Update `app/models/__init__.py` to export new models
4. Tables auto-created on FastAPI startup via SQLModel

### Phase 2: MCP Tools Implementation

1. Create `app/ai/tools.py` with MCP tool definitions:
   - `add_task(title, description?)` → creates task
   - `list_tasks(status: all|pending|completed)` → returns tasks
   - `complete_task(task_id)` → marks task complete
   - `update_task(task_id, title?, description?)` → updates task
   - `delete_task(task_id)` → removes task
2. Each tool uses existing database operations from `app/routes/tasks.py` patterns

### Phase 3: AI Agent Configuration

1. Create `app/ai/agent.py` with OpenAI Agents SDK setup
2. Configure agent with system prompt for todo assistance
3. Register MCP tools with agent
4. Handle tool execution and response formatting

### Phase 4: Chat API Endpoint

1. Create `app/schemas/chat.py` with ChatRequest, ChatResponse
2. Create `app/services/chat_service.py` for business logic:
   - Load conversation history from DB
   - Send to AI agent with context
   - Execute tool calls
   - Persist messages
   - Return response
3. Create `app/routes/chat.py` with `POST /api/chat` endpoint
4. Use `Depends(get_current_user)` for JWT authentication
5. Add router to `app/main.py`

### Phase 5: Frontend API Client

1. Create `lib/chat-api.ts` with:
   - `sendMessage(message)` → POST /api/chat
   - `getConversationHistory()` → GET /api/chat/history (optional)
2. Use existing `apiRequest()` for authenticated calls

### Phase 6: Error Handling & Testing

1. Add error handling for AI service failures
2. Add friendly error messages for common scenarios
3. Test all MCP tools via chat interface
4. Verify stateless behavior (restart server, check conversation persists)

## Environment Variables

```bash
# Add to backend/.env
OPENAI_API_KEY=sk-...               # OpenAI API key for Agents SDK
OPENAI_MODEL=gpt-4o-mini            # Model for chat completions (cost-effective)
```

## Complexity Tracking

No constitution violations. All implementation follows existing patterns with minimal extensions.

## Dependencies to Add

```text
# backend/requirements.txt additions
openai>=1.0.0
mcp>=0.1.0  # Official MCP SDK (if available, otherwise implement tool protocol)
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| OpenAI API rate limits | Use gpt-4o-mini for lower cost/latency |
| MCP SDK availability | Implement tool calling protocol manually if needed |
| Token context limits | Limit conversation history to last 20 messages |
| AI hallucinations | Validate tool call parameters before execution |
