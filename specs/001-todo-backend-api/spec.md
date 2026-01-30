# Feature Specification: Core Todo Backend API & Database Layer

**Feature Branch**: `001-todo-backend-api`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "Core Todo Backend API & Database Layer with FastAPI, SQLModel, and Neon PostgreSQL"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Task (Priority: P1)

As an API consumer, I want to create a new task for a specific user so that the task is stored persistently and can be retrieved later.

**Why this priority**: Task creation is the foundational operation. Without it, no other operations (read, update, delete, complete) are meaningful. This enables the core value proposition of the todo system.

**Independent Test**: Can be fully tested by sending a POST request with task data and verifying the response contains the created task with a generated ID. Delivers immediate value as tasks are persisted.

**Acceptance Scenarios**:

1. **Given** a valid user_id and task data (title required), **When** POST /api/{user_id}/tasks is called, **Then** a new task is created with status 201, returning the task with generated id, created_at timestamp, and is_completed defaulting to false.

2. **Given** a valid user_id and task data with optional description, **When** POST /api/{user_id}/tasks is called, **Then** the task is created with the provided description stored.

3. **Given** a request with missing required title field, **When** POST /api/{user_id}/tasks is called, **Then** status 422 is returned with validation error details.

4. **Given** a request with empty title (whitespace only), **When** POST /api/{user_id}/tasks is called, **Then** status 422 is returned indicating title cannot be empty.

---

### User Story 2 - List All Tasks for a User (Priority: P1)

As an API consumer, I want to retrieve all tasks belonging to a specific user so that I can display them in a task list.

**Why this priority**: Listing tasks is equally critical as creation - users need to see their tasks immediately after creating them. This is the primary read operation.

**Independent Test**: Can be tested by first creating tasks for a user, then calling GET to retrieve the list and verifying all created tasks are returned.

**Acceptance Scenarios**:

1. **Given** a user_id with existing tasks, **When** GET /api/{user_id}/tasks is called, **Then** status 200 is returned with an array of all tasks belonging to that user.

2. **Given** a user_id with no tasks, **When** GET /api/{user_id}/tasks is called, **Then** status 200 is returned with an empty array.

3. **Given** tasks exist for multiple users, **When** GET /api/{user_id}/tasks is called for user A, **Then** only user A's tasks are returned (never user B's tasks).

---

### User Story 3 - Retrieve a Single Task (Priority: P2)

As an API consumer, I want to retrieve a specific task by ID so that I can view its details.

**Why this priority**: Single task retrieval supports viewing task details and is required before update/delete operations to confirm the task exists.

**Independent Test**: Can be tested by creating a task, then retrieving it by ID and verifying all fields match.

**Acceptance Scenarios**:

1. **Given** a valid user_id and existing task_id, **When** GET /api/{user_id}/tasks/{id} is called, **Then** status 200 is returned with the complete task object.

2. **Given** a valid user_id and non-existent task_id, **When** GET /api/{user_id}/tasks/{id} is called, **Then** status 404 is returned with error message.

3. **Given** a task belonging to user A, **When** GET /api/{user_B}/tasks/{task_id} is called (different user), **Then** status 404 is returned (task not visible to other users).

---

### User Story 4 - Update a Task (Priority: P2)

As an API consumer, I want to update an existing task's title or description so that I can correct or modify task details.

**Why this priority**: Update capability allows users to refine their tasks, essential for practical task management but secondary to create/read operations.

**Independent Test**: Can be tested by creating a task, updating its title, then retrieving it to verify the change persisted.

**Acceptance Scenarios**:

1. **Given** a valid user_id and existing task_id with new title/description, **When** PUT /api/{user_id}/tasks/{id} is called, **Then** status 200 is returned with the updated task.

2. **Given** a valid user_id and non-existent task_id, **When** PUT /api/{user_id}/tasks/{id} is called, **Then** status 404 is returned.

