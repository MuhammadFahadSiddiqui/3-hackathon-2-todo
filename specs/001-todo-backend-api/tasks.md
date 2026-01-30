# Tasks: Core Todo Backend API & Database Layer

**Input**: Design documents from `/specs/001-todo-backend-api/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/openapi.yaml

**Tests**: Tests are NOT explicitly requested in the feature specification. Manual API testing via curl/Postman is the validation method per spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app backend**: `backend/app/` structure per plan.md

---

## Phase 1: Setup

**Purpose**: Project initialization and directory structure

- [x] T001 Create backend directory structure: backend/app/, backend/app/models/, backend/app/schemas/, backend/app/routes/
- [x] T002 [P] Create requirements.txt in backend/ with dependencies: fastapi>=0.109.0, sqlmodel>=0.0.16, uvicorn>=0.27.0, psycopg2-binary>=2.9.0, python-dotenv>=1.0.0
- [x] T003 [P] Create .env.example in backend/ with DATABASE_URL template for Neon PostgreSQL
- [x] T004 [P] Create backend/README.md with setup and run instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create backend/app/__init__.py as empty package marker
- [x] T006 [P] Create backend/app/models/__init__.py as empty package marker
- [x] T007 [P] Create backend/app/schemas/__init__.py as empty package marker
- [x] T008 [P] Create backend/app/routes/__init__.py as empty package marker
- [x] T009 Implement backend/app/config.py with Settings class loading DATABASE_URL from environment using python-dotenv
- [x] T010 Implement backend/app/database.py with SQLModel engine creation, get_session dependency using yield pattern per research.md
- [x] T011 Create Task SQLModel in backend/app/models/task.py with fields: id (int, primary_key), user_id (str, index), title (str, max 500), description (Optional[str]), is_completed (bool, default=False), created_at (datetime), updated_at (datetime)
- [x] T012 Export Task model in backend/app/models/__init__.py
- [x] T013 [P] Create TaskCreate schema in backend/app/schemas/task.py with title (str, required, max 500) and description (Optional[str])
- [x] T014 [P] Create TaskUpdate schema in backend/app/schemas/task.py with title (str, required, max 500) and description (Optional[str])
- [x] T015 [P] Create TaskResponse schema in backend/app/schemas/task.py with all Task fields including id, user_id, is_completed, created_at, updated_at
- [x] T016 Export all schemas in backend/app/schemas/__init__.py
- [x] T017 Implement custom validator in TaskCreate and TaskUpdate to reject empty/whitespace-only titles
- [x] T018 Create backend/app/main.py with FastAPI app instance, include tasks router, add startup event to create database tables using SQLModel.metadata.create_all

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create a New Task (Priority: P1) 🎯 MVP

**Goal**: Allow API consumers to create new tasks for a user with persistent storage

**Independent Test**: POST /api/{user_id}/tasks with valid title returns 201 with created task including generated id

**Spec Reference**: FR-001, FR-003, FR-005, FR-006, FR-007, FR-008, FR-009, FR-013

### Implementation for User Story 1

- [x] T019 [US1] Create tasks router file backend/app/routes/tasks.py with APIRouter prefix="/api/{user_id}/tasks"
- [x] T020 [US1] Implement POST /api/{user_id}/tasks endpoint in backend/app/routes/tasks.py: accept TaskCreate body, create Task with user_id from path, save to database, return TaskResponse with status 201
- [x] T021 [US1] Add title validation in POST endpoint: reject empty title with 422 response per acceptance scenario 3-4
- [x] T022 [US1] Register tasks router in backend/app/main.py

**Checkpoint**: User Story 1 complete - can create tasks via POST, verify with curl

---

## Phase 4: User Story 2 - List All Tasks for a User (Priority: P1) 🎯 MVP

**Goal**: Allow API consumers to retrieve all tasks belonging to a specific user

**Independent Test**: GET /api/{user_id}/tasks returns 200 with array of tasks (or empty array)

**Spec Reference**: FR-001, FR-004, FR-005, FR-011

### Implementation for User Story 2

- [x] T023 [US2] Implement GET /api/{user_id}/tasks endpoint in backend/app/routes/tasks.py: query all tasks WHERE user_id matches path parameter, return List[TaskResponse] with status 200
- [x] T024 [US2] Ensure query filters by user_id to enforce data isolation per FR-004 and Constitution III

**Checkpoint**: User Stories 1 AND 2 complete - can create and list tasks, MVP functional

---

## Phase 5: User Story 3 - Retrieve a Single Task (Priority: P2)

**Goal**: Allow API consumers to retrieve a specific task by ID

**Independent Test**: GET /api/{user_id}/tasks/{id} returns 200 with task or 404 if not found

**Spec Reference**: FR-001, FR-004, FR-011, FR-012

### Implementation for User Story 3

- [x] T025 [US3] Implement GET /api/{user_id}/tasks/{id} endpoint in backend/app/routes/tasks.py: query task WHERE id AND user_id match, return TaskResponse with status 200
- [x] T026 [US3] Add 404 handling: if task not found OR user_id mismatch, raise HTTPException(404, "Task not found")

**Checkpoint**: User Story 3 complete - can retrieve single task with user isolation

---

## Phase 6: User Story 4 - Update a Task (Priority: P2)

**Goal**: Allow API consumers to update an existing task's title and description

**Independent Test**: PUT /api/{user_id}/tasks/{id} with valid data returns 200 with updated task

**Spec Reference**: FR-001, FR-004, FR-005, FR-006, FR-011, FR-012

### Implementation for User Story 4

- [x] T027 [US4] Implement PUT /api/{user_id}/tasks/{id} endpoint in backend/app/routes/tasks.py: query task WHERE id AND user_id match, update title and description from TaskUpdate body, update updated_at timestamp, return TaskResponse with status 200
- [x] T028 [US4] Add 404 handling for non-existent or different-user tasks
- [x] T029 [US4] Add 422 handling for empty title validation (reuse validator from TaskUpdate schema)

**Checkpoint**: User Story 4 complete - can update tasks with validation

---

## Phase 7: User Story 5 - Delete a Task (Priority: P2)

**Goal**: Allow API consumers to delete tasks they no longer need

**Independent Test**: DELETE /api/{user_id}/tasks/{id} returns 204 with no content

**Spec Reference**: FR-001, FR-004, FR-011, FR-012

### Implementation for User Story 5

- [x] T030 [US5] Implement DELETE /api/{user_id}/tasks/{id} endpoint in backend/app/routes/tasks.py: query task WHERE id AND user_id match, delete from database, return status 204 with no content
- [x] T031 [US5] Add 404 handling for non-existent or different-user tasks

**Checkpoint**: User Story 5 complete - can delete tasks with user isolation

---

## Phase 8: User Story 6 - Mark a Task as Complete (Priority: P3)

**Goal**: Allow API consumers to mark tasks as completed for progress tracking

**Independent Test**: PATCH /api/{user_id}/tasks/{id}/complete returns 200 with is_completed=true

**Spec Reference**: FR-002, FR-004, FR-011, FR-012

### Implementation for User Story 6

- [x] T032 [US6] Implement PATCH /api/{user_id}/tasks/{id}/complete endpoint in backend/app/routes/tasks.py: query task WHERE id AND user_id match, set is_completed=True, update updated_at, return TaskResponse with status 200
- [x] T033 [US6] Add 404 handling for non-existent or different-user tasks
- [x] T034 [US6] Ensure idempotency: already-completed tasks return 200 (no error)

**Checkpoint**: All user stories complete - full CRUD + completion functionality

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Validation, documentation, and final verification

- [x] T035 [P] Add database connection error handling in backend/app/database.py: return 503 Service Unavailable on connection failure
- [x] T036 [P] Verify all endpoints match OpenAPI contract in specs/001-todo-backend-api/contracts/openapi.yaml
- [x] T037 Run quickstart.md validation: start server, execute all curl commands, verify responses match expected
- [x] T038 Test user isolation: create task for user-a, attempt access from user-b, verify 404 returned

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P3)
  - US1 and US2 are both P1 and can run in parallel after foundation
  - US3, US4, US5 are P2 and can run in parallel after P1 stories
  - US6 is P3 and runs after P2 stories
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent of other stories
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Independent of other stories
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Independent of other stories

### Within Each User Story

- Core implementation before error handling
- All tasks within a story should be completed sequentially
- Mark story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004 can run in parallel (Setup phase, different files)
- T006, T007, T008 can run in parallel (__init__.py files)
- T013, T014, T015 can run in parallel (schema definitions)
- T035, T036 can run in parallel (Polish phase)
- User stories at same priority can run in parallel if team capacity allows

---

## Parallel Example: Setup Phase

```bash
# Launch all parallelizable setup tasks together:
Task: "Create requirements.txt in backend/"
Task: "Create .env.example in backend/"
Task: "Create backend/README.md"
```

## Parallel Example: Foundational Phase

```bash
# Launch all __init__.py files together:
Task: "Create backend/app/models/__init__.py"
Task: "Create backend/app/schemas/__init__.py"
Task: "Create backend/app/routes/__init__.py"

