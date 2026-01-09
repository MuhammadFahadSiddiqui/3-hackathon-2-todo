# Implementation Tasks: Core Todo Backend API & Database Layer

**Feature**: 001-todo-backend-api
**Branch**: `001-todo-backend-api`
**Generated**: 2026-01-09
**Total Tasks**: 24

## Task Summary

| Phase | Description | Task Count | Parallel Opportunities |
|-------|-------------|------------|------------------------|
| Phase 1 | Setup | 5 | 2 |
| Phase 2 | Foundational | 4 | 2 |
| Phase 3 | US1+US2: Create & List Tasks (P1) | 4 | 1 |
| Phase 4 | US3: Get Single Task (P2) | 2 | 0 |
| Phase 5 | US4: Update Task (P2) | 2 | 0 |
| Phase 6 | US5: Delete Task (P2) | 2 | 0 |
| Phase 7 | US6: Mark Complete (P3) | 2 | 0 |
| Phase 8 | Polish & Error Handling | 3 | 1 |

---

## Phase 1: Setup

**Goal**: Initialize project structure and dependencies

- [x] T001 Create backend project directory structure per plan.md in backend/
- [x] T002 Create requirements.txt with FastAPI, SQLModel, uvicorn, asyncpg, python-dotenv in backend/requirements.txt
- [x] T003 [P] Create .env.example with DATABASE_URL placeholder in backend/.env.example
- [x] T004 [P] Create app package with __init__.py in backend/app/__init__.py
- [x] T005 Create config module to load DATABASE_URL from environment in backend/app/config.py

**Verification**: `pip install -r requirements.txt` succeeds; `python -c "from app.config import settings"` loads without error

---

## Phase 2: Foundational

**Goal**: Establish database connection and core models (blocking for all user stories)

- [ ] T006 Create async database engine and session dependency in backend/app/database.py
- [ ] T007 [P] Create Task SQLModel entity per data-model.md in backend/app/models/task.py
- [ ] T008 [P] Create models package __init__.py exporting Task in backend/app/models/__init__.py
- [ ] T009 Create FastAPI app with lifespan for table creation in backend/app/main.py

**Verification**: Server starts with `uvicorn app.main:app`; tables created in Neon PostgreSQL

---

## Phase 3: User Stories 1 & 2 - Create and List Tasks (P1)

**Goal**: Enable task creation and listing - the MVP foundation

**User Story 1**: As an API consumer, I want to create a new task for a specific user so that the task is persisted and can be retrieved later.

**User Story 2**: As an API consumer, I want to retrieve all tasks for a specific user so that I can display the user's complete task list.

**Independent Test Criteria**:
- POST /api/{user_id}/tasks with valid title returns 201 with task object
- POST with missing title returns 422
- GET /api/{user_id}/tasks returns array of tasks for that user only
- GET for user with no tasks returns empty array

- [ ] T010 [P] [US1+US2] Create TaskCreate and TaskResponse Pydantic schemas in backend/app/schemas/task.py
- [ ] T011 [US1+US2] Create schemas package __init__.py exporting schemas in backend/app/schemas/__init__.py
- [ ] T012 [US1+US2] Implement POST /api/{user_id}/tasks endpoint in backend/app/routes/tasks.py
- [ ] T013 [US1+US2] Implement GET /api/{user_id}/tasks endpoint in backend/app/routes/tasks.py

**Verification**:
```bash
# Create task
curl -X POST http://localhost:8000/api/user-123/tasks -H "Content-Type: application/json" -d '{"title":"Test task"}'
# Expected: 201 with task object

# List tasks
curl http://localhost:8000/api/user-123/tasks
# Expected: 200 with array containing created task

# User isolation
curl http://localhost:8000/api/other-user/tasks
# Expected: 200 with empty array (not user-123's tasks)
```

---

## Phase 4: User Story 3 - Get Single Task (P2)

**Goal**: Enable retrieving a specific task by ID

**User Story**: As an API consumer, I want to retrieve a specific task by its ID so that I can view task details or check its current state.

**Independent Test Criteria**:
- GET /api/{user_id}/tasks/{id} returns task if exists and belongs to user
- GET with non-existent ID returns 404
- GET with task belonging to different user returns 404

- [ ] T014 [US3] Implement GET /api/{user_id}/tasks/{task_id} endpoint in backend/app/routes/tasks.py
- [ ] T015 [US3] Add 404 handling for non-existent or cross-user task access in backend/app/routes/tasks.py

**Verification**:
```bash
# Get existing task (use ID from Phase 3)
curl http://localhost:8000/api/user-123/tasks/{task_id}
# Expected: 200 with task object

# Get non-existent task
curl http://localhost:8000/api/user-123/tasks/00000000-0000-0000-0000-000000000000
# Expected: 404

# Cross-user access (task belongs to user-123, accessed as other-user)
curl http://localhost:8000/api/other-user/tasks/{task_id}
# Expected: 404
```

---

## Phase 5: User Story 4 - Update Task (P2)

**Goal**: Enable updating task title and description

**User Story**: As an API consumer, I want to update an existing task's title or description so that I can correct mistakes or add details.

**Independent Test Criteria**:
- PUT /api/{user_id}/tasks/{id} with valid data returns 200 with updated task
- PUT with non-existent ID returns 404
- PUT with invalid data (empty title) returns 422
- PUT with task belonging to different user returns 404

- [ ] T016 [US4] Create TaskUpdate Pydantic schema in backend/app/schemas/task.py
- [ ] T017 [US4] Implement PUT /api/{user_id}/tasks/{task_id} endpoint in backend/app/routes/tasks.py

