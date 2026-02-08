# Tasks: Todo AI Chat Frontend

**Input**: Design documents from `/specs/005-todo-ai-chat-frontend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/chat-ui.md

**Tests**: Not explicitly requested - implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/` at repository root
- **Components**: `frontend/components/chat/`
- **Hooks**: `frontend/hooks/`
- **Lib**: `frontend/lib/` (chat-api.ts already exists)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create chat component directory structure

- [X] T001 Create chat component directory at frontend/components/chat/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create core hook and types that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Create useChat hook with state management in frontend/hooks/useChat.ts
  - State: messages[], isLoading, error, conversationId, isPanelOpen
  - Actions: sendMessage, loadHistory, togglePanel, dismissError
  - Use chatApi from frontend/lib/chat-api.ts
  - Map HistoryMessage to internal Message type

- [X] T003 Create TypingIndicator component in frontend/components/chat/TypingIndicator.tsx
  - Animated three-dot indicator
  - CSS animation for bounce effect
  - ARIA label for accessibility

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Send Chat Message (Priority: P1) 🎯 MVP

**Goal**: User can type natural language messages to manage todos and receive AI responses

**Independent Test**: Type "Add a task to buy groceries" → message appears → AI responds with confirmation

### Implementation for User Story 1

- [X] T004 [P] [US1] Create ChatInput component in frontend/components/chat/ChatInput.tsx
  - Controlled textarea with auto-resize (up to 4 lines)
  - Send button (disabled when empty or loading)
  - Enter to send, Shift+Enter for newline
  - Character limit validation (2000 max)
  - Props: onSend, isLoading, disabled, placeholder

- [X] T005 [P] [US1] Create ChatMessage component in frontend/components/chat/ChatMessage.tsx
  - Props: message (id, role, content, timestamp, toolCalls, status)
  - User messages: right-aligned, purple background
  - Assistant messages: left-aligned, card background
  - Status indicators: sending (dimmed), error (red border)
  - Expandable tool_calls display for task confirmations

- [X] T006 [US1] Create ChatPanel component in frontend/components/chat/ChatPanel.tsx
  - Toggle button when closed (fixed position, bottom-right)
  - Side panel when open (320-400px width on desktop)
  - Header with title "AI Assistant" and close button
  - Message list using ChatMessage components
  - ChatInput at bottom
  - Use useChat hook for state
  - Props: onTaskListRefresh callback

- [X] T007 [US1] Integrate ChatPanel into tasks page at frontend/app/tasks/page.tsx
  - Import ChatPanel component
  - Add ChatPanel after task list
  - Pass loadTasks as onTaskListRefresh callback
  - No layout changes to existing elements

**Checkpoint**: User Story 1 complete - users can send messages and receive AI responses

---

## Phase 4: User Story 2 - View Conversation History (Priority: P1)

**Goal**: User can see chat history with messages displayed in chronological order

**Independent Test**: Send multiple messages → all messages visible in order → can scroll through history

### Implementation for User Story 2

- [X] T008 [US2] Add auto-scroll to ChatPanel in frontend/components/chat/ChatPanel.tsx
  - useRef for message list container
  - useEffect to scroll to bottom on new messages
  - scrollIntoView({ behavior: 'smooth' })

- [X] T009 [US2] Add message list styling in frontend/components/chat/ChatPanel.tsx
  - Scrollable container with overflow-y-auto
  - Proper spacing between messages
  - Visual grouping for consecutive same-role messages

**Checkpoint**: User Story 2 complete - message history is visible and scrollable

---

## Phase 5: User Story 6 - Chat Interface Integration (Priority: P1)

**Goal**: Chat is seamlessly integrated without disrupting existing todo workflow

**Independent Test**: Open chat panel → interact with todo list → both work simultaneously

### Implementation for User Story 6

- [X] T010 [US6] Add responsive layout to ChatPanel in frontend/components/chat/ChatPanel.tsx
  - Desktop (≥768px): Side panel, 320-400px width
  - Mobile (<768px): Full-screen overlay
  - Tailwind responsive classes (md: breakpoint)

- [X] T011 [US6] Add keyboard accessibility to ChatPanel in frontend/components/chat/ChatPanel.tsx
  - Escape key closes panel
  - Focus management on open/close
  - Tab navigation through controls
  - ARIA labels on interactive elements

- [X] T012 [US6] Add smooth transitions to ChatPanel in frontend/components/chat/ChatPanel.tsx
  - Slide-in animation for panel open
  - Fade transition for toggle button

**Checkpoint**: User Story 6 complete - chat integrates seamlessly with existing UI

---

## Phase 6: User Story 3 - Conversation Persistence (Priority: P2)

**Goal**: Conversation persists across page refreshes and sessions

**Independent Test**: Send messages → refresh page → previous messages are loaded

### Implementation for User Story 3

- [X] T013 [US3] Add loadHistory on mount in frontend/hooks/useChat.ts
  - useEffect to call loadHistory when panel opens
  - Set conversationId from response
  - Handle empty history (new user)

- [X] T014 [US3] Add welcome message for new conversations in frontend/components/chat/ChatPanel.tsx
  - Display welcome text when messages array is empty
  - "Hi! I'm your AI assistant. Try 'Add a task to...' or 'Show my tasks'"

**Checkpoint**: User Story 3 complete - conversations persist across sessions

---

## Phase 7: User Story 4 - Loading and Typing Indicators (Priority: P2)

**Goal**: Visual feedback when AI is processing a message

**Independent Test**: Send message → typing indicator appears → replaced by response

### Implementation for User Story 4

