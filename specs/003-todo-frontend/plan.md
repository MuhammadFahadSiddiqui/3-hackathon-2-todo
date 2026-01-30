# Implementation Plan: Frontend Todo Application (Next.js App Router)

**Branch**: `003-todo-frontend` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-todo-frontend/spec.md`

## Summary

Polish and enhance the existing Next.js frontend from Feature 002 with route protection, loading states, inline editing, responsive design, and improved error handling. This is a refinement feature building on the auth and task management foundation already in place.

## Technical Context

**Language/Version**: TypeScript/Next.js 16+ (App Router)
**Primary Dependencies**: React 18+, Better Auth (existing), Tailwind CSS
**Storage**: localStorage (token), React state (UI)
**Testing**: Manual testing per quickstart.md
**Target Platform**: Browser (Desktop + Mobile, 320px+)
**Project Type**: Web application (frontend enhancement)
**Performance Goals**: LCP < 2s on 3G (SC-001)
**Constraints**: Mobile-first, keyboard accessible
**Scale/Scope**: Single user session, ~100 tasks max display

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Requirement | Status | Implementation |
|-----------|-------------|--------|----------------|
| I. Spec-Driven Development | All work derived from spec | ✅ PASS | Spec at `specs/003-todo-frontend/spec.md` with 12 FRs |
| II. Correctness Over Speed | Proper implementation | ✅ PASS | Standard React patterns, no shortcuts |
| III. Security-First Design | Auth enforcement | ✅ PASS | Route protection, token validation |
| IV. Reproducibility | Steps from specs/plans | ✅ PASS | All changes documented in plan |
| V. Maintainability | Separation of concerns | ✅ PASS | Components, hooks, API client separated |
| VI. Traceability | Features link to specs | ✅ PASS | FR-001 to FR-012 traceable to implementation |

**Gate Result**: ✅ ALL PASS - Proceed to implementation

## Project Structure

### Documentation (this feature)

```text
specs/003-todo-frontend/
├── plan.md              # This file
├── research.md          # Phase 0 output - Frontend patterns research
├── data-model.md        # Phase 1 output - Client-side state models
├── quickstart.md        # Phase 1 output - Testing and demo guide
├── checklists/
│   └── requirements.md  # Quality validation checklist
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # MODIFY: Add AuthProvider wrapper
│   │   ├── page.tsx             # EXISTS: Landing page
│   │   ├── login/page.tsx       # MODIFY: Add auth redirect logic
│   │   ├── signup/page.tsx      # MODIFY: Add auth redirect logic
│   │   └── tasks/page.tsx       # MODIFY: Add loading, editing, error states
│   ├── components/              # NEW: Reusable UI components
│   │   ├── TaskItem.tsx         # NEW: Single task with edit capability
│   │   ├── TaskSkeleton.tsx     # NEW: Loading skeleton
│   │   └── ErrorBanner.tsx      # NEW: Error display component
│   ├── contexts/                # NEW: React contexts
│   │   └── AuthContext.tsx      # NEW: Auth state management
│   ├── hooks/                   # NEW: Custom hooks
│   │   └── useAuth.ts           # NEW: Auth hook (re-exports from context)
│   └── lib/
│       ├── auth.ts              # EXISTS: Better Auth config
│       └── api.ts               # EXISTS: API client with types
├── middleware.ts                # NEW: Route protection middleware
└── package.json                 # EXISTS: Dependencies
```

**Structure Decision**: Enhance existing `frontend/` structure with new components, contexts, and hooks directories. No structural changes to app router pages.

## Implementation Phases

### Phase 1: Auth Context & Route Protection (US1, US4)

**Goal**: Centralized auth state and protected routes

**Tasks**:
1. Create `frontend/src/contexts/AuthContext.tsx` with auth state management
2. Create `frontend/src/hooks/useAuth.ts` as re-export hook
3. Update `frontend/src/app/layout.tsx` to wrap with AuthProvider
4. Create `frontend/middleware.ts` for server-side route protection
5. Update `frontend/src/app/login/page.tsx` with authenticated redirect
6. Update `frontend/src/app/signup/page.tsx` with authenticated redirect
7. Add user email display to tasks page header

**Dependencies**: Builds on existing localStorage token from Feature 002

### Phase 2: Loading & Skeleton States (US2)

**Goal**: Visual feedback during data fetching

**Tasks**:
1. Create `frontend/src/components/TaskSkeleton.tsx`
2. Update `frontend/src/app/tasks/page.tsx` to show skeleton while loading
3. Add skeleton count based on expected content

**Dependencies**: None (uses Tailwind animate-pulse)

### Phase 3: Task Editing (US3)

**Goal**: Inline edit capability for task titles

**Tasks**:
1. Create `frontend/src/components/TaskItem.tsx` with edit mode
2. Implement edit state management (local to component)
3. Add Enter to save, Escape to cancel handlers
4. Connect to API update endpoint
5. Handle edit failures with rollback

**Dependencies**: Existing tasksApi.update in api.ts

### Phase 4: Error Handling (US6)

**Goal**: User-friendly error messages

**Tasks**:
1. Create `frontend/src/components/ErrorBanner.tsx`
2. Add error state management to tasks page
3. Map API errors to user-friendly messages
4. Implement auto-dismiss for transient errors

**Dependencies**: None

### Phase 5: Delete Confirmation (FR-007)

**Goal**: Prevent accidental deletions

**Tasks**:
1. Add confirm() dialog to delete handler
2. Update UI flow for confirmation

**Dependencies**: Existing delete functionality

### Phase 6: Polish & Responsive (US5)

**Goal**: Mobile-friendly and visually polished

**Tasks**:
1. Audit all components for mobile viewport
2. Ensure touch targets are 44px+
3. Add focus states for keyboard navigation
4. Test at 320px viewport width
5. Add empty state messaging (FR-012)

**Dependencies**: Tailwind CSS

### Phase 7: Verification

**Goal**: Validate all user stories work end-to-end

**Tasks**:
1. Run through quickstart.md verification checklist
2. Test all flows on desktop and mobile viewport
3. Verify error scenarios
4. Document any issues found

**Dependencies**: All previous phases

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Route Protection | Client hooks + middleware | Hybrid for SSR + client navigation |
| Loading States | Tailwind animate-pulse skeleton | No additional dependencies |
| Edit Mode | Local component state | Simple, self-contained |
| Error Display | Inline banner with auto-dismiss | Non-blocking, contextual |
| Delete Confirmation | Browser confirm() | Simple, accessible, sufficient for demo |
| Auth State | React Context | Reactive updates, no external lib |

## Component Details

### AuthContext

```typescript
// Provides: isAuthenticated, user, loading, login, logout
// Used by: All protected pages, header component
// Storage: localStorage for token, state for reactive updates
```

### TaskItem

```typescript
// Props: task, isEditing, onEdit, onSave, onCancel, onComplete, onDelete
// Features: Display mode, edit mode, checkbox, delete button
// Keyboard: Enter saves, Escape cancels
```

### TaskSkeleton

```typescript
// Props: count (default: 3)
// Renders: Animated placeholder items matching TaskItem layout
```

### ErrorBanner

```typescript
// Props: message, onDismiss, autoDismissMs
// Features: Red background, dismiss button, auto-dismiss timer
```

## API Endpoints Used

All endpoints require Authorization: Bearer token (from Feature 002)

| Endpoint | Method | Component | Action |
|----------|--------|-----------|--------|
| /api/me | GET | AuthContext | Fetch user on mount |
| /api/tasks | GET | Tasks page | List tasks |
| /api/tasks | POST | Tasks page | Create task |
| /api/tasks/{id} | PUT | TaskItem | Update task |
| /api/tasks/{id} | DELETE | TaskItem | Delete task |
| /api/tasks/{id}/complete | PATCH | TaskItem | Complete task |

## Files Changed

### Modified (from Feature 002)
- `frontend/src/app/layout.tsx` - Add AuthProvider
- `frontend/src/app/login/page.tsx` - Add auth redirect
- `frontend/src/app/signup/page.tsx` - Add auth redirect
- `frontend/src/app/tasks/page.tsx` - Add skeleton, editing, errors

### New Files
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/components/TaskItem.tsx`
- `frontend/src/components/TaskSkeleton.tsx`
- `frontend/src/components/ErrorBanner.tsx`
- `frontend/middleware.ts`

## Complexity Tracking

> No complexity violations detected. Implementation follows minimal viable approach.

| Aspect | Assessment |
|--------|------------|
| New dependencies | 0 - uses existing Tailwind, React |
| New patterns | React Context (standard) |
| Component count | 3 new (TaskItem, TaskSkeleton, ErrorBanner) |
| State complexity | Local + context (minimal) |

## Success Metrics

From spec success criteria:

- [ ] SC-001: LCP < 2s on 3G
- [ ] SC-002: All elements have focus states
- [ ] SC-003: No layout shift after load
- [ ] SC-004: Visual feedback within 100ms
- [ ] SC-005: Functional at 320px width
- [ ] SC-006: Error messages user-friendly
- [ ] SC-007: Forms accessible with screen readers
