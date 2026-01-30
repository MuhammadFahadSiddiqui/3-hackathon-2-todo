# Data Model: Frontend Todo Application

**Feature**: 003-todo-frontend
**Date**: 2026-01-11

## Overview

This document defines the client-side data models and state management structures for the frontend application. Backend models (Task, User) are defined in Feature 001 and 002; this focuses on frontend-specific concerns.

---

## Client-Side State Entities

### AuthState

Represents the current authentication state in the application.

```typescript
interface AuthState {
  isAuthenticated: boolean | null;  // null = loading, true/false = determined
  user: User | null;                // Current user info if authenticated
  loading: boolean;                 // True during auth operations
  error: string | null;             // Error message if auth failed
}
```

**State Transitions**:
```
Initial → Loading → Authenticated | Unauthenticated
                 → Error (retry possible)
```

**Storage**:
- `isAuthenticated`: Derived from localStorage token presence
- `user`: Fetched from `/api/me` on app load
- `loading`: Transient React state
- `error`: Transient React state

---

### Task (Client Mirror)

Client-side representation of a task, mirroring backend schema.

```typescript
interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;  // ISO 8601 timestamp
  updated_at: string;  // ISO 8601 timestamp
}
```

**Note**: Defined in `frontend/src/lib/api.ts` (already exists from Feature 002)

---

### TaskListState

State for the task list page.

```typescript
interface TaskListState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  editingId: number | null;  // Task ID being edited, null if none
}
```

**State Transitions**:
```
Initial → Loading → Loaded | Error
Loaded → Creating → Loaded | Error
Loaded → Editing → Loaded | Error
Loaded → Deleting → Loaded | Error
Loaded → Completing → Loaded | Error
```

---

### EditState

State for inline task editing.

```typescript
interface EditState {
  taskId: number;
  originalTitle: string;
  currentTitle: string;
  saving: boolean;
  error: string | null;
}
```

**Lifecycle**:
1. Enter edit: `editingId` set, `originalTitle` captured
2. User types: `currentTitle` updated
3. Save: `saving = true`, API call, reset on success
4. Cancel: Reset to `originalTitle`, clear `editingId`
5. Error: Show error, restore `originalTitle`

---

## Component Props Types

### TaskItemProps

```typescript
interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  onEdit: (id: number) => void;
  onSave: (id: number, title: string) => Promise<void>;
  onCancel: () => void;
  onComplete: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}
```

### TaskSkeletonProps

```typescript
interface TaskSkeletonProps {
  count?: number;  // Number of skeleton items to show (default: 3)
}
```

### ErrorBannerProps

```typescript
interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  autoDismissMs?: number;  // Auto-dismiss timeout (default: 5000)
}
```

---

## Context Definitions

### AuthContext

```typescript
interface AuthContextValue {
  isAuthenticated: boolean | null;
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
```

**Provider Location**: `frontend/src/app/layout.tsx`

**Usage**:
```typescript
const { isAuthenticated, user, logout } = useAuth();
```

---

## API Response Types

### API Error Response

```typescript
interface ApiError {
  detail: string;
  status: number;
}
```

### Task Create Request

```typescript
interface CreateTaskRequest {
  title: string;
  description?: string;
}
```

### Task Update Request

```typescript
interface UpdateTaskRequest {
  title: string;
  description?: string;
}
```

---

## Local Storage Schema

| Key | Type | Purpose |
|-----|------|---------|
| `auth_token` | string | JWT access token from Better Auth |

**Note**: Token is set on login, cleared on logout or 401 response.

---

## Validation Rules

### Task Title
- **Required**: Cannot be empty or whitespace only
- **Max length**: 200 characters (matches backend)
- **Characters**: Any valid Unicode text

### Client-Side Validation

```typescript
function validateTaskTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) return 'Task title is required';
  if (trimmed.length > 200) return 'Title must be 200 characters or less';
  return null;  // Valid
}
```

---

## State Flow Diagrams

### Authentication Flow

```
┌─────────────┐
│ App Mounts  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Check localStorage │
│ for auth_token   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌──────────┐
│ No    │  │ Token    │
│ Token │  │ Found    │
└───┬───┘  └────┬─────┘
    │           │
    ▼           ▼
┌────────┐  ┌───────────┐
│ Show   │  │ Fetch     │
│ Login  │  │ /api/me   │
└────────┘  └─────┬─────┘
                  │
            ┌─────┴─────┐
            │           │
            ▼           ▼
      ┌─────────┐  ┌────────┐
      │ Success │  │ 401    │
      │ → Tasks │  │ → Login│
      └─────────┘  └────────┘
```

### Task CRUD Flow

```
┌──────────────┐
│ Tasks Page   │
│ Loads        │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│ Fetch Tasks  │────▶│ Show Skeleton│
└──────┬───────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│ Display List │
└──────┬───────┘
       │
  ┌────┼────┬────────┬─────────┐
  │    │    │        │         │
  ▼    ▼    ▼        ▼         ▼
Create Edit Complete Delete  Signout
  │    │    │        │         │
  ▼    ▼    ▼        ▼         ▼
 API  API  API      API    Clear Token
  │    │    │        │         │
  ▼    ▼    ▼        ▼         ▼
Update Update Update Remove  Redirect
State  State  State  Item    to Login
```

---

## File Locations

| Model/Type | File |
|------------|------|
| Task, User | `frontend/src/lib/api.ts` |
| AuthContext | `frontend/src/contexts/AuthContext.tsx` (new) |
| TaskItemProps | `frontend/src/components/TaskItem.tsx` (new) |
| TaskSkeleton | `frontend/src/components/TaskSkeleton.tsx` (new) |
| ErrorBanner | `frontend/src/components/ErrorBanner.tsx` (new) |
