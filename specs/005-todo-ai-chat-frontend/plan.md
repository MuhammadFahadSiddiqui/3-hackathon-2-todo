# Implementation Plan: Todo AI Chat Frontend

**Branch**: `005-todo-ai-chat-frontend` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-todo-ai-chat-frontend/spec.md`

## Summary

Add an AI-powered chatbot UI to the existing Todo frontend application. The chat interface allows users to manage tasks through natural language conversation, connecting to the Spec-4 backend API (`POST /api/chat`). The implementation uses React components with existing patterns, integrates with the existing authentication system, and maintains conversation history across sessions.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16+ (App Router)
**Primary Dependencies**: React 19, Tailwind CSS 4, existing chat-api.ts client
**Storage**: Backend-persisted (via Spec-4 API), React state for UI
**Testing**: Manual browser testing
**Target Platform**: Web browsers (desktop and mobile)
**Project Type**: Web application (frontend extension)
**Performance Goals**: <100ms UI response, <5s AI response
**Constraints**: No backend changes, extend existing UI safely
**Scale/Scope**: Single-user concurrent, up to 50+ messages in history

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | ✅ PASS | Feature derived from spec.md with FR-001 to FR-024 |
| II. Correctness Over Speed | ✅ PASS | UI states match API responses, error handling defined |
| III. Security-First Design | ✅ PASS | Uses existing JWT auth (FR-007, FR-024), no secrets exposed |
| IV. Reproducibility | ✅ PASS | All changes traced to spec, uses existing patterns |
| V. Maintainability | ✅ PASS | New components only, no modification to existing features |
| VI. Traceability | ✅ PASS | PHR created, all work linked to 005-todo-ai-chat-frontend spec |

**Phase-III Specific Compliance**:
- ✅ Frontend only, no backend changes (mandated)
- ✅ Extends existing Phase-I/II/III patterns (mandated)
- ✅ Uses existing chat-api.ts client (from Spec-4 implementation)
- ✅ No breaking changes to existing features (mandated)

## Project Structure

### Documentation (this feature)

```text
specs/005-todo-ai-chat-frontend/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Technology research
├── data-model.md        # Phase 1: Frontend state model
├── contracts/           # Phase 1: Component interfaces
│   └── chat-ui.md       # Component API documentation
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2: Implementation tasks
```

### Source Code (repository root)

```text
frontend/
├── components/
│   ├── chat/
│   │   ├── ChatPanel.tsx       # NEW: Main chat container
│   │   ├── ChatMessage.tsx     # NEW: Individual message component
│   │   ├── ChatInput.tsx       # NEW: Message input with send
│   │   └── TypingIndicator.tsx # NEW: Loading/typing animation
│   └── [existing components unchanged]
├── hooks/
│   ├── useChat.ts              # NEW: Chat state management hook
│   └── [existing hooks unchanged]
├── lib/
│   ├── chat-api.ts             # EXISTS: From Spec-4 implementation
│   └── [existing libs unchanged]
├── app/
│   └── tasks/
│       └── page.tsx            # EXTEND: Add ChatPanel integration
└── [existing files unchanged]
```

**Structure Decision**: Frontend-only extension with new chat components added to existing `components/` directory. Integration point is the tasks page where ChatPanel will be added as a collapsible side panel.

## Safe Extension Points (from codebase review)

### Frontend Extensions

| Location | Action | Purpose |
|----------|--------|---------|
| `components/chat/ChatPanel.tsx` | CREATE | Main chat container with message list |
| `components/chat/ChatMessage.tsx` | CREATE | Render individual user/assistant messages |
| `components/chat/ChatInput.tsx` | CREATE | Text input with send button |
| `components/chat/TypingIndicator.tsx` | CREATE | Loading animation during AI response |
| `hooks/useChat.ts` | CREATE | Chat state management (messages, loading, error) |
| `app/tasks/page.tsx` | EXTEND | Add ChatPanel to layout (1 import, 1 component) |

### Reusable Components (no modification needed)

| Component | Usage |
|-----------|-------|
| `lib/chat-api.ts` | Existing chat API client (sendMessage, getHistory) |
| `hooks/useAuth.ts` | Existing auth hook for authentication state |
| `contexts/AuthContext.tsx` | Existing auth context for user info |
| `lib/api.ts` | Reference for API patterns |

## Implementation Phases

### Phase 1: Core Chat Components

1. Create `useChat` hook with state management:
   - messages array (user + assistant)
   - isLoading state
   - error state
   - conversationId
   - sendMessage function
   - loadHistory function

2. Create `ChatMessage` component:
   - Props: role, content, timestamp
   - Distinct styling for user (right, blue) vs assistant (left, gray)
   - Optional tool_calls display for confirmations

3. Create `ChatInput` component:
   - Controlled text input
   - Send button with Enter key support
   - Disabled state during loading
   - Character limit validation (2000)

### Phase 2: Chat Panel Container

1. Create `ChatPanel` component:
   - Header with title and toggle/minimize
   - Scrollable message list
   - ChatInput at bottom
   - Auto-scroll to newest messages

2. Create `TypingIndicator` component:
   - Animated dots or pulsing indicator
   - Shown during API request

### Phase 3: Page Integration

1. Update `app/tasks/page.tsx`:
   - Import ChatPanel component
   - Add to layout (side panel or overlay)
   - Toggle button to show/hide chat

2. State synchronization:
   - Refresh task list after chat actions (via callback)
   - Share loading states appropriately

### Phase 4: Persistence & Polish

1. Load conversation history on mount
2. Handle session persistence (conversationId)
3. Error states and retry functionality
4. Responsive design for mobile
5. Accessibility (ARIA labels, keyboard navigation)

## Environment Variables

```bash
# Already configured in frontend
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
```

## Complexity Tracking

No constitution violations. All implementation follows existing patterns with minimal extensions.

## Dependencies

```text
# No new dependencies needed
# Uses existing:
# - React 19
# - Tailwind CSS 4
# - lib/chat-api.ts (from Spec-4)
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Chat blocks task list interaction | Use collapsible panel, not overlay |
| Long conversations cause scroll issues | Virtualize message list if >100 messages |
| Network errors disrupt UX | Show clear error messages with retry |
| Mobile layout breaks | Test responsive design early |
