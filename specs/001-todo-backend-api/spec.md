# Feature Specification: Core Todo Backend API & Database Layer

**Feature Branch**: `001-todo-backend-api`
**Created**: 2026-01-09
**Status**: Draft
**Input**: User description: "Core Todo Backend API & Database Layer with FastAPI, SQLModel, and Neon PostgreSQL"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Task (Priority: P1)

As an API consumer, I want to create a new task for a specific user so that the task is persisted and can be retrieved later.

**Why this priority**: Task creation is the foundational operation. Without it, no other CRUD operations are meaningful. This enables the core value proposition of the todo application.

**Independent Test**: Can be fully tested by sending a POST request with task data and verifying the response contains the created task with a generated ID. Delivers immediate value by enabling task persistence.

**Acceptance Scenarios**:

1. **Given** a valid user_id and task data (title required), **When** POST /api/{user_id}/tasks is called, **Then** the system returns 201 Created with the complete task object including generated id, created_at timestamp, and completed=false default.

2. **Given** a valid user_id and task data with optional description, **When** POST /api/{user_id}/tasks is called, **Then** the system persists both title and description, returning the complete task.

3. **Given** a request with missing title, **When** POST /api/{user_id}/tasks is called, **Then** the system returns 422 Unprocessable Entity with a clear validation error message.

4. **Given** a request with empty title (whitespace only), **When** POST /api/{user_id}/tasks is called, **Then** the system returns 422 Unprocessable Entity with validation error.

---

### User Story 2 - List All Tasks for a User (Priority: P1)

As an API consumer, I want to retrieve all tasks for a specific user so that I can display the user's complete task list.

**Why this priority**: Listing tasks is essential for any todo interface. Users need to see their tasks immediately after login. Co-equal priority with creation as both are needed for MVP.

**Independent Test**: Can be fully tested by creating tasks via POST, then calling GET to retrieve them. Verifies data round-trip and user isolation.

**Acceptance Scenarios**:

1. **Given** a user with existing tasks, **When** GET /api/{user_id}/tasks is called, **Then** the system returns 200 OK with an array of all tasks belonging to that user.

2. **Given** a user with no tasks, **When** GET /api/{user_id}/tasks is called, **Then** the system returns 200 OK with an empty array.

3. **Given** multiple users with tasks, **When** GET /api/{user_id}/tasks is called for user A, **Then** only user A's tasks are returned (never user B's tasks).

---

### User Story 3 - Get a Single Task (Priority: P2)

As an API consumer, I want to retrieve a specific task by its ID so that I can view task details or check its current state.

**Why this priority**: Single task retrieval supports detail views and state checks. Important but list view provides most value initially.

**Independent Test**: Can be tested by creating a task, then retrieving it by ID. Verifies individual resource access.

**Acceptance Scenarios**:

1. **Given** a task exists for a user, **When** GET /api/{user_id}/tasks/{id} is called, **Then** the system returns 200 OK with the complete task object.

2. **Given** a task does not exist, **When** GET /api/{user_id}/tasks/{id} is called, **Then** the system returns 404 Not Found with an error message.

3. **Given** a task exists but belongs to a different user, **When** GET /api/{user_id}/tasks/{id} is called, **Then** the system returns 404 Not Found (task not visible across users).

---

### User Story 4 - Update a Task (Priority: P2)

As an API consumer, I want to update an existing task's title or description so that I can correct mistakes or add details.

**Why this priority**: Updates are important for usability but not critical for MVP. Users can delete and recreate as workaround.

**Independent Test**: Can be tested by creating a task, updating it, then retrieving to verify changes persisted.

**Acceptance Scenarios**:

1. **Given** an existing task, **When** PUT /api/{user_id}/tasks/{id} is called with new title/description, **Then** the system returns 200 OK with the updated task object.

2. **Given** a task that doesn't exist, **When** PUT /api/{user_id}/tasks/{id} is called, **Then** the system returns 404 Not Found.

3. **Given** a task belonging to another user, **When** PUT /api/{user_id}/tasks/{id} is called, **Then** the system returns 404 Not Found (cross-user updates prevented).

4. **Given** an update request with invalid data (empty title), **When** PUT /api/{user_id}/tasks/{id} is called, **Then** the system returns 422 Unprocessable Entity.

---

### User Story 5 - Delete a Task (Priority: P2)

As an API consumer, I want to delete a task so that I can remove completed or unwanted items from the list.

**Why this priority**: Deletion is important for list hygiene but not critical for initial value delivery.

**Independent Test**: Can be tested by creating a task, deleting it, then verifying GET returns 404.

**Acceptance Scenarios**:

1. **Given** an existing task, **When** DELETE /api/{user_id}/tasks/{id} is called, **Then** the system returns 204 No Content and the task is permanently removed.

2. **Given** a task that doesn't exist, **When** DELETE /api/{user_id}/tasks/{id} is called, **Then** the system returns 404 Not Found.

3. **Given** a task belonging to another user, **When** DELETE /api/{user_id}/tasks/{id} is called, **Then** the system returns 404 Not Found (cross-user deletion prevented).

---