# Launch all schema definitions together (after __init__.py):
Task: "Create TaskCreate schema in backend/app/schemas/task.py"
Task: "Create TaskUpdate schema in backend/app/schemas/task.py"
Task: "Create TaskResponse schema in backend/app/schemas/task.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Create Task)
4. Complete Phase 4: User Story 2 (List Tasks)
5. **STOP and VALIDATE**: Test create and list via curl
6. Deploy/demo if ready - this is a functional MVP!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 + 2 → Test independently → MVP ready
3. Add User Story 3 → Test independently → Get single task
4. Add User Story 4 → Test independently → Update tasks
5. Add User Story 5 → Test independently → Delete tasks
6. Add User Story 6 → Test independently → Complete tasks
7. Each story adds value without breaking previous stories

### Sequential Solo Strategy

For single developer working sequentially:

1. Phase 1: Setup (T001-T004) ~15 min
2. Phase 2: Foundational (T005-T018) ~45 min
3. Phase 3: User Story 1 (T019-T022) ~20 min
4. Phase 4: User Story 2 (T023-T024) ~10 min
5. **MVP CHECKPOINT** - validate basic functionality
6. Phase 5: User Story 3 (T025-T026) ~10 min
7. Phase 6: User Story 4 (T027-T029) ~15 min
8. Phase 7: User Story 5 (T030-T031) ~10 min
9. Phase 8: User Story 6 (T032-T034) ~10 min
10. Phase 9: Polish (T035-T038) ~20 min

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All queries MUST include user_id filter per Constitution III (Security-First Design)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