- [X] T015 [US4] Integrate TypingIndicator into ChatPanel in frontend/components/chat/ChatPanel.tsx
  - Show TypingIndicator at bottom of message list when isLoading
  - Position as assistant message (left-aligned)
  - Auto-scroll to show indicator

- [X] T016 [US4] Add sending state to user messages in frontend/components/chat/ChatMessage.tsx
  - Dimmed opacity for status: "sending"
  - Spinner or pulse animation
  - Transition to normal on "sent"

**Checkpoint**: User Story 4 complete - users see visual feedback during AI processing

---

## Phase 8: User Story 5 - Error Handling and Recovery (Priority: P2)

**Goal**: Clear error messages with retry capability

**Independent Test**: Simulate network error → error message shown → retry works

### Implementation for User Story 5

- [X] T017 [US5] Add error display to ChatPanel in frontend/components/chat/ChatPanel.tsx
  - Error banner at top of message list
  - Red styling with error icon
  - Dismiss button (calls dismissError)
  - Retry button for last failed message

- [X] T018 [US5] Add error recovery in frontend/hooks/useChat.ts
  - Store last failed message for retry
  - retryLastMessage function
  - Clear error on successful send
  - Handle 401 (redirect to login)

- [X] T019 [US5] Add validation to ChatInput in frontend/components/chat/ChatInput.tsx
  - Empty message prevention
  - Character count display near limit
  - Inline error for exceeded limit

**Checkpoint**: User Story 5 complete - errors are handled gracefully with recovery options

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements across all components

- [X] T020 [P] Add index export file at frontend/components/chat/index.ts
  - Export ChatPanel, ChatMessage, ChatInput, TypingIndicator

- [X] T021 [P] Add clear conversation feature to ChatPanel in frontend/components/chat/ChatPanel.tsx
  - Clear button in header (trash icon)
  - Confirmation before clearing
  - Calls clearHistory from useChat

- [X] T022 Review all components for consistent styling with existing app theme
  - Use CSS variables: --foreground, --card-bg, --primary-yellow, --secondary-purple
  - Match existing border-radius, shadow, spacing patterns

- [X] T023 Test responsive behavior on mobile viewport
  - Verify overlay mode on small screens
  - Test touch interactions
  - Ensure no horizontal scroll

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                    Phase 2: Foundational                     │
│              (useChat hook + TypingIndicator)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │   US1    │      │   US2    │      │   US6    │
   │  P1 MVP  │◄────►│    P1    │◄────►│    P1    │
   │  Send    │      │  History │      │ Integrate│
   └────┬─────┘      └────┬─────┘      └────┬─────┘
        │                 │                 │
        └────────┬────────┴────────┬────────┘
                 ▼                 ▼
           ┌──────────┐      ┌──────────┐
           │   US3    │      │   US4    │
           │    P2    │      │    P2    │
           │ Persist  │      │ Loading  │
           └────┬─────┘      └────┬─────┘
                │                 │
                └────────┬────────┘
                         ▼
                   ┌──────────┐
                   │   US5    │
                   │    P2    │
                   │  Errors  │
                   └──────────┘
```

- **US1, US2, US6 (all P1)**: Can start in parallel after Foundational
- **US3 (P2)**: Depends on US1 (need sendMessage to test persistence)
- **US4 (P2)**: Depends on US1 (need message flow for loading states)
- **US5 (P2)**: Can start after US1 (error handling for message sending)

### Within Each User Story

- ChatInput and ChatMessage can be built in parallel (T004, T005)
- ChatPanel depends on both ChatInput and ChatMessage
- Integration (T007) depends on ChatPanel

### Parallel Opportunities

```
Phase 2 (Foundational):
  T002 useChat.ts  ║  T003 TypingIndicator.tsx (after T002 types defined)

Phase 3 (US1):
  T004 ChatInput.tsx  ║  T005 ChatMessage.tsx
  → then T006 ChatPanel.tsx
  → then T007 Integration

Phase 9 (Polish):
  T020 index.ts  ║  T021 clear feature  ║  T022 styling review
```

---

## Parallel Example: User Story 1

```bash
# Launch ChatInput and ChatMessage in parallel:
Task: "Create ChatInput component in frontend/components/chat/ChatInput.tsx"
Task: "Create ChatMessage component in frontend/components/chat/ChatMessage.tsx"

# Then sequentially:
Task: "Create ChatPanel component in frontend/components/chat/ChatPanel.tsx"
Task: "Integrate ChatPanel into tasks page"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T003)
3. Complete Phase 3: User Story 1 (T004-T007)
4. **STOP and VALIDATE**: Test sending messages and receiving AI responses
5. Deploy/demo if ready - basic chat functionality works

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Send Message) → Test → Deploy (MVP!)
3. Add US2 (History View) + US6 (Integration) → Test → Deploy
4. Add US3 (Persistence) + US4 (Loading) → Test → Deploy
5. Add US5 (Errors) → Test → Deploy
6. Polish phase → Final release

### Task Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Setup | 1 | Directory structure |
| Foundational | 2 | useChat hook, TypingIndicator |
| US1 (P1) | 4 | Send message - **MVP** |
| US2 (P1) | 2 | View history |
| US6 (P1) | 3 | Integration |
| US3 (P2) | 2 | Persistence |
| US4 (P2) | 2 | Loading indicators |
| US5 (P2) | 3 | Error handling |
| Polish | 4 | Cross-cutting concerns |
| **Total** | **23** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All components use existing chat-api.ts client (no new API work)
- Uses existing CSS variables for consistent theming
- No backend changes required
- Commit after each task or logical group
