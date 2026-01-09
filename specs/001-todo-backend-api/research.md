# Research: Core Todo Backend API & Database Layer

**Feature**: 001-todo-backend-api
**Date**: 2026-01-09
**Status**: Complete

## Research Questions

### 1. FastAPI + SQLModel Best Practices for Async PostgreSQL

**Decision**: Use SQLModel with async SQLAlchemy engine and asyncpg driver

**Rationale**:
- SQLModel is built on SQLAlchemy 2.0 which has first-class async support
- asyncpg is the fastest PostgreSQL driver for Python async
- Neon Serverless PostgreSQL works well with connection pooling via asyncpg
- FastAPI's dependency injection integrates cleanly with async session management

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Sync psycopg2 | Blocks event loop; poor concurrency under load |
| Databases library | Less integration with SQLModel; extra abstraction layer |
| Tortoise ORM | Not compatible with SQLModel; would require rewrite |

**Implementation Pattern**:
```python
# Async engine creation
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlmodel import SQLModel

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

# Session dependency
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(engine) as session:
        yield session
```

### 2. Neon PostgreSQL Connection String Format

**Decision**: Use `postgresql+asyncpg://` scheme with SSL required

**Rationale**:
- Neon requires SSL connections by default
- asyncpg driver specified in connection string for async support
- Connection pooling handled by Neon's serverless proxy

**Connection String Format**:
```
postgresql+asyncpg://{user}:{password}@{host}/{database}?sslmode=require
```

**Environment Variable**: `DATABASE_URL`

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| psycopg2 scheme | Not async-compatible |
| No SSL | Neon requires SSL; connections would fail |

### 3. UUID Generation Strategy

**Decision**: Server-side UUID generation using Python's `uuid.uuid4()`

**Rationale**:
- Consistent ID format across all tasks
- No dependency on PostgreSQL uuid-ossp extension
- Simpler migration path if database changes
- UUIDs prevent enumeration attacks on task IDs

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Auto-increment integers | Predictable IDs enable enumeration |
| PostgreSQL gen_random_uuid() | Adds extension dependency |
| Client-provided IDs | Opens door to ID collision attacks |

**Implementation**:
```python
from uuid import uuid4
from sqlmodel import Field

class Task(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
```

### 4. Request/Response Schema Separation

**Decision**: Use separate Pydantic models for API schemas, distinct from SQLModel

**Rationale**:
- Prevents ORM internals (relationships, metadata) from leaking to API
- Allows different validation rules for create vs update
- Cleaner OpenAPI documentation
- Easier to maintain API contract stability

**Schema Structure**:
```python
# schemas/task.py
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)

class TaskUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)

class TaskResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    completed_at: datetime | None
```

### 5. Error Response Format

**Decision**: Use consistent JSON error format with detail field

**Rationale**:
- Matches FastAPI's default HTTPException format
- Easy for clients to parse
- Consistent across all error types

**Format**:
```json
{
    "detail": "Task not found"
}
```

**HTTP Status Codes**:
| Status | Usage |
|--------|-------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (created) |
| 204 | Successful DELETE (no content) |
| 404 | Resource not found or cross-user access |
| 422 | Validation error (invalid input) |
| 503 | Database unavailable |

### 6. User Isolation Query Pattern

**Decision**: Include user_id in all WHERE clauses; return 404 for cross-user access

**Rationale**:
- Constitution requires query-level isolation (Principle IV)
- 404 prevents information leakage (attacker can't distinguish "doesn't exist" from "belongs to another user")
- Simpler than checking ownership separately and returning 403

**Implementation Pattern**:
```python
async def get_task(session: AsyncSession, user_id: str, task_id: str) -> Task | None:
    statement = select(Task).where(Task.user_id == user_id, Task.id == task_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()
```

## Dependencies Finalized

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | >=0.109.0 | Web framework |
| sqlmodel | >=0.0.14 | ORM with Pydantic integration |
| uvicorn | >=0.27.0 | ASGI server |
| asyncpg | >=0.29.0 | Async PostgreSQL driver |
| python-dotenv | >=1.0.0 | Environment variable loading |
| httpx | >=0.26.0 | Async HTTP client for testing |
| pytest | >=8.0.0 | Testing framework |
| pytest-asyncio | >=0.23.0 | Async test support |

## Open Questions Resolved

All technical questions resolved. No blockers for implementation.
