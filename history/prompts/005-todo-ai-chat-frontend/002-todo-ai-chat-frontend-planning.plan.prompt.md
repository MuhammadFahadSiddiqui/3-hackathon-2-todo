---
id: 002
title: Todo AI Chat Frontend Planning
stage: plan
date: 2026-02-07
surface: agent
model: claude-opus-4-5-20251101
feature: 005-todo-ai-chat-frontend
branch: 005-todo-ai-chat-frontend
user: user
command: /sp.plan
labels: ["planning", "chat-ui", "frontend", "ai-chatbot", "implementation-design"]
links:
  spec: specs/005-todo-ai-chat-frontend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-todo-ai-chat-frontend/plan.md
  - specs/005-todo-ai-chat-frontend/research.md
  - specs/005-todo-ai-chat-frontend/data-model.md
  - specs/005-todo-ai-chat-frontend/contracts/chat-ui.md
tests:
  - N/A (planning phase)
---

## Prompt

/sp.plan spec-5

Goal: Create implementation plan for Todo AI Chat Frontend

Plan outline:
1. Add ChatKit UI component
2. Connect to /api/{user_id}/chat
3. Manage messages + conversation_id
4. Render user/AI messages
5. Handle loading & errors
6. Use env-based API URL
7. Verify no impact on Phase-1/2/3

## Response snapshot

Created comprehensive implementation plan with Phase 0 research and Phase 1 design artifacts:

**Plan.md** (main implementation plan):
- Technical context: TypeScript 5.x, Next.js 16+, React 19, Tailwind CSS 4
- Constitution check: All 6 principles PASS
- Project structure with 5 new frontend files planned
- 4 implementation phases defined
- Safe extension points identified
- Risk mitigation strategies

**Research.md** (Phase 0):
- Existing patterns analysis from codebase review
- Technology decision: Native React components (not external ChatKit)
- State management: Custom useChat hook
- Layout integration: Collapsible side panel
- Message persistence: Backend-only (no localStorage)
- Component architecture defined
- Styling strategy using existing CSS variables
- Responsive design breakpoints
- Accessibility requirements

**Data-Model.md** (Phase 1):
- Core TypeScript types (Message, ChatState, ToolCallInfo)
- State transitions and flow diagram
- useChat hook API specification
- Action definitions and triggers
- Data mapping (backend ↔ frontend)
- Component props interfaces
- Storage strategy (backend-only)
- Error handling states and recovery
- Optimistic updates pattern
- Integration with tasks page (refresh mechanism)

**Contracts/chat-ui.md** (Phase 1):
- useChat hook interface and usage example
- ChatPanel component interface and DOM structure
- ChatMessage component interface and styling
- ChatInput component interface and behavior
- TypingIndicator component interface and animation
- Event flow sequences (send message, load history)
- Integration points with tasks page
- Error boundaries and validation
- Testing checklist (14 test cases)

## Outcome

- ✅ Impact: Complete implementation plan ready for task generation
- 🧪 Tests: N/A (planning phase)
- 📁 Files: 4 files created (plan.md, research.md, data-model.md, contracts/chat-ui.md)
- 🔁 Next prompts: /sp.tasks to generate implementation tasks
- 🧠 Reflection: Decision to use native React instead of ChatKit simplifies implementation

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check all PASS
- Prompt variant (if applicable): standard /sp.plan with user outline
- Next experiment (smallest change to try): Proceed with /sp.tasks
