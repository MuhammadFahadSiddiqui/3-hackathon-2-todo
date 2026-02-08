# Data Model: Todo AI Chatbot Backend

**Feature**: 004-todo-ai-backend
**Date**: 2026-02-07
**Purpose**: Define database entities for chat functionality

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    user_auth    │       │  conversation   │       │     message     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────<│ id (PK)         │──────<│ id (PK)         │
│ email           │       │ user_id (FK)    │       │ conversation_id │
│ password_hash   │       │ created_at      │       │ role            │
│ name            │       │ updated_at      │       │ content         │
│ created_at      │       └─────────────────┘       │ tool_calls      │
│ updated_at      │                                 │ tool_results    │
└─────────────────┘                                 │ created_at      │
                                                    └─────────────────┘
        │
        │
        ▼
┌─────────────────┐
│     tasks       │  (existing - used by MCP tools)
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ title           │
│ description     │
│ is_completed    │
│ created_at      │
│ updated_at      │
│ deadline_at     │
│ reminder_*      │
└─────────────────┘
```

## New Entities

### Conversation

Represents a chat session between a user and the AI assistant.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique conversation identifier |
| user_id | String(36) | Not Null, Index, FK → user_auth.id | Owner of the conversation |
| created_at | DateTime | Not Null, Default: now() | When conversation started |
| updated_at | DateTime | Not Null, Default: now() | Last activity timestamp |

**Business Rules**:
- Each user has exactly one active conversation (for simplicity)
- Conversation is created on first chat message
- updated_at is refreshed on each new message

**SQLModel Definition**:
```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, max_length=36)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

### Message

Represents a single message in a conversation (user, assistant, or tool response).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique message identifier |
| conversation_id | Integer | Not Null, FK → conversations.id, Index | Parent conversation |
| role | String(20) | Not Null | "user", "assistant", or "tool" |
| content | Text | Not Null | Message text content |
| tool_calls | Text | Nullable | JSON array of tool call requests |
| tool_results | Text | Nullable | JSON of tool execution results |
| created_at | DateTime | Not Null, Default: now() | When message was created |

**Business Rules**:
- Messages are ordered by created_at within a conversation
- tool_calls is populated for assistant messages that invoke tools
- tool_results stores the output from tool execution
- Content may be empty for tool-only messages

**Role Values**:
| Role | Description |
|------|-------------|
| user | Message from the authenticated user |
| assistant | Response from the AI assistant |
| tool | Result from MCP tool execution |

**SQLModel Definition**:
```python
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

---

## Existing Entities (Reference Only)

### Task (from Phase-I)

Used by MCP tools for CRUD operations. **No modifications needed**.

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| user_id | String(36) | Owner of the task |
| title | String(500) | Task title |
| description | Text | Optional description |
| is_completed | Boolean | Completion status |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |
| deadline_at | DateTime | Optional deadline |
| reminder_interval_minutes | Integer | Reminder frequency |
| last_reminded_at | DateTime | Last reminder sent |

---

## Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| conversations | idx_conversations_user_id | user_id | Fast lookup by user |
| messages | idx_messages_conversation_id | conversation_id | Fast message retrieval |
| messages | idx_messages_created_at | created_at | Chronological ordering |

---

## Validation Rules

### Conversation
- user_id must reference existing user_auth.id
- created_at must be <= updated_at

### Message
- conversation_id must reference existing conversations.id
- role must be one of: "user", "assistant", "tool"
- content can be empty string but not null
- tool_calls must be valid JSON array if present
- tool_results must be valid JSON object if present

---

## Sample Data

### Conversation
```json
{
  "id": 1,
  "user_id": "b8cca717-86cb-4444-93bd-4b71e2bdc875",
  "created_at": "2026-02-07T10:00:00Z",
  "updated_at": "2026-02-07T10:05:00Z"
}
```

### Messages (in order)
```json
[
  {
    "id": 1,
    "conversation_id": 1,
    "role": "user",
    "content": "Add a task to buy groceries",
    "tool_calls": null,
    "tool_results": null,
    "created_at": "2026-02-07T10:00:00Z"
  },
  {
    "id": 2,
    "conversation_id": 1,
    "role": "assistant",
    "content": "",
    "tool_calls": "[{\"name\": \"add_task\", \"arguments\": {\"title\": \"Buy groceries\"}}]",
    "tool_results": null,
    "created_at": "2026-02-07T10:00:01Z"
  },
  {
    "id": 3,
    "conversation_id": 1,
    "role": "tool",
    "content": "",
    "tool_calls": null,
    "tool_results": "{\"success\": true, \"task\": {\"id\": 5, \"title\": \"Buy groceries\"}}",
    "created_at": "2026-02-07T10:00:02Z"
  },
  {
    "id": 4,
    "conversation_id": 1,
    "role": "assistant",
    "content": "I've added \"Buy groceries\" to your task list!",
    "tool_calls": null,
    "tool_results": null,
    "created_at": "2026-02-07T10:00:03Z"
  }
]
```

---

## Migration Notes

Tables will be auto-created by SQLModel on FastAPI startup via:
```python
SQLModel.metadata.create_all(engine)
```

No manual migration scripts needed for initial creation. Models must be imported in `app/database.py`:
```python
from app.models.conversation import Conversation  # noqa: F401
from app.models.message import Message  # noqa: F401
```
