# Research: Frontend Todo Application (Next.js App Router)

**Feature**: 003-todo-frontend
**Date**: 2026-01-11
**Status**: Complete

## Overview

This research documents technical decisions for polishing the Next.js frontend, building on the existing implementation from Feature 002 (JWT Auth).

---

## Decision 1: Route Protection Strategy

**Question**: How should we protect routes requiring authentication?

**Decision**: Client-side auth check with middleware fallback

**Rationale**:
- Next.js App Router supports middleware for server-side redirects
- Client-side hooks provide faster UX after initial auth check
- Hybrid approach: middleware for edge cases, client hooks for smooth UX

**Implementation**:
```typescript
// middleware.ts - Server-side protection
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  if (!token && request.nextUrl.pathname.startsWith('/tasks')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// hooks/useAuth.ts - Client-side protection
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  }, []);
  return { isAuthenticated };
}
```

**Alternatives Considered**:
- Server Components only: Would require passing auth through props everywhere
- HOC pattern: Less idiomatic in App Router
- Route groups with layouts: Good but doesn't handle redirect logic

---

## Decision 2: Loading State Pattern

**Question**: How should loading states be implemented?

**Decision**: Skeleton screens with Tailwind animate-pulse

**Rationale**:
- Skeletons provide better perceived performance than spinners
- Tailwind's `animate-pulse` is simple, no additional dependencies
- Matches existing Tailwind setup from Feature 002

**Implementation**:
```tsx
// components/TaskSkeleton.tsx
export function TaskSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-md animate-pulse">
      <div className="h-5 w-5 bg-gray-300 rounded" />
      <div className="flex-1 h-4 bg-gray-300 rounded" />
      <div className="w-16 h-4 bg-gray-300 rounded" />
    </div>
  );
}
```

**Alternatives Considered**:
- Spinner/loading dots: Less contextual, feels slower
- React Suspense: Requires Server Components, more complexity
- Third-party library (react-loading-skeleton): Adds dependency

---

## Decision 3: Inline Edit Implementation

**Question**: How should task editing be implemented?

**Decision**: Controlled input with local state, blur/enter to save

**Rationale**:
- Simple React state management, no external library needed
- Familiar UX pattern (click to edit, escape to cancel)
- Optimistic update with rollback on error

**Implementation**:
```tsx
// Inline edit flow
1. Click task title → replace span with input
2. Input pre-filled with current title
3. Enter or blur → call API, update state on success
4. Escape → cancel edit, restore original value
5. Error → show toast, restore original value
```

**Alternatives Considered**:
- Modal edit: More disruptive UX
- React Hook Form: Overkill for single field
- ContentEditable: Cross-browser issues, accessibility concerns

---

## Decision 4: Error Handling Strategy

**Question**: How should errors be displayed to users?

**Decision**: Inline error messages with auto-dismiss

**Rationale**:
- Toast/snackbar pattern is familiar and non-blocking
- Auto-dismiss prevents clutter
- Error state in component shows context-aware messages

**Implementation**:
```tsx
// Error display pattern
1. API errors → set error state with user-friendly message
2. Display error banner at top of relevant section
3. Auto-dismiss after 5 seconds or on user action
4. 401 errors → redirect to login (already implemented)
```

**Error Message Mapping**:
| Status | User Message |
|--------|--------------|
| 401 | Session expired. Please sign in again. |
| 404 | Task not found. It may have been deleted. |
| 500 | Something went wrong. Please try again. |
| Network | Unable to connect. Check your internet. |

**Alternatives Considered**:
- Error boundary: Good for crashes, not API errors
- Global toast system: More complex, requires context
- Modal errors: Too disruptive for common failures

---

## Decision 5: Responsive Design Approach

**Question**: How should mobile responsiveness be achieved?

**Decision**: Mobile-first Tailwind with existing breakpoints

**Rationale**:
- Tailwind's mobile-first approach is already in use
- Simple layout doesn't require complex breakpoint logic
- Focus on touch targets and readable typography

**Implementation**:
```tsx
// Responsive patterns
- Base styles: Mobile (default)
- sm: (640px+) Minor adjustments
- md: (768px+) Side-by-side layouts if needed
- Touch targets: min 44x44px for interactive elements
- Font sizes: base (16px) minimum for readability
```

