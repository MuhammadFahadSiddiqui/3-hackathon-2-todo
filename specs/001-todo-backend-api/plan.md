# Implementation Plan: Core Todo Backend API & Database Layer

**Branch**: `001-todo-backend-api` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-backend-api/spec.md`

## Summary

Implement a RESTful API backend for a multi-user todo application using Python FastAPI with SQLModel ORM connected to Neon Serverless PostgreSQL. The API provides six endpoints for task CRUD operations and completion tracking, with strict user-scoped data isolation at the database query level. This feature establishes the data persistence layer that will later integrate with JWT authentication.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, SQLModel, Uvicorn, python-dotenv, asyncpg
**Storage**: Neon Serverless PostgreSQL (connection via DATABASE_URL environment variable)
**Testing**: pytest, httpx (for async API testing)
**Target Platform**: Linux server / containerized deployment
**Project Type**: Web application (backend only for this feature)
**Performance Goals**: <500ms response time per request under normal load
**Constraints**: All queries scoped by user_id; no authentication in this feature
**Scale/Scope**: Single-user to small-team usage; ~1000 tasks per user maximum

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | ✅ PASS | All endpoints derived from spec.md FR-001 to FR-016 |
| II. Correctness Over Speed | ✅ PASS | HTTP semantics strictly defined; all edge cases documented |
| III. Security-First Design | ⚠️ DEFERRED | Auth explicitly out of scope per spec; data isolation enforced |
| IV. User Data Isolation | ✅ PASS | All queries scoped by user_id (FR-008); cross-user access returns 404 |
| V. Maintainability | ✅ PASS | Clear separation: models, routes, database config |
| VI. API Contract Stability | ✅ PASS | Contracts defined in /contracts/; no breaking changes |

**Deferred Item Justification**: Security-First Design principle requires JWT validation, but spec explicitly excludes auth (Out of Scope). This feature prepares for future auth integration by:
- Using user_id path parameter that will be validated against JWT claims
- Implementing query-level isolation that auth middleware will enforce
- Structuring routes to accept auth dependency injection

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-backend-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml     # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # SQLModel engine and session management
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py          # Task SQLModel
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py          # Pydantic request/response schemas
│   └── routes/
│       ├── __init__.py
│       └── tasks.py         # Task CRUD endpoints
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # pytest fixtures
│   └── test_tasks.py        # API endpoint tests
├── requirements.txt
├── .env.example
└── README.md
```

**Structure Decision**: Using web application structure with `/backend` directory. This prepares for future frontend integration while keeping backend self-contained. The `/app` subdirectory follows FastAPI conventions with clear separation of models, schemas, and routes.

## Complexity Tracking

> No complexity violations. Design follows constitution principles with minimal justified deviations.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Sync vs Async DB | Async (asyncpg) | Neon PostgreSQL works well with async; better scalability |
| Schema Separation | Separate Pydantic schemas from SQLModel | Cleaner API contracts; prevents ORM internals leaking |
| Repository Pattern | Not used | Direct SQLModel queries sufficient for CRUD; no complex business logic |

## Implementation Phases

### Phase 1: Project Setup
- Initialize Python project with pyproject.toml or requirements.txt
- Configure FastAPI application with CORS (permissive for development)
- Set up environment variable loading (python-dotenv)
- Create database connection module with async session management

### Phase 2: Data Model
- Define Task SQLModel with all specified fields
- Implement table creation/migration logic
- Add field validators (title length, description length)

### Phase 3: API Routes
- Implement all six endpoints per contracts/openapi.yaml
- Add request validation using Pydantic schemas
- Ensure all queries include user_id filter
- Return appropriate HTTP status codes

### Phase 4: Error Handling
- Implement consistent error response format
- Handle database connection failures (503)
- Handle validation errors (422)
- Handle not found (404)

### Phase 5: Verification
- Manual API testing with curl/httpie
- Verify data persistence across restarts
- Confirm user isolation (cross-user 404s)