### User Story 6 - Mark Task as Complete (Priority: P3)

As an API consumer, I want to mark a task as complete so that I can track my progress.

**Why this priority**: Completion tracking is a core todo feature but can be simulated via PUT initially. Dedicated endpoint provides cleaner semantics.

**Independent Test**: Can be tested by creating a task, completing it, then verifying the completed flag is true.

**Acceptance Scenarios**:

1. **Given** an incomplete task, **When** PATCH /api/{user_id}/tasks/{id}/complete is called, **Then** the system returns 200 OK with the task showing completed=true and completed_at timestamp.

2. **Given** an already complete task, **When** PATCH /api/{user_id}/tasks/{id}/complete is called, **Then** the system returns 200 OK (idempotent operation) with existing completed state.

3. **Given** a task that doesn't exist, **When** PATCH /api/{user_id}/tasks/{id}/complete is called, **Then** the system returns 404 Not Found.

4. **Given** a task belonging to another user, **When** PATCH /api/{user_id}/tasks/{id}/complete is called, **Then** the system returns 404 Not Found.

---

### Edge Cases

- What happens when user_id in URL is not a valid format? System returns 422 Unprocessable Entity with validation error.
- What happens when task_id in URL is not a valid format? System returns 422 Unprocessable Entity with validation error.
- What happens when request body is malformed JSON? System returns 422 Unprocessable Entity with parse error.
- What happens when title exceeds maximum length (255 characters)? System returns 422 with validation error.
- What happens when description exceeds maximum length (2000 characters)? System returns 422 with validation error.
- What happens when database connection fails? System returns 503 Service Unavailable.
- What happens on concurrent updates to the same task? Last write wins (no optimistic locking in this version).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a POST endpoint to create tasks scoped to a user_id
- **FR-002**: System MUST provide a GET endpoint to list all tasks for a specific user_id
- **FR-003**: System MUST provide a GET endpoint to retrieve a single task by user_id and task_id
- **FR-004**: System MUST provide a PUT endpoint to update an existing task by user_id and task_id
- **FR-005**: System MUST provide a DELETE endpoint to remove a task by user_id and task_id
- **FR-006**: System MUST provide a PATCH endpoint to mark a task as complete by user_id and task_id
- **FR-007**: System MUST persist all task data to the database (data survives server restart)
- **FR-008**: System MUST scope all database queries by user_id (tasks never leak across users)
- **FR-009**: System MUST validate required fields (title) and return 422 for invalid input
- **FR-010**: System MUST return appropriate HTTP status codes (200, 201, 204, 404, 422, 503)
- **FR-011**: System MUST accept and return JSON for all request/response bodies
- **FR-012**: System MUST generate unique task IDs automatically on creation
- **FR-013**: System MUST set created_at timestamp automatically on task creation
- **FR-014**: System MUST set completed_at timestamp when a task is marked complete
- **FR-015**: System MUST default completed field to false on task creation
- **FR-016**: System MUST load database connection string from environment variables

### Key Entities

- **Task**: Represents a todo item belonging to a user
  - id: Unique identifier (UUID format)
  - user_id: Owner identifier (string, provided in URL path)
  - title: Task title (required, 1-255 characters)
  - description: Optional task details (0-2000 characters)
  - completed: Boolean completion status (default: false)
  - created_at: Timestamp of task creation (auto-generated)
  - completed_at: Timestamp of completion (null until completed)

### Assumptions

- user_id is provided as a path parameter and treated as a string identifier
- No authentication/authorization is implemented in this spec (prepared for future JWT integration)
- Task IDs are UUIDs generated server-side
- All timestamps are stored and returned in ISO 8601 format (UTC)
- Maximum title length: 255 characters
- Maximum description length: 2000 characters
- Empty string titles are invalid (whitespace-only also invalid)
- The complete endpoint is idempotent (calling twice has same effect as once)
- No pagination, filtering, or sorting in list endpoint (full list returned)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All six API endpoints respond correctly to valid requests (100% of acceptance scenarios pass)
- **SC-002**: Task data persists across server restarts (verified by create, restart, retrieve cycle)
- **SC-003**: User A cannot access, modify, or delete User B's tasks under any circumstance (0% cross-user data leakage)
- **SC-004**: Invalid requests receive appropriate error responses with clear messages (100% of edge cases handled)
- **SC-005**: API responses return within 500ms for individual operations under normal load
- **SC-006**: Backend runs independently without requiring frontend components
- **SC-007**: All API responses follow consistent JSON structure with appropriate HTTP status codes

## Scope Boundaries

### In Scope

- Six REST API endpoints for task CRUD and completion
- Task data model with all specified fields
- Database persistence to Neon PostgreSQL via SQLModel
- User-scoped data isolation at query level
- Input validation with meaningful error messages
- Environment-based configuration

### Out of Scope (Explicitly Excluded)

- Authentication or authorization logic
- JWT validation or middleware
- Frontend UI or API client
- Rate limiting or caching
- Advanced filtering, pagination, or search
- Task due dates, priorities, or categories
- Soft delete (tasks are hard deleted)
- Audit logging
- Batch operations (bulk create/update/delete)