3. **Given** a task belonging to user A, **When** PUT /api/{user_B}/tasks/{task_id} is called (different user), **Then** status 404 is returned (cannot update other users' tasks).

4. **Given** an update request with empty title, **When** PUT /api/{user_id}/tasks/{id} is called, **Then** status 422 is returned with validation error.

---

### User Story 5 - Delete a Task (Priority: P2)

As an API consumer, I want to delete a task so that I can remove tasks I no longer need.

**Why this priority**: Deletion is important for task hygiene but is a destructive operation that is less frequently used than create/read.

**Independent Test**: Can be tested by creating a task, deleting it, then attempting to retrieve it and confirming 404.

**Acceptance Scenarios**:

1. **Given** a valid user_id and existing task_id, **When** DELETE /api/{user_id}/tasks/{id} is called, **Then** status 204 is returned with no content.

2. **Given** a valid user_id and non-existent task_id, **When** DELETE /api/{user_id}/tasks/{id} is called, **Then** status 404 is returned.

3. **Given** a task belonging to user A, **When** DELETE /api/{user_B}/tasks/{task_id} is called (different user), **Then** status 404 is returned (cannot delete other users' tasks).

4. **Given** a deleted task_id, **When** GET /api/{user_id}/tasks/{id} is called, **Then** status 404 is returned (task no longer exists).

---

### User Story 6 - Mark a Task as Complete (Priority: P3)

As an API consumer, I want to mark a task as completed so that I can track my progress.

**Why this priority**: Completion tracking is the final piece of basic todo functionality, valuable but not blocking for initial usability.

**Independent Test**: Can be tested by creating a task (is_completed=false), calling PATCH complete, then retrieving to verify is_completed=true.

**Acceptance Scenarios**:

1. **Given** a valid user_id and existing incomplete task_id, **When** PATCH /api/{user_id}/tasks/{id}/complete is called, **Then** status 200 is returned with the task showing is_completed=true.

2. **Given** a valid user_id and already completed task_id, **When** PATCH /api/{user_id}/tasks/{id}/complete is called, **Then** status 200 is returned (idempotent operation, task remains completed).

3. **Given** a valid user_id and non-existent task_id, **When** PATCH /api/{user_id}/tasks/{id}/complete is called, **Then** status 404 is returned.

4. **Given** a task belonging to user A, **When** PATCH /api/{user_B}/tasks/{task_id}/complete is called, **Then** status 404 is returned (cannot complete other users' tasks).

---

### Edge Cases

- **Empty user_id**: Requests with empty or malformed user_id return 422 validation error
- **Invalid task ID format**: Non-integer task IDs return 422 validation error
- **Maximum title length**: Titles exceeding 500 characters are rejected with 422
- **Concurrent updates**: Last write wins (no optimistic locking in this version)
- **Database connection failure**: Returns 503 Service Unavailable with error message
- **Large task lists**: System handles users with up to 10,000 tasks without timeout

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose REST API endpoints for task CRUD operations at paths /api/{user_id}/tasks and /api/{user_id}/tasks/{id}
- **FR-002**: System MUST expose a PATCH endpoint at /api/{user_id}/tasks/{id}/complete for marking tasks complete
- **FR-003**: System MUST persist all task data to a PostgreSQL database
- **FR-004**: System MUST scope all database queries by user_id to enforce data isolation
- **FR-005**: System MUST return JSON responses with consistent structure for all endpoints
- **FR-006**: System MUST validate that title is non-empty for task creation and updates
- **FR-007**: System MUST auto-generate unique integer IDs for new tasks
- **FR-008**: System MUST auto-generate created_at timestamp on task creation
- **FR-009**: System MUST set is_completed to false by default for new tasks
- **FR-010**: System MUST read database connection configuration from environment variables
- **FR-011**: System MUST return appropriate HTTP status codes (200, 201, 204, 404, 422, 503)
- **FR-012**: System MUST return 404 when accessing tasks that don't exist OR belong to a different user
- **FR-013**: System MUST support task description as an optional field (nullable)

### Key Entities

- **Task**: Represents a todo item. Attributes: id (unique identifier), user_id (owner identifier), title (required, non-empty string, max 500 chars), description (optional string), is_completed (boolean, defaults to false), created_at (timestamp, auto-generated)

### Assumptions

- user_id is provided by the API consumer (will be replaced by JWT-extracted user ID in future auth layer)
- user_id is a string identifier (UUID format expected but not strictly validated in this phase)
- Task IDs are sequential integers within the database
- No pagination required (future enhancement)
- No sorting/filtering required (future enhancement)
- Database schema migrations will be handled manually or via SQLModel create_all

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 API endpoints respond correctly to valid requests within 500ms under normal load
- **SC-002**: Task data persists across server restarts (verified by creating task, restarting server, retrieving task)
- **SC-003**: User A cannot access, modify, or delete User B's tasks (100% isolation verified by cross-user test cases)
- **SC-004**: API returns consistent JSON response structure for all success and error cases
- **SC-005**: Server starts successfully with only DATABASE_URL environment variable configured
- **SC-006**: All acceptance scenarios pass when tested via HTTP client (curl, Postman, or automated tests)
- **SC-007**: System handles 100 concurrent requests without errors or data corruption

## Out of Scope

The following are explicitly NOT included in this specification:

- Authentication/authorization (JWT validation, middleware)
- Frontend UI or API client implementation
- Rate limiting or request throttling
- Caching layers
- Advanced filtering, pagination, or search
- Soft delete functionality
- Task due dates or priority fields
- Task categories or tags
- Audit logging
- API versioning
