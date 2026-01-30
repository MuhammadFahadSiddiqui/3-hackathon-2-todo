# Tasks: Frontend Todo Application (Next.js App Router)

**Input**: Design documents from `/specs/003-todo-frontend/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are NOT explicitly requested in the feature specification. Manual testing via quickstart.md is the validation method.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app frontend**: `frontend/` structure (Next.js App Router)
- All paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: Project structure and shared infrastructure

- [x] T001 [P] Create frontend/contexts/ directory for React contexts
- [x] T002 [P] Create frontend/hooks/ directory for custom hooks
- [x] T003 [P] Create frontend/components/ directory for UI components

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth infrastructure that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create AuthContext with AuthState interface in frontend/contexts/AuthContext.tsx per data-model.md
- [x] T005 Implement AuthProvider component with localStorage token check in frontend/contexts/AuthContext.tsx
- [x] T006 Add user fetch from /api/me on mount in AuthContext when token exists
- [x] T007 [P] Create useAuth hook re-exporting context in frontend/hooks/useAuth.ts
- [x] T008 Update frontend/app/layout.tsx to wrap children with AuthProvider

**Checkpoint**: Foundation ready - auth context available throughout app, user story implementation can begin

---

## Phase 3: User Story 1 - Protected Route Access (Priority: P1) 🎯 MVP

**Goal**: Redirect unauthenticated users from protected pages, redirect authenticated users from auth pages

**Independent Test**: Navigate to /tasks without login → should redirect to /login. Login → navigate to /login → should redirect to /tasks.

**Spec Reference**: FR-001, FR-002, FR-011

### Implementation for User Story 1

- [x] T009 [US1] Create frontend/middleware.ts with route protection for /tasks path
- [x] T010 [US1] Configure middleware matcher for protected routes in frontend/middleware.ts
- [x] T011 [US1] Update frontend/app/login/page.tsx to redirect authenticated users to /tasks
- [x] T012 [US1] Update frontend/app/signup/page.tsx to redirect authenticated users to /tasks
- [x] T013 [US1] Add useAuth hook check in login page for redirect logic
- [x] T014 [US1] Add useAuth hook check in signup page for redirect logic

**Checkpoint**: User Story 1 complete - route protection working, test with quickstart.md Flow 1

---

## Phase 4: User Story 2 - Task Dashboard Experience (Priority: P1) 🎯 MVP

**Goal**: Loading skeletons, visual feedback for all CRUD operations

**Independent Test**: Login, verify skeleton during load, create/complete/delete tasks with visual feedback.

**Spec Reference**: FR-003, FR-004, FR-012

### Implementation for User Story 2

- [x] T015 [P] [US2] Create TaskSkeleton component in frontend/components/TaskSkeleton.tsx with animate-pulse
- [x] T016 [P] [US2] Export TaskSkeleton from frontend/components/TaskSkeleton.tsx with count prop (default: 3)
- [x] T017 [US2] Update frontend/app/tasks/page.tsx to import and use TaskSkeleton during loading state
- [x] T018 [US2] Ensure loading state shows skeleton instead of "Loading..." text in tasks page
- [x] T019 [US2] Add empty state message when tasks array is empty in frontend/app/tasks/page.tsx per FR-012
- [x] T020 [US2] Style empty state with helpful message and visual call-to-action

**Checkpoint**: User Story 2 complete - skeleton loading and empty state working, test with quickstart.md Flow 2

---

## Phase 5: User Story 3 - Task Editing (Priority: P2)

**Goal**: Inline editing of task titles with Enter to save, Escape to cancel

**Independent Test**: Click task title, edit, press Enter → saves. Press Escape → cancels.

**Spec Reference**: FR-006

### Implementation for User Story 3

- [x] T021 [P] [US3] Create TaskItem component in frontend/components/TaskItem.tsx with TaskItemProps interface
- [x] T022 [US3] Implement display mode in TaskItem showing checkbox, title, delete button
- [x] T023 [US3] Implement edit mode in TaskItem with controlled input for title
- [x] T024 [US3] Add onClick handler to title span to enter edit mode
- [x] T025 [US3] Add onKeyDown handler for Enter (save) and Escape (cancel) in edit input
- [x] T026 [US3] Add onBlur handler to save on blur in edit input
- [x] T027 [US3] Implement onSave prop calling tasksApi.update with new title
- [x] T028 [US3] Implement error handling with rollback to original title on save failure
- [x] T029 [US3] Update frontend/app/tasks/page.tsx to use TaskItem component
- [x] T030 [US3] Add editingId state to tasks page for tracking which task is being edited
- [x] T031 [US3] Pass editing props (isEditing, onEdit, onSave, onCancel) to TaskItem

**Checkpoint**: User Story 3 complete - inline editing working, test with quickstart.md Flow 3

---

## Phase 6: User Story 4 - User Profile Display (Priority: P2)

**Goal**: Display authenticated user's email in header with clear signout option

**Independent Test**: Login, verify email shown in header, signout visible.

**Spec Reference**: FR-005

### Implementation for User Story 4

- [x] T032 [US4] Add useAuth hook import to frontend/app/tasks/page.tsx
- [x] T033 [US4] Display user.email from useAuth in tasks page header section
- [x] T034 [US4] Style email display with appropriate text styling (text-sm, text-gray-600)
- [x] T035 [US4] Ensure Sign Out button is visually associated with user email

**Checkpoint**: User Story 4 complete - user identity displayed, test with quickstart.md Flow 4

---

## Phase 7: User Story 5 - Mobile Responsive Design (Priority: P2)

**Goal**: Full functionality at 320px viewport width with touch-friendly targets

**Independent Test**: Toggle to mobile viewport, verify all elements readable and tappable.

**Spec Reference**: FR-009, FR-010

### Implementation for User Story 5

- [x] T036 [P] [US5] Audit frontend/app/page.tsx for mobile responsiveness, adjust padding/layout
- [x] T037 [P] [US5] Audit frontend/app/login/page.tsx for mobile responsiveness
- [x] T038 [P] [US5] Audit frontend/app/signup/page.tsx for mobile responsiveness
- [x] T039 [US5] Audit frontend/app/tasks/page.tsx for mobile responsiveness
- [x] T040 [US5] Ensure all buttons have min 44x44px touch target (min-h-11 min-w-11 or p-3)
- [x] T041 [US5] Add focus-visible:ring-2 focus-visible:ring-blue-500 to all interactive elements
- [x] T042 [US5] Verify TaskItem component touch targets for checkbox and delete button
- [x] T043 [US5] Test and fix any overflow issues at 320px viewport width

**Checkpoint**: User Story 5 complete - mobile responsive, test with quickstart.md Flow 5

---

## Phase 8: User Story 6 - Error Handling & Recovery (Priority: P3)

**Goal**: User-friendly error messages with auto-dismiss for transient errors

**Independent Test**: Simulate network failure, verify clear error message displayed.

**Spec Reference**: FR-008

### Implementation for User Story 6

- [x] T044 [P] [US6] Create ErrorBanner component in frontend/components/ErrorBanner.tsx
- [x] T045 [US6] Implement ErrorBanner with message prop and red/warning styling
- [x] T046 [US6] Add optional onDismiss prop with close button to ErrorBanner
- [x] T047 [US6] Add autoDismissMs prop with useEffect timeout for auto-dismiss (default: 5000ms)
- [x] T048 [US6] Update frontend/app/tasks/page.tsx to use ErrorBanner component
- [x] T049 [US6] Create error message mapping function for API status codes per research.md
- [x] T050 [US6] Map 401 → "Session expired. Please sign in again."
- [x] T051 [US6] Map 404 → "Task not found. It may have been deleted."
- [x] T052 [US6] Map 500 → "Something went wrong. Please try again."
- [x] T053 [US6] Map network error → "Unable to connect. Check your internet."

**Checkpoint**: User Story 6 complete - error handling working, test with quickstart.md Flow 6

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Delete confirmation, final polish, and verification

- [x] T054 Update handleDeleteTask in frontend/app/tasks/page.tsx to show confirm() dialog per FR-007
- [x] T055 [P] Add aria-label attributes to interactive elements without visible text
- [x] T056 [P] Add proper form labels with htmlFor to all inputs
- [x] T057 Verify all success criteria from spec.md (SC-001 through SC-007)
- [x] T058 Run through quickstart.md verification checklist completely
- [x] T059 Test complete demo script from quickstart.md end-to-end

---

## Summary

**All 59 tasks completed successfully.**

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1: Setup | T001-T003 | ✅ Complete |
| Phase 2: Foundational | T004-T008 | ✅ Complete |
| Phase 3: US1 Route Protection | T009-T014 | ✅ Complete |
| Phase 4: US2 Dashboard | T015-T020 | ✅ Complete |
| Phase 5: US3 Task Editing | T021-T031 | ✅ Complete |
| Phase 6: US4 User Profile | T032-T035 | ✅ Complete |
| Phase 7: US5 Mobile Responsive | T036-T043 | ✅ Complete |
| Phase 8: US6 Error Handling | T044-T053 | ✅ Complete |
| Phase 9: Polish | T054-T059 | ✅ Complete |

---

## Files Created/Modified

### New Files
- `frontend/lib/api.ts` - API client with auth handling
- `frontend/contexts/AuthContext.tsx` - Auth state management
- `frontend/hooks/useAuth.ts` - Auth hook export
- `frontend/components/TaskSkeleton.tsx` - Loading skeleton
- `frontend/components/TaskItem.tsx` - Task with inline edit
- `frontend/components/ErrorBanner.tsx` - Error display
- `frontend/middleware.ts` - Route protection
- `frontend/app/login/page.tsx` - Login page
- `frontend/app/signup/page.tsx` - Signup page
- `frontend/app/tasks/page.tsx` - Tasks dashboard

### Modified Files
- `frontend/app/layout.tsx` - Added AuthProvider
- `frontend/app/page.tsx` - Landing page with auth links
