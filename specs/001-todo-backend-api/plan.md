# Implementation Plan: Core Todo Backend API & Database Layer

**Branch**: `001-todo-backend-api` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-backend-api/spec.md`

## Summary

Implement a RESTful Todo API backend using FastAPI with SQLModel ORM connected to Neon Serverless PostgreSQL. The API provides full CRUD operations for tasks with strict user isolation at the query level. All tasks are scoped by user_id to prevent cross-user data access. This phase implements the data layer and API without authentication (auth deferred to future phase).

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.109+, SQLModel 0.0.16+, Pydantic 2.x, uvicorn 0.27+
**Storage**: Neon Serverless PostgreSQL (via psycopg2-binary)
**Testing**: Manual API testing (curl/Postman), pytest available for future
**Target Platform**: Linux server / Docker container
**Project Type**: Web application (backend only in this phase)
**Performance Goals**: <500ms response time per SC-001
**Constraints**: SSL required for Neon, environment-based config only
**Scale/Scope**: 100 concurrent requests, 10,000 tasks per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | ✅ PASS | Implementation follows spec.md FR-001 through FR-013 |
| II. Correctness Over Speed | ✅ PASS | API contracts defined in OpenAPI, validation on all inputs |
| III. Security-First Design | ✅ PASS (scoped) | User isolation via query-level filtering; auth deferred per spec Out of Scope |
| IV. Reproducibility | ✅ PASS | All config via environment variables, deterministic schema creation |
| V. Maintainability | ✅ PASS | Clear separation: models/schemas/routes pattern |
| VI. Traceability | ✅ PASS | All endpoints trace to spec requirements (FR-001, FR-002) |

**Gate Result**: PASS - No violations requiring justification

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-backend-api/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology decisions
├── data-model.md        # Entity definitions
├── quickstart.md        # Setup and verification guide
├── contracts/
│   └── openapi.yaml     # API contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Implementation tasks (via /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py          # Package marker
│   ├── main.py              # FastAPI app entry point, router registration
│   ├── config.py            # Settings from environment variables
│   ├── database.py          # SQLModel engine, session dependency
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py          # Task SQLModel (table=True)
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py          # TaskCreate, TaskUpdate, TaskResponse
│   └── routes/
│       ├── __init__.py
│       └── tasks.py         # /api/{user_id}/tasks endpoints
├── requirements.txt         # Python dependencies
├── .env.example            # Template for DATABASE_URL
└── README.md               # Backend-specific documentation
```

**Structure Decision**: Web application backend-only structure. Frontend will be added in a separate feature branch. The `app/` package follows FastAPI conventions with models, schemas, and routes separation for maintainability.

## Complexity Tracking

No violations requiring justification. The structure follows minimal complexity principles:

- Single Task entity (no over-engineering)
- Flat route structure (no nested routers)
- Direct database access (no repository abstraction)
- Synchronous operations (no async complexity)

## Design Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | ✅ Complete |
| Data Model | [data-model.md](./data-model.md) | ✅ Complete |
| API Contract | [contracts/openapi.yaml](./contracts/openapi.yaml) | ✅ Complete |
| Quickstart | [quickstart.md](./quickstart.md) | ✅ Complete |

## Implementation Phases

### Phase 1: Setup (Tasks T001-T003)

- Create backend directory structure
- Initialize Python project with requirements.txt
- Create .env.example with DATABASE_URL template

### Phase 2: Foundational (Tasks T004-T009)

- Implement config.py for environment loading
- Implement database.py with engine and session
- Create Task model with all fields
- Create Pydantic schemas for requests/responses

### Phase 3-8: User Stories (Tasks T010-T027)

- Implement each CRUD endpoint following spec acceptance scenarios
- User Story 1 (P1): Create Task
- User Story 2 (P1): List Tasks
- User Story 3 (P2): Get Task
- User Story 4 (P2): Update Task
- User Story 5 (P2): Delete Task
- User Story 6 (P3): Complete Task

### Phase 9: Polish (Tasks T028-T030)

- Verify all endpoints match OpenAPI contract
- Run quickstart validation
- Document any deviations

## Key Implementation Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sync vs Async | Synchronous | Simpler, sufficient for scale |
| ORM Pattern | Direct SQLModel | Avoids repository overhead |
| ID Type | Integer (SERIAL) | Per spec requirement |
| Timestamps | Server-side default | Consistent UTC |
| Error Handling | FastAPI HTTPException | Standard JSON errors |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Neon connection issues | SSL mode required, connection retry logic |
| SQL injection | SQLModel parameterized queries |
| User enumeration | 404 for both missing and unauthorized |
| Schema drift | OpenAPI as source of truth |

## Next Steps

1. Run `/sp.tasks` to generate detailed implementation task list
2. Execute tasks in order, marking complete as done
3. Validate against quickstart.md after implementation
4. Run acceptance tests per spec scenarios
