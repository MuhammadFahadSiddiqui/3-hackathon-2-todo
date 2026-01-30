# Implementation Plan: Authentication & JWT-Based API Security

**Branch**: `002-jwt-auth` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-jwt-auth/spec.md`

## Summary

Implement JWT-based authentication using Better Auth (Next.js frontend) and PyJWT (FastAPI backend). Better Auth issues tokens with asymmetric EdDSA keys; FastAPI verifies signatures by fetching public keys from the JWKS endpoint. User identity is extracted from the `sub` claim and used to enforce ownership on all task operations.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/Next.js 16+ (frontend)
**Primary Dependencies**: FastAPI, PyJWT[crypto], Better Auth (Next.js)
**Storage**: Neon Serverless PostgreSQL (existing), User table addition
**Testing**: Manual API testing with curl (per spec), pytest for unit tests
**Target Platform**: Linux server (backend), Browser (frontend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Token verification <50ms latency (SC-004)
**Constraints**: 100 concurrent auth requests without errors (SC-005)
**Scale/Scope**: Multi-user todo app with JWT-based tenant isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Requirement | Status | Implementation |
|-----------|-------------|--------|----------------|
| I. Spec-Driven Development | All work derived from spec | ✅ PASS | Spec at `specs/002-jwt-auth/spec.md` with 14 FRs |
| II. Correctness Over Speed | JWT with proper verification | ✅ PASS | EdDSA signature verification via JWKS |
| III. Security-First Design | JWT validation + user isolation | ✅ PASS | HTTPBearer + sub claim extraction + query filtering |
| IV. Reproducibility | All steps from specs/plans | ✅ PASS | PHR records maintained, versioned migrations |
| V. Maintainability | Separation of concerns | ✅ PASS | Auth as middleware, distinct from business logic |
| VI. Traceability | Features link to specs | ✅ PASS | FR-001 to FR-014 traceable to implementation |

**Gate Result**: ✅ ALL PASS - Proceed to implementation

## Project Structure

### Documentation (this feature)

```text
specs/002-jwt-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output - JWT/Better Auth research
├── data-model.md        # Phase 1 output - User entity definition
├── quickstart.md        # Phase 1 output - Setup and testing guide
├── contracts/           # Phase 1 output - OpenAPI additions
│   └── auth-openapi.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── auth/                    # NEW: Authentication module
│   │   ├── __init__.py
│   │   ├── jwt_verifier.py      # JWKS cache + token verification
│   │   ├── dependencies.py      # FastAPI Depends: verify_token, get_current_user
│   │   └── schemas.py           # TokenPayload, UserContext schemas
│   ├── models/
│   │   ├── task.py              # Existing
│   │   └── user.py              # NEW: User SQLModel
│   ├── routes/
│   │   ├── tasks.py             # MODIFY: Add auth dependency
│   │   └── auth.py              # NEW: Auth status endpoints (optional)
│   ├── config.py                # MODIFY: Add auth settings
│   ├── database.py              # Existing
│   └── main.py                  # MODIFY: Add CORS, auth routes
└── requirements.txt             # MODIFY: Add pyjwt[crypto], httpx

frontend/                        # NEW: Next.js with Better Auth
├── src/
│   ├── lib/
│   │   └── auth.ts              # Better Auth client configuration
│   ├── app/
│   │   ├── api/auth/[...all]/   # Better Auth API routes
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   └── (protected)/         # Protected routes layout
│   └── components/
│       └── auth/                # Auth UI components
└── package.json                 # Better Auth dependencies
```

**Structure Decision**: Web application structure with existing `backend/` extended and new `frontend/` for Next.js. Auth module isolated in `backend/app/auth/`.

## Implementation Phases

### Phase 1: Backend JWT Verification (Steps 3-5 from user input)

**Goal**: FastAPI can verify Better Auth tokens and extract user context

1. Add `pyjwt[crypto]` and `httpx` to requirements.txt
2. Create `backend/app/auth/jwt_verifier.py` with JWKS cache
3. Create `backend/app/auth/dependencies.py` with `verify_token` and `get_current_user`
4. Add CORS middleware to main.py
5. Update config.py with `BETTER_AUTH_JWKS_URL` setting

### Phase 2: User Model & Database (Prerequisites for ownership)

**Goal**: Store user records for reference

1. Create `backend/app/models/user.py` with User SQLModel
2. Update database.py to include User in table creation
3. Add user lookup in `get_current_user` dependency

### Phase 3: Route Protection (Step 4, 6 from user input)

**Goal**: All task routes require valid JWT and enforce ownership

1. Modify `backend/app/routes/tasks.py` to use `get_current_user` dependency
2. Replace path `user_id` with authenticated user from token
3. Remove user_id from route paths (derive from JWT)
4. Update all queries to use authenticated user_id

### Phase 4: Frontend Better Auth (Steps 1-2 from user input)

**Goal**: Next.js issues JWT tokens via Better Auth

1. Initialize Next.js project in `frontend/`
2. Install and configure Better Auth with JWT plugin
3. Create auth API routes at `/api/auth/[...all]`
4. Create signup and login pages
5. Implement API client with Authorization header

### Phase 5: Integration & Verification (Step 7 from user input)

**Goal**: End-to-end authentication flow works

1. Test signup flow
2. Test login and token issuance
3. Test protected API access with valid token
4. Test rejection of invalid/expired tokens
5. Test cross-user access prevention

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| JWT Algorithm | EdDSA (Ed25519) | Better Auth default, modern, efficient |
| Key Management | Asymmetric via JWKS | No secret sharing, OIDC standard |
| JWT Library | PyJWT[crypto] | Purpose-built, RFC-compliant |
| Token Transport | Authorization: Bearer | RFC 6750 standard |
| User Lookup | From `sub` claim | Standard JWT subject claim |
| Route Changes | Remove user_id from path | Security: never trust client |

## API Changes

### Before (Feature 001)
```
POST   /api/{user_id}/tasks
GET    /api/{user_id}/tasks
GET    /api/{user_id}/tasks/{id}
PUT    /api/{user_id}/tasks/{id}
DELETE /api/{user_id}/tasks/{id}
PATCH  /api/{user_id}/tasks/{id}/complete
```

### After (Feature 002)
```
POST   /api/tasks              + Authorization: Bearer <token>
GET    /api/tasks              + Authorization: Bearer <token>
GET    /api/tasks/{id}         + Authorization: Bearer <token>
PUT    /api/tasks/{id}         + Authorization: Bearer <token>
DELETE /api/tasks/{id}         + Authorization: Bearer <token>
PATCH  /api/tasks/{id}/complete + Authorization: Bearer <token>
```

**Breaking Change**: Route paths change from `/api/{user_id}/tasks` to `/api/tasks`. User identity derived from JWT token.

## Complexity Tracking

> No complexity violations detected. Implementation follows minimal viable approach.

| Aspect | Assessment |
|--------|------------|
| New dependencies | 2 (pyjwt, httpx) - minimal |
| New modules | 1 (backend/app/auth/) - necessary |
| Route changes | Path simplification - security improvement |
| Frontend addition | Required for auth issuance |
