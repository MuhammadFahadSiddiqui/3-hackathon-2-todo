<!--
  SYNC IMPACT REPORT
  ====================
  Version change: 1.0.0 → 1.1.0

  Modified principles: None (existing principles unchanged)

  Added sections:
    - Phase-III: AI Chatbot Requirements (new section after Security Requirements)
    - Technology Constraints updated with OpenAI Agents SDK, MCP SDK, ChatKit
    - Success Criteria updated to include Phase-III goals

  Removed sections: None

  Templates requiring updates:
    - .specify/templates/plan-template.md: ✅ Compatible (no changes needed)
    - .specify/templates/spec-template.md: ✅ Compatible (no changes needed)
    - .specify/templates/tasks-template.md: ✅ Compatible (no changes needed)

  Follow-up TODOs: None
-->

# Full-Stack Multi-User Todo Web Application Constitution

## Core Principles

### I. Spec-Driven Development

All implementation work MUST be derived from explicit specifications and generated plans.
No manual coding is permitted outside the boundaries of generated plans.

- Every feature MUST trace back to an explicit requirement in a spec document
- Implementation MUST follow the workflow: Spec → Plan → Tasks → Implementation
- All specs MUST be completed independently and validated before proceeding
- Claude Code + Spec-Kit Plus is the ONLY permitted spec workflow tooling

### II. Correctness Over Speed

APIs, authentication, and data integrity MUST be precise and verifiable.

- All API behavior MUST match defined endpoints and HTTP semantics exactly
- Authentication MUST be stateless using JWT with proper signature verification
- Data integrity MUST be maintained through validated schemas and migrations
- No shortcuts that compromise correctness are acceptable

### III. Security-First Design

JWT validation and user isolation MUST be enforced at every layer.

- All API routes MUST require a valid JWT (post-authentication flows)
- Requests without valid tokens MUST return 401 Unauthorized
- JWT signature verification is REQUIRED on every authenticated request
- User ID from JWT MUST match route-level user context
- Tasks MUST never be accessible across users (strict tenant isolation)
- Environment variables MUST be used for all secrets
- No hardcoded credentials or magic values are permitted

### IV. Reproducibility

All implementation steps MUST be derivable from specifications and plans.

- Every code change MUST reference its originating spec/plan/task
- Build and deployment processes MUST be deterministic
- Database schema changes MUST use versioned migrations
- Configuration MUST be externalized and documented

### V. Maintainability

Clear separation of frontend, backend, and auth concerns MUST be maintained.

- Frontend (Next.js 16+ with App Router) MUST be isolated from backend implementation details
- Backend (Python FastAPI with SQLModel) MUST expose clean API contracts
- Authentication (Better Auth, JWT-based) MUST be a distinct, pluggable layer
- Cross-cutting concerns MUST be handled through middleware patterns
- Code generation MUST follow modern best practices for each framework

### VI. Traceability

Every feature and change MUST be traceable through the spec workflow.

- All features MUST link to their specification document
- API contracts MUST remain stable once specified
- Breaking changes MUST be explicitly documented and versioned
- Prompt History Records (PHRs) MUST be created for all significant work

## Technology Constraints

The following technology stack is MANDATED for this project:

| Layer          | Technology                     | Version/Notes              |
|----------------|--------------------------------|----------------------------|
| Frontend       | Next.js with App Router        | 16+                        |
| Backend        | Python FastAPI                 | Latest stable              |
| ORM            | SQLModel                       | Latest stable              |
| Database       | Neon Serverless PostgreSQL     | Managed service            |
| Authentication | Better Auth                    | JWT-based                  |
| Spec Workflow  | Claude Code + Spec-Kit Plus    | Required tooling           |
| AI Agent SDK   | OpenAI Agents SDK              | Phase-III (Spec-4)         |
| MCP Server     | Official MCP SDK               | Phase-III (Spec-4)         |
| Chat UI        | ChatKit                        | Phase-III (Spec-5)         |

