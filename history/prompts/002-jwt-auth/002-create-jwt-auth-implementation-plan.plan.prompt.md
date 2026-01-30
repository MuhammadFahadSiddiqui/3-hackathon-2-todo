---
id: 002
title: Create JWT Auth Implementation Plan
stage: plan
date: 2026-01-10
surface: agent
model: claude-opus-4-5-20251101
feature: 002-jwt-auth
branch: 002-jwt-auth
user: fahad
command: /sp.plan
labels: ["authentication", "jwt", "better-auth", "fastapi", "planning"]
links:
  spec: specs/002-jwt-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-jwt-auth/plan.md
  - specs/002-jwt-auth/research.md
  - specs/002-jwt-auth/data-model.md
  - specs/002-jwt-auth/quickstart.md
  - specs/002-jwt-auth/contracts/auth-openapi.yaml
tests:
  - Constitution Check (6/6 principles passed)
---

## Prompt

/sp.plan Authentication & JWT-Based API Security

Step 1: Better Auth Configuration
- Enable Better Auth in Next.js project
- Configure JWT plugin
- Define JWT payload to include user_id and email
- Set token expiry duration
- Load shared secret from environment variable

Step 2: Frontend JWT Handling
- Access JWT token from Better Auth session
- Implement API client interceptor/helper
- Attach Authorization: Bearer <token> header to all API requests

Step 3: FastAPI JWT Verification Setup
- Install required JWT verification libraries
- Load shared secret from environment variable
- Define JWT decode and signature verification logic

Step 4: Authentication Middleware / Dependency
- Extract Authorization header from incoming requests
- Validate token format and signature
- Handle expired or invalid tokens
- Return 401 Unauthorized on failure

Step 5: User Context Extraction
- Decode JWT payload
- Extract authenticated user_id
- Make user context available to route handlers

Step 6: Ownership Enforcement
- Compare JWT user_id with route-level user_id
- Reject mismatches with 403 Forbidden
- Ensure all task queries rely on authenticated user identity

Step 7: Verification
- Test requests with valid JWT
- Test requests without JWT
- Test cross-user access attempts
- Confirm backend never trusts client-provided user_id blindly

## Response snapshot

Created comprehensive implementation plan with 5 phases:

**Phase 0: Research** (Completed)
- Researched Better Auth JWT integration patterns
- Decided on PyJWT[crypto] for FastAPI verification
- Chose EdDSA (Ed25519) algorithm with JWKS-based key management
- Documented 10 technical decisions in research.md

**Phase 1: Design Artifacts** (Completed)
- Created data-model.md with User entity and TokenPayload schema
- Created auth-openapi.yaml with security schemes and updated endpoints
- Created quickstart.md with setup and testing instructions

**Key Architectural Decisions**:
- Asymmetric JWT signing via JWKS (no secret sharing)
- User identity from `sub` claim in JWT
- Route paths simplified: `/api/{user_id}/tasks` → `/api/tasks`
- Auth module isolated in `backend/app/auth/`

**Constitution Check**: All 6 principles passed

## Outcome

- Impact: Complete implementation plan ready for task generation
- Tests: Constitution Check passed (6/6 principles)
- Files: 5 files created (plan.md, research.md, data-model.md, quickstart.md, auth-openapi.yaml)
- Next prompts: `/sp.tasks` to generate implementation tasks
- Reflection: Plan covers backend JWT verification, frontend Better Auth setup, and ownership enforcement; breaking change to API paths documented

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution Check PASS (6/6)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding /sp.adr for JWKS vs shared secret decision
