# Phase 1: Frontend State Model

**Feature**: 005-todo-ai-chat-frontend
**Date**: 2026-02-07
**Purpose**: Define frontend state shapes and data flow for chat UI

## 1. Core Types

### Message Type (Frontend State)

```typescript
interface Message {
  id: string;                          // Unique ID (from backend or generated)
  role: "user" | "assistant";          // Message sender
  content: string;                     // Message text
  timestamp: Date;                     // When message was created
  toolCalls?: ToolCallInfo[];          // Optional tool call info (assistant only)
  status: "sending" | "sent" | "error"; // Message delivery status
}
```

### Chat State (useChat Hook)

```typescript
interface ChatState {
  messages: Message[];                 // All messages in conversation
  isLoading: boolean;                  // API request in progress
  error: string | null;                // Current error message
  conversationId: number | null;       // Backend conversation ID
  isPanelOpen: boolean;                // Chat panel visibility
}
```

### ToolCallInfo (from chat-api.ts)

```typescript
interface ToolCallInfo {
  name: string;                        // Tool name (add_task, list_tasks, etc.)
  arguments: Record<string, unknown>;  // Tool arguments
  result?: Record<string, unknown>;    // Tool execution result
}
```

## 2. State Transitions

### Initial State

```typescript
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  conversationId: null,
  isPanelOpen: false,
};
```

### State Flow Diagram

```
[Initial] --> [Loading History] --> [Ready]
                                      │
                                      ▼
                              [User Types Message]
                                      │
                                      ▼
                              [Sending Message]
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                    [Message Sent]          [Error State]
                          │                       │
                          ▼                       ▼
                  [Awaiting Response]      [Show Error]
                          │                       │
                          ▼                       └──> [Retry]
                  [Response Received]
                          │
                          ▼
                       [Ready]
```

## 3. Actions

### useChat Hook API

```typescript
interface UseChatReturn {
  // State
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isPanelOpen: boolean;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  togglePanel: () => void;
  dismissError: () => void;
}
```

### Action Definitions

| Action | Trigger | State Changes |
|--------|---------|---------------|
| `sendMessage` | User clicks send / presses Enter | Add user message, set isLoading, call API |
| `loadHistory` | Component mounts | Fetch history, populate messages |
| `clearHistory` | User clicks clear | Call API, reset messages |
| `togglePanel` | User clicks toggle button | Toggle isPanelOpen |
| `dismissError` | User clicks dismiss | Clear error |

## 4. Data Mapping

### Backend → Frontend (History)

```typescript
// From API
interface HistoryMessage {
  id: number;
  role: "user" | "assistant" | "tool";
  content: string;
  created_at: string;
}

// To Frontend
function mapHistoryMessage(msg: HistoryMessage): Message | null {
  // Skip tool role messages (internal)
  if (msg.role === "tool") return null;

  return {
    id: String(msg.id),
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    status: "sent",
  };
}
```

### Frontend → Backend (Send)

```typescript
// User input
const userMessage: string = "Add a task to buy groceries";

// API request (handled by chat-api.ts)
chatApi.sendMessage(userMessage);
// Returns: ChatResponse { message, tool_calls?, conversation_id? }
```

## 5. Component Props

### ChatPanel Props

```typescript
interface ChatPanelProps {
  onTaskListRefresh?: () => void;  // Callback to refresh tasks after chat action
}
```

### ChatMessage Props

```typescript
interface ChatMessageProps {
  message: Message;
}
```

### ChatInput Props

```typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}
```

### TypingIndicator Props

```typescript
interface TypingIndicatorProps {
  // No props needed - purely visual
}
```

## 6. Storage Strategy

### Session Persistence

- **conversationId**: Stored in React state only (backend handles persistence)
- **messages**: Fetched fresh on each page load from `/api/chat/history`
- **isPanelOpen**: Could use localStorage for preference (optional)

### No localStorage for Messages

Rationale:
- Backend is source of truth
- Avoids stale data issues
- Simplifies sync logic
- Works across devices/sessions

## 7. Error Handling

### Error States

| Error | User Message | Recovery |
|-------|--------------|----------|
| Network failure | "Unable to send message. Please try again." | Retry button |
| 401 Unauthorized | "Session expired. Please log in again." | Redirect to login |
| 500 Server error | "Something went wrong. Please try again." | Retry button |
| Empty message | "Please enter a message." | Inline validation |
| Message too long | "Message is too long (max 2000 characters)." | Inline validation |

### Error Recovery Flow

```typescript
// On error
setError("Unable to send message. Please try again.");
setIsLoading(false);
// Keep user's message in input for retry

// On retry
sendMessage(lastMessage);
```

## 8. Optimistic Updates

### Send Message Flow

1. Add user message to state immediately (status: "sending")
2. Call API
3. On success:
   - Update message status to "sent"
   - Add assistant response to messages
   - Set conversationId if returned
4. On error:
   - Update message status to "error"
   - Set error message

## 9. Integration with Tasks Page

### Refresh Mechanism

```typescript
// In ChatPanel
const handleMessageReceived = (response: ChatResponse) => {
  // If tool calls include task mutations, trigger refresh
  if (response.tool_calls?.some(tc =>
    ["add_task", "complete_task", "update_task", "delete_task"].includes(tc.name)
  )) {
    onTaskListRefresh?.();
  }
};
```

### State Isolation

- Chat state is independent of task state
- Only interaction is the refresh callback
- No shared state between chat and task components
