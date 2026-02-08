# Research: Todo AI Chatbot Backend

**Feature**: 004-todo-ai-backend
**Date**: 2026-02-07
**Purpose**: Resolve technical decisions and research best practices

## Research Topics

### 1. OpenAI Agents SDK Integration

**Decision**: Use OpenAI Python SDK with function calling (tools) feature

**Rationale**:
- OpenAI Agents SDK provides built-in support for tool/function calling
- Mature, well-documented API with Python client
- Supports streaming and non-streaming responses
- Cost-effective with gpt-4o-mini model

**Implementation Approach**:
```python
from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[...],
    tools=[...],  # MCP tool definitions
    tool_choice="auto"
)
```

**Alternatives Considered**:
- LangChain: Too heavy for this use case, adds unnecessary abstraction
- Anthropic Claude: Good alternative but OpenAI specified in constitution
- Local LLM: Not reliable enough for production use case

---

### 2. MCP (Model Context Protocol) Tools

**Decision**: Implement OpenAI-compatible tool definitions for task CRUD

**Rationale**:
- MCP defines a standard protocol for AI tool calling
- OpenAI's function calling implements similar concepts
- Tools are stateless functions that receive parameters and return results
- Each tool maps directly to existing task operations

**Tool Definitions**:

| Tool | Parameters | Returns |
|------|------------|---------|
| `add_task` | title (required), description (optional) | Created task object |
| `list_tasks` | status: "all" \| "pending" \| "completed" | Array of tasks |
| `complete_task` | task_id (required) | Updated task object |
| `update_task` | task_id (required), title?, description? | Updated task object |
| `delete_task` | task_id (required) | Success confirmation |

**Alternatives Considered**:
- Custom tool protocol: Unnecessary when OpenAI tools work well
- LangChain tools: Adds dependency overhead
- Direct function calls: Less structured, harder to maintain

---

### 3. Stateless Architecture Pattern

**Decision**: Load conversation from DB on each request, no in-memory caching

**Rationale**:
- Stateless design allows horizontal scaling
- Railway deployments may restart containers
- Conversation history persists across server restarts
- Simpler architecture with no cache invalidation concerns

**Implementation Pattern**:
```python
async def process_chat(user_id: str, message: str, session: Session):
    # 1. Get or create conversation
    conversation = get_active_conversation(user_id, session)

    # 2. Load recent messages (limit 20 for token efficiency)
    messages = get_conversation_messages(conversation.id, session, limit=20)

    # 3. Add user message to DB
    save_message(conversation.id, "user", message, session)

    # 4. Call AI with context
    response = await call_agent(messages + [{"role": "user", "content": message}])

    # 5. Execute tool calls if any
    if response.tool_calls:
        tool_results = execute_tools(response.tool_calls, user_id, session)
        response = await call_agent_with_results(messages, tool_results)

    # 6. Save assistant response
    save_message(conversation.id, "assistant", response.content, session)

    return response.content
```

**Alternatives Considered**:
- Redis caching: Adds infrastructure complexity
- In-memory conversation store: Lost on server restart
- Session-based storage: Violates stateless requirement

---

### 4. Conversation Model Design

**Decision**: Single active conversation per user with message history

**Rationale**:
- Simplifies UI/UX - user always continues same conversation
- Reduces complexity of conversation switching
- Messages table handles full history
- Can add multiple conversations later if needed

**Schema Design**:
```python
class Conversation(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: str = Field(index=True)
    created_at: datetime
    updated_at: datetime

class Message(SQLModel, table=True):
    id: int = Field(primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str  # "user" | "assistant" | "tool"
    content: str
    tool_calls: Optional[str]  # JSON string of tool call data
    created_at: datetime
```

**Alternatives Considered**:
- Multiple conversations: Adds UI complexity, defer to future
- No conversation entity: Harder to manage message ownership
- Embedded messages in conversation: Doesn't scale with large histories

---

### 5. Error Handling Strategy

**Decision**: Graceful degradation with user-friendly messages

**Rationale**:
- AI failures should not crash the application
- Users should receive helpful error messages
- Tool failures should be reported clearly
- Retry logic for transient failures

**Error Categories**:

| Error Type | User Message | Action |
|------------|--------------|--------|
| OpenAI API unavailable | "I'm having trouble connecting. Please try again." | Log error, return 503 |
| Task not found | "I couldn't find that task. Can you be more specific?" | Return in AI response |
| Invalid tool parameters | "I need more information to help with that." | Return in AI response |
| Database error | "Something went wrong. Please try again." | Log error, return 500 |
| Rate limit exceeded | "I'm receiving too many requests. Please wait a moment." | Return 429 |

---

### 6. Security Considerations

**Decision**: Reuse existing JWT auth with user_id scoping

**Rationale**:
- Existing `get_current_user` dependency provides JWT validation
- UserContext contains user_id for scoping queries
- No additional auth changes needed
- All tool operations filter by authenticated user_id

**Security Measures**:
1. JWT validation on every request via `Depends(get_current_user)`
2. All database queries filtered by `user_id`
3. Tool calls validate task ownership before operations
4. No cross-user data access possible

---

### 7. Token Optimization

**Decision**: Limit context to last 20 messages, summarize if needed

**Rationale**:
- GPT-4o-mini has 128k context but costs per token
- Most conversations don't need full history
- Recent context is most relevant for task management
- Can implement summarization for longer conversations later

**Token Budget**:
- System prompt: ~200 tokens
- Tool definitions: ~500 tokens
- Message history (20 messages): ~2000 tokens
- Current message: ~100 tokens
- Response budget: ~500 tokens
- **Total**: ~3300 tokens per request (~$0.0005 with gpt-4o-mini)

---

## Resolved Clarifications

All technical decisions have been made. No remaining NEEDS CLARIFICATION items.

## Next Steps

1. Proceed to Phase 1: Create data-model.md with entity definitions
2. Create API contracts in contracts/chat-api.yaml
3. Generate quickstart.md for local development setup
