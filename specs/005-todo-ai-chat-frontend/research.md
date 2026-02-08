# Phase 0 Research: Todo AI Chat Frontend

**Feature**: 005-todo-ai-chat-frontend
**Date**: 2026-02-07
**Purpose**: Technology validation and pattern analysis for chat UI implementation

## 1. Existing Patterns Analysis

### Frontend Architecture (from codebase review)

| Pattern | Location | Usage in Chat UI |
|---------|----------|------------------|
| React hooks for state | `hooks/useAuth.ts` | Pattern for `useChat.ts` hook |
| API client pattern | `lib/chat-api.ts` | Already implemented, ready to use |
| Component composition | `components/TaskItem.tsx` | Pattern for `ChatMessage.tsx` |
| Auth context | `contexts/AuthContext.tsx` | Reuse for authenticated API calls |
| Tailwind styling | All components | Consistent with existing design system |

### API Client (lib/chat-api.ts)

The chat API client is already implemented with:
- `chatApi.sendMessage(message)` - POST /api/chat
- `chatApi.getHistory(limit)` - GET /api/chat/history
- `chatApi.clearHistory()` - DELETE /api/chat/clear

Types available:
- `ChatResponse` - message, tool_calls, conversation_id
- `HistoryMessage` - id, role, content, created_at
- `ConversationHistory` - conversation_id, messages[]
- `ToolCallInfo` - name, arguments, result

### Tasks Page Layout (app/tasks/page.tsx)

Current structure:
- Full-width container with max-w-2xl
- Stats cards, form, search, task list
- ~545 lines, well-organized sections
- Uses CSS variables for theming

**Integration Point**: Add ChatPanel as a side panel or overlay that doesn't disrupt the existing layout.

## 2. Technology Decisions

### UI Framework: Native React Components

**Decision**: Build custom chat components using existing React patterns rather than external chat libraries.

**Rationale**:
- No external dependencies needed
- Consistent with existing codebase style
- Full control over UX and styling
- Smaller bundle size
- Already have the API client ready

**Rejected Alternative**: OpenAI ChatKit
- Would add external dependency
- May conflict with existing Tailwind setup
- Overkill for our simple chat needs

### State Management: Custom useChat Hook

**Decision**: Create `useChat.ts` hook following the pattern of existing hooks.

**State Shape**:
```typescript
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: number | null;
}
```

**Rationale**:
- Matches existing patterns (useAuth, useState patterns)
- Encapsulates all chat logic
- Easy to test and maintain

### Layout Integration: Collapsible Side Panel

**Decision**: Add chat as a right-side panel that can be toggled.

**Rationale**:
- Doesn't cover existing task list
- User can see tasks and chat simultaneously
- Responsive: collapses to overlay on mobile
- Toggle button provides easy access

### Message Persistence: Backend-Only

**Decision**: Don't persist messages in localStorage; rely on backend API.

**Rationale**:
- Backend already persists conversations (Spec-4)
- Single source of truth
- Works across devices
- Simplifies frontend logic

## 3. Component Architecture

```
ChatPanel (container)
├── Header (title + toggle/close button)
├── MessageList (scrollable)
│   ├── ChatMessage (user)
│   ├── ChatMessage (assistant)
│   ├── ChatMessage (assistant with tool_calls)
│   └── TypingIndicator (when loading)
└── ChatInput (text + send button)
```

## 4. Styling Strategy

Use existing CSS variables from the codebase:
- `--foreground`, `--background`
- `--card-bg`, `--card-border`
- `--primary-yellow`, `--secondary-purple`
- `--muted`, `--muted-light`
- `--success`, `--error`

Message styling:
- User messages: Right-aligned, purple accent
- Assistant messages: Left-aligned, card background
- Tool calls: Highlighted with yellow accent

## 5. Responsive Design

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥768px) | Side panel, 320-400px width |
| Mobile (<768px) | Full-screen overlay |

## 6. Performance Considerations

- Auto-scroll: Use `scrollIntoView` on new messages
- Long history: Keep last 50 messages in view, load more on scroll-up
- Debounce: Not needed for send (one message at a time)
- Loading state: Show typing indicator immediately on send

## 7. Accessibility Requirements

- Keyboard navigation (Tab through controls)
- Enter to send (also Ctrl+Enter)
- ARIA labels on interactive elements
- Focus management on open/close
- Screen reader announcements for new messages

## 8. Risk Assessment

| Risk | Mitigation |
|------|------------|
| Long AI response times | Show typing indicator, no timeout |
| Network failures | Error message with retry button |
| Layout conflicts | Test on multiple screen sizes |
| State sync issues | Refresh task list after chat actions |

## Conclusion

The implementation will use native React components with existing patterns. No new dependencies are required. The chat API client is already available from Spec-4 implementation. Integration will be minimal (one import, one component in tasks page).