Deviations from this stack MUST be documented with explicit justification and approval.

## Security Requirements

### Authentication Requirements

- All protected API routes MUST validate JWT tokens before processing
- Token validation MUST verify signature, expiration, and issuer claims
- Invalid or expired tokens MUST result in 401 Unauthorized response
- Token refresh mechanisms MUST be implemented securely

### Authorization Requirements

- User data isolation MUST be enforced at the backend query level
- All database queries for user data MUST filter by authenticated user ID
- No API endpoint may return or modify another user's data
- Admin/elevated access patterns MUST be explicitly designed and documented

### Data Protection

- Sensitive data MUST be encrypted at rest and in transit
- Passwords MUST never be stored in plaintext
- Secrets MUST be managed via environment variables
- Audit logging MUST capture security-relevant events

## Phase-III: AI Chatbot Requirements

Phase-III introduces a Todo AI Chatbot. This phase MUST be developed using the
Agentic Dev Stack workflow exclusively: Spec → Plan → Tasks → Implementation.
No manual coding is permitted.

### Specification Structure

Phase-III is divided into two specifications:

- **Spec-4**: Todo AI Backend & MCP
- **Spec-5**: Chat UI & Conversational UX

### Spec-4: Todo AI Backend & MCP

The AI backend MUST adhere to the following requirements:

- Implement FastAPI backend with OpenAI Agents SDK
- Build MCP server using Official MCP SDK
- Expose stateless MCP tools for task CRUD operations:
  - add, list, update, complete, delete
- Persist all state (tasks, conversations, messages) in Neon PostgreSQL using SQLModel
- Provide stateless chat API: `POST /api/{user_id}/chat`
- Agent MUST select and call MCP tools based on natural language input
- Server MUST hold no in-memory state (fully stateless architecture)
- Handle errors gracefully and confirm actions in responses

### Spec-5: Chat UI & Conversational UX

The chat interface MUST adhere to the following requirements:

- Build ChatKit-based frontend for conversational interaction
- Connect UI to the chat API endpoint (`POST /api/{user_id}/chat`)
- Maintain conversation continuity via database persistence
- Display friendly confirmations and error messages
- Ensure authenticated, user-scoped interactions only (no cross-user access)

### Phase-III Constraints

- MUST follow existing Phase-I and Phase-II architecture patterns
- MUST NOT duplicate previously implemented features
- Optimize for minimal token usage in AI interactions
- Prefer clarity, correctness, and modular design

## Governance

### Amendment Procedure

1. Proposed changes MUST be documented with rationale
2. Changes affecting core principles require explicit stakeholder approval
3. All amendments MUST update the version number appropriately
4. Migration plans MUST accompany breaking governance changes

### Versioning Policy

- MAJOR: Backward-incompatible principle changes or removals
- MINOR: New principles or materially expanded guidance
- PATCH: Clarifications, wording improvements, non-semantic changes

### Compliance Review

- All PRs MUST verify compliance with this constitution
- Complexity beyond minimal requirements MUST be justified
- Security violations result in immediate rejection
- Constitution takes precedence over all other practices

### Success Criteria

This project is considered successful when:

**Phase-I & II (Core Todo Application)**:
- All 5 basic Todo features are implemented as a web application
- Multi-user system is fully functional with persistent storage
- JWT-based authentication works across frontend and backend
- Users can only access and modify their own tasks
- Backend passes auth and ownership enforcement review
- Frontend successfully integrates auth and secured APIs

**Phase-III (AI Chatbot)**:
- AI agent can perform task CRUD via natural language commands
- MCP server exposes stateless tools for all task operations
- Chat API is fully stateless with database-persisted state
- Conversation history is maintained per user in the database
- ChatKit UI provides intuitive conversational experience
- All interactions are authenticated and user-scoped

**Version**: 1.1.0 | **Ratified**: 2026-01-10 | **Last Amended**: 2026-02-07
