# Data Model: Core Todo Backend API

**Feature**: 001-todo-backend-api
**Date**: 2026-01-09
**Status**: Complete

## Entities

### Task

Represents a todo item belonging to a specific user.

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID (string) | Primary Key, Not Null | Auto-generated (uuid4) | Unique task identifier |
| user_id | String | Not Null, Indexed | - | Owner identifier from URL path |
| title | String(255) | Not Null, Min 1 char | - | Task title (required) |
| description | String(2000) | Nullable | NULL | Optional task details |
| completed | Boolean | Not Null | FALSE | Completion status |
| created_at | DateTime (UTC) | Not Null | Current timestamp | Creation timestamp |
| completed_at | DateTime (UTC) | Nullable | NULL | Completion timestamp |

### Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| pk_task | id | Primary Key | Unique task lookup |
| ix_task_user_id | user_id | B-tree | Fast user task listing |
| ix_task_user_id_id | user_id, id | Composite | Efficient user-scoped single task lookup |

### Constraints

| Constraint | Type | Definition | Purpose |
|------------|------|------------|---------|
| title_not_empty | Check | LENGTH(TRIM(title)) > 0 | Prevent whitespace-only titles |
| title_max_length | Check | LENGTH(title) <= 255 | Enforce max title length |
| description_max_length | Check | LENGTH(description) <= 2000 | Enforce max description length |

## SQLModel Definition

```python
from datetime import datetime
from uuid import uuid4
from sqlmodel import SQLModel, Field
from typing import Optional

class Task(SQLModel, table=True):
    """Task entity representing a todo item for a user."""

    __tablename__ = "tasks"

    id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
        max_length=36,
        description="Unique task identifier (UUID)"
    )
    user_id: str = Field(
        ...,
        index=True,
        max_length=255,
        description="Owner identifier"
    )
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Task title"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Optional task details"
    )
    completed: bool = Field(
        default=False,
        description="Completion status"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp (UTC)"
    )
    completed_at: Optional[datetime] = Field(
        default=None,
        description="Completion timestamp (UTC)"
    )
```

## Request/Response Schemas

### TaskCreate (POST request body)

```python
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)

    @field_validator('title')
    @classmethod
    def title_not_whitespace(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()
```

### TaskUpdate (PUT request body)

```python
class TaskUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)

    @field_validator('title')
    @classmethod
    def title_not_whitespace(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()
```

### TaskResponse (All responses)

```python
class TaskResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
```

### TaskListResponse (GET list response)

```python
class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
```

### ErrorResponse (Error responses)

```python
class ErrorResponse(BaseModel):
    detail: str
```

## State Transitions

### Task Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────┐    POST /tasks     ┌──────────────────────┐  │
│  │  (none)  │ ──────────────────▶│ INCOMPLETE           │  │
│  └──────────┘                    │ completed=false      │  │
│                                  │ completed_at=null    │  │
│                                  └──────────┬───────────┘  │
│                                             │               │
│                           PATCH /complete   │               │
│                                             ▼               │
│                                  ┌──────────────────────┐  │
│                                  │ COMPLETE             │  │
│                                  │ completed=true       │  │
│                                  │ completed_at=<time>  │  │
│                                  └──────────────────────┘  │
│                                                             │
│  Note: PATCH /complete is idempotent. Calling on a         │
│  completed task returns 200 OK with no state change.       │
│                                                             │
│  DELETE /tasks/{id} removes task from any state.           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Validation Rules

| Rule | Validation Point | Error Response |
|------|------------------|----------------|
| Title required | Request body | 422: "field required" |
| Title not empty | Request body | 422: "Title cannot be empty or whitespace only" |
| Title max 255 chars | Request body | 422: "ensure this value has at most 255 characters" |
| Description max 2000 chars | Request body | 422: "ensure this value has at most 2000 characters" |
| Valid UUID for task_id | URL path | 422: "Invalid task ID format" |
| Valid user_id format | URL path | 422: "Invalid user ID format" |

## Database Operations

### Query Patterns

All queries MUST include `user_id` in the WHERE clause:

```python
# List tasks for user
SELECT * FROM tasks WHERE user_id = :user_id ORDER BY created_at DESC

# Get single task
SELECT * FROM tasks WHERE user_id = :user_id AND id = :task_id

# Create task
INSERT INTO tasks (id, user_id, title, description, completed, created_at)
VALUES (:id, :user_id, :title, :description, false, :created_at)

# Update task
UPDATE tasks SET title = :title, description = :description
WHERE user_id = :user_id AND id = :task_id

# Complete task
UPDATE tasks SET completed = true, completed_at = :completed_at
WHERE user_id = :user_id AND id = :task_id

# Delete task
DELETE FROM tasks WHERE user_id = :user_id AND id = :task_id
```

### User Isolation Guarantee

All queries include `user_id` filter. Cross-user access returns empty result set, which maps to 404 response. This prevents:
- User A listing User B's tasks
- User A reading/updating/deleting User B's tasks
- Information leakage about task existence across users