**Alternatives Considered**:
- Container queries: Limited browser support
- CSS Grid with auto-fit: More complex than needed
- Separate mobile components: Code duplication

---

## Decision 6: Auth State Persistence

**Question**: How should auth state be persisted across refreshes?

**Decision**: localStorage for token, React context for state

**Rationale**:
- localStorage already used in Feature 002
- Context provides reactive updates across components
- No external state management needed

**Implementation**:
```tsx
// AuthContext pattern
1. AuthProvider wraps app in layout.tsx
2. On mount, check localStorage for token
3. Expose: isAuthenticated, user, login, logout
4. Components use useAuth() hook
```

**Alternatives Considered**:
- Redux/Zustand: Overkill for auth-only state
- Cookies: Already handled by Better Auth for session
- Session storage: Lost on tab close, not desired

---

## Decision 7: Delete Confirmation Pattern

**Question**: How should task deletion be confirmed?

**Decision**: Simple browser confirm() dialog

**Rationale**:
- Native dialog is accessible and familiar
- No additional UI component needed
- Sufficient for hackathon demo purposes

**Implementation**:
```tsx
const handleDelete = async (id: number) => {
  if (!confirm('Delete this task?')) return;
  await tasksApi.delete(id);
  setTasks(tasks.filter(t => t.id !== id));
};
```

**Alternatives Considered**:
- Custom modal: More work, not essential for demo
- Undo pattern: More complex state management
- No confirmation: Risk of accidental deletion

---

## Decision 8: User Profile Display

**Question**: How should user identity be shown?

**Decision**: Email in header with dropdown for signout

**Rationale**:
- Shows user which account is active
- Single dropdown simplifies header
- Consistent with common SaaS patterns

**Implementation**:
```tsx
// Header component
<div className="flex items-center gap-2">
  <span className="text-sm text-gray-600">{user.email}</span>
  <button onClick={handleSignOut}>Sign Out</button>
</div>
```

**Alternatives Considered**:
- Avatar with initials: More complex, needs design
- Separate profile page: Out of scope per spec
- Toast on login: Not persistent enough

---

## Decision 9: Keyboard Navigation

**Question**: What keyboard shortcuts should be supported?

**Decision**: Standard browser behavior plus form shortcuts

**Rationale**:
- Avoid conflicting with browser shortcuts
- Focus on form-centric interactions
- Tab navigation works by default

**Implementation**:
| Key | Context | Action |
|-----|---------|--------|
| Enter | Add task form | Submit new task |
| Enter | Edit mode | Save edit |
| Escape | Edit mode | Cancel edit |
| Tab | Global | Navigate focusable elements |

**Alternatives Considered**:
- Custom shortcuts (Ctrl+N): May conflict with browser
- Vim-style navigation: Unexpected for general users
- Arrow key navigation: Complex implementation

---

## Decision 10: Empty State Design

**Question**: What should users see when they have no tasks?

**Decision**: Encouraging message with prominent add button

**Rationale**:
- Empty states guide user to next action
- Positive messaging improves experience
- Call-to-action increases engagement

**Implementation**:
```tsx
{tasks.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-500 mb-4">No tasks yet!</p>
    <p className="text-gray-400 text-sm">Add your first task above</p>
  </div>
)}
```

**Alternatives Considered**:
- Illustration: Requires design assets
- Sample tasks: Confusing, fake data
- Nothing: Unhelpful, unclear state

---

## Summary

| # | Decision | Choice |
|---|----------|--------|
| 1 | Route Protection | Client hooks + middleware |
| 2 | Loading States | Skeleton with animate-pulse |
| 3 | Inline Edit | Controlled input, blur/enter save |
| 4 | Error Handling | Inline banners with auto-dismiss |
| 5 | Responsive Design | Mobile-first Tailwind |
| 6 | Auth Persistence | localStorage + React Context |
| 7 | Delete Confirmation | Browser confirm() |
| 8 | User Profile | Email in header with signout |
| 9 | Keyboard Navigation | Standard form shortcuts |
| 10 | Empty State | Message with CTA guidance |

All decisions prioritize simplicity and leverage existing patterns from Feature 002.