**Verification**:
```bash
# Update existing task
curl -X PUT http://localhost:8000/api/user-123/tasks/{task_id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title","description":"New description"}'
# Expected: 200 with updated task

# Update with empty title
curl -X PUT http://localhost:8000/api/user-123/tasks/{task_id} \
  -H "Content-Type: application/json" \
  -d '{"title":"   "}'
# Expected: 422
```

---

## Phase 6: User Story 5 - Delete Task (P2)

**Goal**: Enable permanent task deletion

**User Story**: As an API consumer, I want to delete a task so that I can remove completed or unwanted items from the list.

**Independent Test Criteria**:
- DELETE /api/{user_id}/tasks/{id} returns 204 and removes task
- DELETE with non-existent ID returns 404
- DELETE with task belonging to different user returns 404
- Subsequent GET for deleted task returns 404

- [ ] T018 [US5] Implement DELETE /api/{user_id}/tasks/{task_id} endpoint in backend/app/routes/tasks.py
- [ ] T019 [US5] Verify deleted task returns 404 on subsequent GET in backend/app/routes/tasks.py

**Verification**:
```bash
# Create task to delete
curl -X POST http://localhost:8000/api/user-123/tasks -H "Content-Type: application/json" -d '{"title":"To delete"}'
# Save the returned task_id

# Delete task
curl -X DELETE http://localhost:8000/api/user-123/tasks/{task_id}
# Expected: 204 No Content

# Verify deleted
curl http://localhost:8000/api/user-123/tasks/{task_id}
# Expected: 404
```

---

## Phase 7: User Story 6 - Mark Task Complete (P3)

**Goal**: Enable marking tasks as complete with timestamp

**User Story**: As an API consumer, I want to mark a task as complete so that I can track my progress.

**Independent Test Criteria**:
- PATCH /api/{user_id}/tasks/{id}/complete returns 200 with completed=true and completed_at timestamp
- PATCH on already-complete task returns 200 (idempotent)
- PATCH with non-existent ID returns 404
- PATCH with task belonging to different user returns 404

- [ ] T020 [US6] Implement PATCH /api/{user_id}/tasks/{task_id}/complete endpoint in backend/app/routes/tasks.py
- [ ] T021 [US6] Ensure idempotent behavior - re-completing returns 200 without changing completed_at in backend/app/routes/tasks.py

**Verification**:
```bash
# Create task
curl -X POST http://localhost:8000/api/user-123/tasks -H "Content-Type: application/json" -d '{"title":"Complete me"}'
# Save task_id

# Complete task
curl -X PATCH http://localhost:8000/api/user-123/tasks/{task_id}/complete
# Expected: 200 with completed=true and completed_at timestamp

# Re-complete (idempotent)
curl -X PATCH http://localhost:8000/api/user-123/tasks/{task_id}/complete
# Expected: 200 with same completed_at timestamp
```

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Error handling, edge cases, and production readiness

- [ ] T022 [P] Add database connection error handling returning 503 in backend/app/database.py
- [ ] T023 [P] Add health check endpoint GET / returning {"status":"healthy"} in backend/app/main.py
- [ ] T024 Create README.md with setup and usage instructions in backend/README.md

**Verification**:
```bash
# Health check
curl http://localhost:8000/
# Expected: {"status":"healthy"}

# All edge cases from spec pass (invalid JSON, exceeding field lengths, etc.)
```

---

## Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational: DB + Models)
    │
    ├──────────────────────────────────────┐
    ▼                                      ▼
Phase 3 (US1+US2: Create/List) ──────► Phase 4 (US3: Get Single)
                                           │
                                           ▼
                                       Phase 5 (US4: Update)
                                           │
                                           ▼
                                       Phase 6 (US5: Delete)
                                           │
                                           ▼
                                       Phase 7 (US6: Complete)
                                           │
    ◄──────────────────────────────────────┘
    │
    ▼
Phase 8 (Polish)
```

**Key Dependencies**:
- All phases depend on Phase 1 (Setup) and Phase 2 (Foundational)
- US3-US6 depend on US1+US2 (need tasks to exist for get/update/delete/complete)
- US4, US5, US6 can run after US3 in sequence or parallel (independent operations)
- Phase 8 runs last after all endpoints are implemented

---

## Parallel Execution Opportunities

### Within Phase 1
```
T001 (structure) ──► T002 (requirements)
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
    T003 (.env)     T004 (__init__)   T005 (config)
```

### Within Phase 2
```
T006 (database) ──────────────────────────┐
                                          │
    ┌─────────────────────────────────────┤
    ▼                                     ▼
T007 (Task model) ◄──────────────► T008 (models init)
                                          │
                                          ▼
                                     T009 (main.py)
```

### Phases 4-6 (after Phase 3)
US3, US4, US5 endpoints can be developed in parallel by different developers since they operate on independent code paths (different HTTP methods).

---

## Implementation Strategy

### MVP Scope (Phases 1-3)
Complete Phases 1-3 for a functional MVP:
- Server starts and connects to database
- Users can create tasks (POST)
- Users can list their tasks (GET)
- User isolation enforced

**MVP Delivers**: Core create/read loop enabling basic todo functionality

### Incremental Delivery
1. **After Phase 3**: Demo basic task creation and listing
2. **After Phase 5**: Demo full CRUD operations
3. **After Phase 7**: Demo complete feature set
4. **After Phase 8**: Production-ready with error handling

---

## Format Validation

✅ All 24 tasks follow checklist format:
- [x] Checkbox prefix `- [ ]`
- [x] Task ID (T001-T024)
- [x] [P] marker where parallelizable
- [x] [US#] labels for user story phases
- [x] File paths specified for all tasks
