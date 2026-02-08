# Component Contracts: Chat UI

**Feature**: 005-todo-ai-chat-frontend
**Date**: 2026-02-07
**Purpose**: Define component interfaces and interactions

## 1. useChat Hook

### Interface

```typescript
interface UseChatOptions {
  autoLoadHistory?: boolean;  // Load history on mount (default: true)
}

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
  openPanel: () => void;
  closePanel: () => void;
  dismissError: () => void;
}

function useChat(options?: UseChatOptions): UseChatReturn;
```

### Usage Example

```typescript
function ChatPanel({ onTaskListRefresh }: ChatPanelProps) {
  const {
    messages,
    isLoading,
    error,
    isPanelOpen,
    sendMessage,
    togglePanel,
    dismissError,
  } = useChat();

  const handleSend = async (content: string) => {
    await sendMessage(content);
    onTaskListRefresh?.();
  };

  // ... render
}
```

## 2. ChatPanel Component

### Interface

```typescript
interface ChatPanelProps {
  onTaskListRefresh?: () => void;  // Called after task-modifying chat action
  className?: string;               // Additional CSS classes
}
```

### Behavior

| State | Render |
|-------|--------|
| `isPanelOpen: false` | Toggle button only |
| `isPanelOpen: true` | Full panel with header, messages, input |
| `isLoading: true` | TypingIndicator at bottom of messages |
| `error: string` | Error banner with dismiss/retry |

### DOM Structure

```html
<!-- Collapsed state -->
<button aria-label="Open AI Chat">💬</button>

<!-- Expanded state -->
<aside class="chat-panel">
  <header>
    <h2>AI Assistant</h2>
    <button aria-label="Close chat">×</button>
  </header>
  <div class="message-list" role="log">
    <!-- Messages -->
  </div>
  <footer>
    <ChatInput />
  </footer>
</aside>
```

### Accessibility

- `role="complementary"` on panel
- `role="log"` on message list for live updates
- Focus trap when panel is open
- Escape key closes panel

## 3. ChatMessage Component

### Interface

```typescript
interface ChatMessageProps {
  message: Message;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCallInfo[];
  status: "sending" | "sent" | "error";
}
```

### Behavior

| Condition | Render |
|-----------|--------|
| `role: "user"` | Right-aligned, purple background |
| `role: "assistant"` | Left-aligned, card background |
| `status: "sending"` | Dimmed opacity |
| `status: "error"` | Red border, retry icon |
| `toolCalls` present | Collapsible tool info below message |

### Styling

```css
/* User message */
.message-user {
  margin-left: auto;
  background: var(--secondary-purple);
  color: white;
  border-radius: 1rem 1rem 0.25rem 1rem;
}

/* Assistant message */
.message-assistant {
  margin-right: auto;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 1rem 1rem 1rem 0.25rem;
}
```

## 4. ChatInput Component

### Interface

```typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;  // Default: 2000
}
```

### Behavior

| Input | Action |
|-------|--------|
| Enter (no Shift) | Send message |
| Shift+Enter | New line |
| Empty input + send | Show validation |
| `isLoading: true` | Disable input and button |
| At maxLength | Show character count |

### DOM Structure

```html
<form class="chat-input">
  <textarea
    placeholder="Type a message..."
    aria-label="Chat message"
    rows="1"
  />
  <button
    type="submit"
    aria-label="Send message"
    disabled={isLoading || !hasText}
  >
    Send
  </button>
</form>
```

### Auto-resize

Textarea expands up to 4 lines, then scrolls internally.

## 5. TypingIndicator Component

### Interface

```typescript
interface TypingIndicatorProps {
  // No props - purely visual
}
```

### Render

```html
<div class="typing-indicator" aria-label="AI is typing">
  <span class="dot" />
  <span class="dot" />
  <span class="dot" />
</div>
```

### Animation

```css
@keyframes typing {
  0%, 100% { opacity: 0.4; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-4px); }
}

.dot {
  animation: typing 1.4s infinite ease-in-out;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
```

## 6. Event Flow

### Send Message Sequence

```
User types message
       ↓
User clicks Send / presses Enter
       ↓
ChatInput.onSend(content)
       ↓
useChat.sendMessage(content)
       ↓
├─ Add user Message to state (status: "sending")
├─ Set isLoading = true
├─ chatApi.sendMessage(content)
       ↓
   [API Response]
       ↓
├─ Update user Message (status: "sent")
├─ Add assistant Message to state
├─ Set isLoading = false
├─ Auto-scroll to bottom
       ↓
ChatPanel.onTaskListRefresh() [if tool_calls present]
```

### Load History Sequence

```
Component mounts
       ↓
useChat.loadHistory()
       ↓
├─ Set isLoading = true
├─ chatApi.getHistory()
       ↓
   [API Response]
       ↓
├─ Map HistoryMessage[] → Message[]
├─ Set messages
├─ Set conversationId
├─ Set isLoading = false
```

## 7. Integration Points

### Tasks Page (app/tasks/page.tsx)

```typescript
// Add import
import { ChatPanel } from "@/components/chat/ChatPanel";

// Add callback
const handleChatRefresh = () => {
  loadTasks();
};

// Add to render (after task list)
<ChatPanel onTaskListRefresh={handleChatRefresh} />
```

### File Structure

```
frontend/
├── components/
│   └── chat/
│       ├── ChatPanel.tsx       # Main container
│       ├── ChatMessage.tsx     # Message bubble
│       ├── ChatInput.tsx       # Input form
│       └── TypingIndicator.tsx # Loading dots
├── hooks/
│   └── useChat.ts              # Chat state hook
└── lib/
    └── chat-api.ts             # [EXISTS] API client
```

## 8. Error Boundaries

### Network Error

```typescript
try {
  await chatApi.sendMessage(content);
} catch (error) {
  if (error.status === 401) {
    // Session expired - redirect to login
    router.push("/login");
  } else {
    setError("Unable to send message. Please try again.");
  }
}
```

### Validation Error

```typescript
const validateMessage = (content: string): string | null => {
  if (!content.trim()) return "Please enter a message.";
  if (content.length > 2000) return "Message is too long (max 2000 characters).";
  return null;
};
```

## 9. Testing Checklist

| Component | Test Case |
|-----------|-----------|
| useChat | Initial state is empty |
| useChat | sendMessage adds user message |
| useChat | loadHistory populates messages |
| useChat | Error state on API failure |
| ChatPanel | Renders toggle button when closed |
| ChatPanel | Renders full panel when open |
| ChatMessage | User message styled right |
| ChatMessage | Assistant message styled left |
| ChatMessage | Tool calls expandable |
| ChatInput | Disabled during loading |
| ChatInput | Enter sends message |
| TypingIndicator | Animates correctly |
