# Data Model: Core Todo Backend API

**Feature Branch**: `001-todo-backend-api`
**Date**: 2026-01-10
**Status**: Complete

## Entities

### Task

Represents a todo item belonging to a specific user.

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Generated | Unique task identifier |
| user_id | String(36) | NOT NULL, INDEX | Required | Owner's user identifier (UUID format) |
| title | String(500) | NOT NULL | Required | Task title (1-500 chars, non-empty) |
| description | Text | NULLABLE | NULL | Optional task description |
| is_completed | Boolean | NOT NULL | FALSE | Completion status |
| created_at | Timestamp | NOT NULL | CURRENT_TIMESTAMP | Creation timestamp (UTC) |
| updated_at | Timestamp | NOT NULL | CURRENT_TIMESTAMP | Last update timestamp (UTC) |

### Indexes

| Index Name | Columns | Type | Rationale |
|------------|---------|------|-----------|
| pk_tasks | id | PRIMARY | Row identification |
| ix_tasks_user_id | user_id | B-TREE | Fast user task lookups |
| ix_tasks_user_id_id | user_id, id | COMPOSITE | Efficient user-scoped single task access |

### Constraints

| Constraint | Type | Definition | Rationale |
|------------|------|------------|-----------|
| title_not_empty | CHECK | `length(trim(title)) > 0` | Business rule: title cannot be empty/whitespace |
| title_max_length | CHECK | `length(title) <= 500` | Spec requirement FR-006 |

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                          Task                               │
├─────────────────────────────────────────────────────────────┤
│ PK  id              INTEGER AUTO_INCREMENT                  │
│     user_id         VARCHAR(36) NOT NULL [INDEX]            │
│     title           VARCHAR(500) NOT NULL                   │
│     description     TEXT NULL                               │
│     is_completed    BOOLEAN DEFAULT FALSE                   │
│     created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP     │
│     updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP     │
└─────────────────────────────────────────────────────────────┘
```

Note: No foreign key to a Users table in this phase (auth not implemented).

## State Transitions

### Task Completion State

```
┌──────────────┐                      ┌──────────────┐
│              │   PATCH /complete    │              │
│ is_completed │ ──────────────────► │ is_completed │
│   = false    │                      │   = true     │
│              │                      │              │
└──────────────┘                      └──────────────┘
```

- Transition is one-way (no "uncomplete" endpoint in current spec)
- Transition is idempotent (calling complete on completed task returns 200)

## Validation Rules

### Create Task (POST)

| Field | Validation | Error |
|-------|------------|-------|
| title | Required, non-empty after trim, max 500 chars | 422 Validation Error |
| description | Optional, any string or null | N/A |

### Update Task (PUT)

| Field | Validation | Error |
|-------|------------|-------|
| title | Required, non-empty after trim, max 500 chars | 422 Validation Error |
| description | Optional, any string or null | N/A |

### Path Parameters

| Parameter | Validation | Error |
|-----------|------------|-------|
| user_id | Required, non-empty string | 422 Validation Error |
| id | Required, positive integer | 422 Validation Error |

## Schema Definitions (Pydantic)

### TaskCreate (Request Body for POST)

```python
class TaskCreate(BaseModel):
    title: str  # Required, min_length=1 after strip, max_length=500
    description: Optional[str] = None
```

### TaskUpdate (Request Body for PUT)

```python
class TaskUpdate(BaseModel):
    title: str  # Required, min_length=1 after strip, max_length=500
    description: Optional[str] = None
```

### TaskResponse (Response Body)

```python
class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime
```

### TaskListResponse (Response Body for GET list)

```python
# Returns List[TaskResponse]
```

## Sample Data

### Valid Task

```json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "is_completed": false,
  "created_at": "2026-01-10T10:30:00Z",
  "updated_at": "2026-01-10T10:30:00Z"
}
```

### Minimal Task (no description)

```json
{
  "id": 2,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Call dentist",
  "description": null,
  "is_completed": false,
  "created_at": "2026-01-10T11:00:00Z",
  "updated_at": "2026-01-10T11:00:00Z"
}
```

## Migration Strategy

For initial deployment:
1. Use SQLModel's `SQLModel.metadata.create_all(engine)` to create tables
2. No migration tooling (Alembic) required for Phase 1
3. Future phases should adopt Alembic for schema versioning

## Data Isolation Guarantee

Per Constitution Section III (Security-First Design):
- Every SELECT query MUST include `WHERE user_id = :user_id`
- Every UPDATE query MUST include `WHERE user_id = :user_id AND id = :id`
- Every DELETE query MUST include `WHERE user_id = :user_id AND id = :id`
- Queries returning no rows → 404 Not Found (prevents user enumeration)
