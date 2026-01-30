# Tasks: Authentication & JWT-Based API Security

**Input**: Design documents from `/specs/002-jwt-auth/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/auth-openapi.yaml

**Tests**: Tests are NOT explicitly requested in the feature specification. Manual API testing via curl is the validation method per spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app backend**: `backend/app/` structure per plan.md
- **Web app frontend**: `frontend/src/` structure per plan.md

---

## Phase 1: Setup

**Purpose**: Project initialization and dependency setup

- [x] T001 Update backend/requirements.txt to add pyjwt[crypto]>=2.8.0 and httpx>=0.27.0
- [x] T002 [P] Create backend/app/auth/ directory structure with __init__.py
- [x] T003 [P] Update backend/.env.example with BETTER_AUTH_JWKS_URL, BETTER_AUTH_ISSUER, FRONTEND_URL variables
- [x] T004 [P] Initialize Next.js project in frontend/ with TypeScript, Tailwind, App Router, src directory

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Update backend/app/config.py to add better_auth_jwks_url, better_auth_issuer, frontend_url settings
- [x] T006 [P] Create TokenPayload schema in backend/app/auth/schemas.py with sub, iat, exp, iss, aud, email fields per data-model.md
- [x] T007 [P] Create UserContext schema in backend/app/auth/schemas.py with id and email fields
- [x] T008 Create JWKSCache class in backend/app/auth/jwt_verifier.py with async get_public_key method and 1-hour TTL caching
- [x] T009 Implement verify_token dependency in backend/app/auth/dependencies.py using HTTPBearer and JWKSCache
- [x] T010 Create User SQLModel in backend/app/models/user.py with id (PK, str), email (unique, indexed), created_at fields per data-model.md
- [x] T011 [P] Export User model in backend/app/models/__init__.py
- [x] T012 Update backend/app/database.py to include User table in create_all
- [x] T013 Implement get_current_user dependency in backend/app/auth/dependencies.py with user sync logic from data-model.md
- [x] T014 [P] Export auth dependencies in backend/app/auth/__init__.py
- [x] T015 Add CORS middleware to backend/app/main.py allowing FRONTEND_URL origin with credentials

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Sign Up (Priority: P1) 🎯 MVP

**Goal**: Allow new users to create accounts with email and password

**Independent Test**: POST to /api/auth/signup with valid email/password returns 201 with user record and token

**Spec Reference**: FR-001, FR-002, FR-003, FR-014

### Implementation for User Story 1

- [x] T016 [US1] Install better-auth package in frontend/ with npm install better-auth
- [x] T017 [US1] Create Better Auth configuration in frontend/src/lib/auth.ts with database adapter and JWT plugin
- [x] T018 [US1] Create auth API route handler at frontend/src/app/api/auth/[...all]/route.ts exporting GET and POST
- [x] T019 [US1] Create signup page at frontend/src/app/signup/page.tsx with email/password form
- [x] T020 [US1] Implement signup form validation: email format, password min 8 chars per FR-002
- [x] T021 [US1] Add error handling for duplicate email with user-friendly message per FR-003, FR-014

**Checkpoint**: User Story 1 complete - users can sign up, verify with curl to /api/auth/signup

---

## Phase 4: User Story 2 - User Sign In (Priority: P1) 🎯 MVP

**Goal**: Allow registered users to authenticate and receive JWT token

**Independent Test**: POST to /api/auth/signin with valid credentials returns token usable for API requests

**Spec Reference**: FR-004, FR-005, FR-006, FR-014

### Implementation for User Story 2

- [x] T022 [US2] Create login page at frontend/src/app/login/page.tsx with email/password form
- [x] T023 [US2] Implement signin action calling Better Auth signin endpoint
- [x] T024 [US2] Configure JWT token expiration to 7 days per FR-006 in frontend/src/lib/auth.ts
- [x] T025 [US2] Add error handling for invalid credentials without revealing which field is wrong per FR-014

**Checkpoint**: User Story 2 complete - users can sign in and receive JWT, verify with curl

---

## Phase 5: User Story 3 - Authenticated API Access (Priority: P1) 🎯 MVP

**Goal**: Frontend attaches JWT to all API requests; backend identifies user from token

**Independent Test**: GET /api/tasks with valid Bearer token returns only authenticated user's tasks

**Spec Reference**: FR-007, FR-008, FR-009, FR-010

### Implementation for User Story 3

- [x] T026 [US3] Create API client helper in frontend/src/lib/api.ts that attaches Authorization: Bearer header
- [x] T027 [US3] Implement session token access from Better Auth client in frontend/src/lib/api.ts
- [x] T028 [US3] Update backend/app/routes/tasks.py router prefix from /api/{user_id}/tasks to /api/tasks
- [x] T029 [US3] Add get_current_user dependency to create_task endpoint in backend/app/routes/tasks.py
- [x] T030 [US3] Add get_current_user dependency to list_tasks endpoint in backend/app/routes/tasks.py
- [x] T031 [US3] Add get_current_user dependency to get_task endpoint in backend/app/routes/tasks.py
- [x] T032 [US3] Add get_current_user dependency to update_task endpoint in backend/app/routes/tasks.py
- [x] T033 [US3] Add get_current_user dependency to delete_task endpoint in backend/app/routes/tasks.py
- [x] T034 [US3] Add get_current_user dependency to complete_task endpoint in backend/app/routes/tasks.py
- [x] T035 [US3] Update all task queries to use current_user.id instead of path user_id parameter

**Checkpoint**: User Story 3 complete - API requests require valid JWT, user identified from token

---

## Phase 6: User Story 4 - Backend JWT Verification (Priority: P2)

**Goal**: Backend verifies JWT signature, expiration, and extracts user identity

**Independent Test**: Send requests with valid, invalid, expired tokens; verify correct acceptance/rejection

**Spec Reference**: FR-008, FR-009, FR-010, FR-012

### Implementation for User Story 4

- [x] T036 [US4] Add algorithm validation in backend/app/auth/jwt_verifier.py to only accept EdDSA
- [x] T037 [US4] Add expiration validation in verify_token with clear "Token expired" message
- [x] T038 [US4] Add signature validation error handling with "Invalid token" message
- [x] T039 [US4] Add missing Authorization header handling with "Not authenticated" message
- [x] T040 [US4] Add Bearer prefix validation with "Invalid authentication credentials" message
- [x] T041 [US4] Add JWKS refresh retry logic for unknown key IDs in backend/app/auth/jwt_verifier.py

**Checkpoint**: User Story 4 complete - backend properly validates all token aspects

---

## Phase 7: User Story 5 - User Ownership Enforcement (Priority: P2)

**Goal**: Users can only access and modify their own resources

**Independent Test**: Attempt to access another user's task returns 404 Not Found

**Spec Reference**: FR-011

### Implementation for User Story 5

- [x] T042 [US5] Verify create_task uses current_user.id for task.user_id assignment in backend/app/routes/tasks.py
- [x] T043 [US5] Verify list_tasks filters by current_user.id in WHERE clause in backend/app/routes/tasks.py
- [x] T044 [US5] Verify get_task filters by task_id AND current_user.id in backend/app/routes/tasks.py
- [x] T045 [US5] Verify update_task filters by task_id AND current_user.id in backend/app/routes/tasks.py
- [x] T046 [US5] Verify delete_task filters by task_id AND current_user.id in backend/app/routes/tasks.py
- [x] T047 [US5] Verify complete_task filters by task_id AND current_user.id in backend/app/routes/tasks.py

**Checkpoint**: User Story 5 complete - cross-user access returns 404, data isolation enforced

---

## Phase 8: User Story 6 - User Sign Out (Priority: P3)

**Goal**: Users can sign out, removing client-side token

**Independent Test**: After sign out, subsequent API requests without re-login fail with 401

**Spec Reference**: FR-013

### Implementation for User Story 6

- [x] T048 [US6] Create signout action in frontend that calls Better Auth signout endpoint
- [x] T049 [US6] Clear stored token from client state/storage after signout
- [x] T050 [US6] Redirect to login page after successful signout
- [x] T051 [US6] Add signout button/link to authenticated layout or navigation

**Checkpoint**: User Story 6 complete - users can sign out and must re-authenticate

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Validation, documentation, and final verification

- [x] T052 [P] Create /api/me endpoint in backend/app/routes/auth.py returning current user info per auth-openapi.yaml
- [x] T053 [P] Register auth router in backend/app/main.py
- [x] T054 [P] Verify all endpoints match OpenAPI contract in specs/002-jwt-auth/contracts/auth-openapi.yaml
- [x] T055 Run quickstart.md validation: start servers, execute all curl commands, verify responses match expected
- [x] T056 Test user isolation: create task as user-a, attempt access from user-b token, verify 404 returned
- [x] T057 Test token expiration: use expired token, verify 401 "Token expired" returned
- [x] T058 Test invalid signature: tamper with token, verify 401 "Invalid token" returned

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - P1 stories (US1, US2, US3) should complete first for MVP
  - P2 stories (US4, US5) can run after P1 stories
  - P3 story (US6) runs last
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Creates signup capability
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Creates signin capability
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Requires US1 or US2 token for testing
- **User Story 4 (P2)**: Depends on Phase 2 jwt_verifier - Enhances verification logic
- **User Story 5 (P2)**: Depends on US3 route changes - Validates ownership filtering
- **User Story 6 (P3)**: Depends on US1/US2 - Requires auth to exist before signout

### Within Each User Story

- Frontend tasks can run parallel to backend tasks (different projects)
- Core implementation before error handling
- All tasks within a story should be completed sequentially
- Mark story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004 can run in parallel (Setup phase, different projects/files)
- T006, T007, T011, T014 can run in parallel (schema/export files)
- T052, T053, T054 can run in parallel (Polish phase, different files)
- Frontend tasks (US1, US2) and backend tasks (US4, US5) can run in parallel if team capacity allows

---

## Parallel Example: Setup Phase

```bash
# Launch all parallelizable setup tasks together:
Task: "Create backend/app/auth/ directory structure"
Task: "Update backend/.env.example with auth variables"
Task: "Initialize Next.js project in frontend/"
```

## Parallel Example: Foundational Phase

```bash
# Launch all schema files together:
Task: "Create TokenPayload schema in backend/app/auth/schemas.py"
Task: "Create UserContext schema in backend/app/auth/schemas.py"
Task: "Export User model in backend/app/models/__init__.py"
Task: "Export auth dependencies in backend/app/auth/__init__.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 + 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Sign Up)
4. Complete Phase 4: User Story 2 (Sign In)
5. Complete Phase 5: User Story 3 (Authenticated API Access)
6. **STOP and VALIDATE**: Test signup → signin → API access flow
7. Deploy/demo if ready - this is a functional MVP with auth!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 + 2 → Test independently → Users can sign up/in
3. Add User Story 3 → Test independently → API protected with JWT
4. Add User Story 4 + 5 → Test independently → Robust verification + ownership
5. Add User Story 6 → Test independently → Complete auth lifecycle
6. Each story adds security without breaking previous stories

### Sequential Solo Strategy

For single developer working sequentially:

1. Phase 1: Setup (T001-T004) ~15 min
2. Phase 2: Foundational (T005-T015) ~60 min
3. Phase 3: User Story 1 (T016-T021) ~45 min
4. Phase 4: User Story 2 (T022-T025) ~30 min
5. Phase 5: User Story 3 (T026-T035) ~60 min
6. **MVP CHECKPOINT** - validate basic auth flow
7. Phase 6: User Story 4 (T036-T041) ~30 min
8. Phase 7: User Story 5 (T042-T047) ~20 min
9. Phase 8: User Story 6 (T048-T051) ~20 min
10. Phase 9: Polish (T052-T058) ~30 min

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All task route queries MUST include user_id filter per Constitution III (Security-First Design)
- Breaking change: Routes change from /api/{user_id}/tasks to /api/tasks
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
