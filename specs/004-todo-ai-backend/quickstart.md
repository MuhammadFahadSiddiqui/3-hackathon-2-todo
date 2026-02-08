# Quickstart: Todo AI Chatbot Backend

**Feature**: 004-todo-ai-backend
**Date**: 2026-02-07

## Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend)
- Neon PostgreSQL database (existing from Phase-I/II)
- OpenAI API key

## Setup

### 1. Backend Environment

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install new dependencies
pip install openai>=1.0.0

# Add to .env file
echo "OPENAI_API_KEY=sk-your-api-key-here" >> .env
echo "OPENAI_MODEL=gpt-4o-mini" >> .env
```

### 2. Verify Database Connection

```bash
# Start backend server
uvicorn app.main:app --reload --port 8000

# Check health
curl http://localhost:8000/
# Expected: {"status": "ok", "message": "Todo Backend API is running"}
```

### 3. Test Chat Endpoint

```bash
# Login first to get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  | jq -r '.token')

# Send a chat message
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries"}' | jq
```

Expected response:
```json
{
  "message": "I've added \"Buy groceries\" to your task list!",
  "tool_calls": [
    {
      "name": "add_task",
      "arguments": {"title": "Buy groceries"},
      "result": {"success": true, "task": {"id": 1, "title": "Buy groceries"}}
    }
  ],
  "conversation_id": 1
}
```

### 4. Test All MCP Tools

```bash
# List tasks
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show my tasks"}' | jq

# Complete a task
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Mark groceries as done"}' | jq

# Update a task
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Rename groceries task to Buy vegetables"}' | jq

# Delete a task
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Delete the vegetables task"}' | jq
```

### 5. Frontend API Client (Optional)

If integrating with frontend before Spec-5:

```typescript
// frontend/lib/chat-api.ts
import { apiRequest } from './api';

export interface ChatResponse {
  message: string;
  tool_calls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
    result?: Record<string, unknown>;
  }>;
  conversation_id?: number;
}

export const chatApi = {
  sendMessage: (message: string) =>
    apiRequest<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getHistory: (limit = 50) =>
    apiRequest<{ messages: Array<{ role: string; content: string }> }>(
      `/api/chat/history?limit=${limit}`
    ),

  clearHistory: () =>
    apiRequest('/api/chat/clear', { method: 'DELETE' }),
};
```

## Verify Stateless Behavior

```bash
# Send a message
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add task: Test persistence"}' | jq

# Restart the server (Ctrl+C and restart)
uvicorn app.main:app --reload --port 8000

# Check if conversation persists
curl -s -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What tasks do I have?"}' | jq

# Should show "Test persistence" task
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| OPENAI_API_KEY | Yes | - | OpenAI API key for chat completions |
| OPENAI_MODEL | No | gpt-4o-mini | Model to use for AI responses |
| DATABASE_URL | Yes | - | Neon PostgreSQL connection string |

## Troubleshooting

### "OpenAI API key not found"
```bash
# Verify .env file has the key
cat backend/.env | grep OPENAI

# Ensure it starts with sk-
```

### "Not authenticated"
```bash
# Get a fresh token
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "yourpassword"}'
```

### "AI service unavailable"
- Check OpenAI status: https://status.openai.com/
- Verify API key has sufficient credits
- Check rate limits

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Implement Phase 1: Database models
3. Implement Phase 2: MCP tools
4. Implement Phase 3: AI agent
5. Implement Phase 4: Chat API endpoint
6. Test end-to-end
