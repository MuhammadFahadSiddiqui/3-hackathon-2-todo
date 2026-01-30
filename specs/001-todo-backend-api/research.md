# Research: Core Todo Backend API & Database Layer

**Feature Branch**: `001-todo-backend-api`
**Date**: 2026-01-10
**Status**: Complete

## Overview

This document captures research findings and technical decisions for implementing the Todo Backend API using FastAPI, SQLModel, and Neon PostgreSQL.

## Research Topics

### 1. FastAPI Project Structure

**Decision**: Use a flat app-based structure optimized for single-feature backends

**Rationale**:
- FastAPI convention uses `app/` directory as main package
- Separating models, routes, and schemas provides clear responsibility boundaries
- Single `main.py` entry point simplifies deployment and testing

**Alternatives Considered**:
- Domain-driven design (DDD) structure - Rejected: overkill for CRUD API
- Single-file approach - Rejected: poor maintainability as features grow

**Chosen Structure**:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app entry point
│   ├── config.py         # Environment configuration
│   ├── database.py       # SQLModel engine and session
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py       # Task SQLModel
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py       # Pydantic request/response schemas
│   └── routes/
│       ├── __init__.py
│       └── tasks.py      # Task CRUD endpoints
├── requirements.txt
├── .env.example
└── README.md
```

### 2. SQLModel with Neon PostgreSQL

**Decision**: Use synchronous SQLModel with psycopg2 driver

**Rationale**:
- SQLModel provides unified Pydantic + SQLAlchemy models
- Neon PostgreSQL supports standard PostgreSQL connections
- Synchronous approach is simpler and sufficient for this use case
- FastAPI handles concurrency at the request level

**Alternatives Considered**:
- Async SQLAlchemy with asyncpg - Rejected: adds complexity without clear benefit for this scale
- Raw SQL with psycopg2 - Rejected: loses type safety and ORM benefits

**Connection Pattern**:
```python
# Use DATABASE_URL from environment
# Format: postgresql://user:pass@host:port/dbname?sslmode=require
```

### 3. Session Management

**Decision**: Use FastAPI dependency injection with `yield` pattern

**Rationale**:
- Ensures proper session cleanup after each request
- Integrates cleanly with FastAPI's dependency system
- Provides automatic rollback on exceptions

**Pattern**:
```python
def get_session():
    with Session(engine) as session:
        yield session
```

### 4. User Isolation Strategy

**Decision**: Filter by user_id at query level in every database operation

**Rationale**:
- Constitution requires: "User data isolation MUST be enforced at the backend query level"
- Returning 404 (not 403) prevents user enumeration attacks
- Query-level filtering is more reliable than application-level checks

**Pattern**:
```python
# Every query includes user_id filter
statement = select(Task).where(Task.user_id == user_id, Task.id == task_id)
```

### 5. Error Response Format

**Decision**: Use consistent JSON error structure

**Rationale**:
- Constitution requires: "API returns consistent JSON response structure"
- FastAPI's HTTPException provides this by default
- Custom exception handlers can extend for specific cases

**Format**:
```json
{
  "detail": "Task not found"
}
```

### 6. Input Validation

**Decision**: Use Pydantic models with custom validators

**Rationale**:
- FastAPI automatically validates request bodies against Pydantic schemas
- Returns 422 with detailed validation errors
- Supports custom validators for business rules (e.g., non-empty title)

**Validation Rules**:
- `title`: Required, non-empty after strip, max 500 characters
- `description`: Optional, nullable
- `user_id`: Required path parameter (string)
- `task_id`: Required path parameter (integer)

### 7. ID Generation

**Decision**: Use PostgreSQL SERIAL (auto-increment) for task IDs

**Rationale**:
- Spec requires: "System MUST auto-generate unique integer IDs"
- PostgreSQL SERIAL is simple and reliable
- No need for UUIDs since tasks are scoped by user

### 8. Timestamp Handling

**Decision**: Use `server_default` for created_at with UTC timezone

**Rationale**:
- Spec requires: "System MUST auto-generate created_at timestamp"
- Server-side default ensures consistency
- UTC avoids timezone confusion

**Pattern**:
```python
created_at: datetime = Field(
    default_factory=datetime.utcnow,
    sa_column_kwargs={"server_default": func.now()}
)
```

## Technology Versions

| Component | Version | Notes |
|-----------|---------|-------|
| Python | 3.11+ | Required for modern type hints |
| FastAPI | 0.109+ | Latest stable |
| SQLModel | 0.0.16+ | Latest stable |
| Pydantic | 2.x | Via SQLModel |
| psycopg2-binary | 2.9+ | PostgreSQL driver |
| python-dotenv | 1.0+ | Environment loading |
| uvicorn | 0.27+ | ASGI server |

## Security Considerations

1. **No Auth in This Phase**: Authentication is explicitly out of scope per spec
2. **SQL Injection Prevention**: SQLModel/SQLAlchemy parameterizes all queries
3. **Environment Variables**: DATABASE_URL must never be hardcoded
4. **SSL Required**: Neon requires SSL connections (`sslmode=require`)

## Performance Considerations

1. **Connection Pooling**: SQLModel's default pool is sufficient for initial scale
2. **Query Efficiency**: Single-table queries with indexed user_id
3. **Response Time**: Target <500ms per spec SC-001

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Async vs Sync? | Sync - simpler, sufficient for scale |
| UUID vs Integer IDs? | Integer - spec requires, simpler |
| Soft delete? | No - explicitly out of scope |
| updated_at field? | Yes - useful for debugging, low cost |
