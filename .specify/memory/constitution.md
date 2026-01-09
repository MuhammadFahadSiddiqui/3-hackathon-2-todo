<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 → 1.0.0 (MAJOR - initial constitution creation)

  Modified principles: N/A (new constitution)

  Added sections:
    - Core Principles (6 principles)
    - Technology Constraints
    - Security Constraints
    - Operational Constraints
    - Governance

  Removed sections: N/A

  Templates requiring updates:
    - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
    - .specify/templates/spec-template.md: ✅ Compatible (Requirements align with principles)
    - .specify/templates/tasks-template.md: ✅ Compatible (Phase structure supports TDD)

  Follow-up TODOs: None
-->

# Full-Stack Multi-User Todo Web Application Constitution

## Core Principles

### I. Spec-Driven Development

All features and changes MUST be derived from explicit specifications. No manual coding outside generated plans is permitted.

- Every feature MUST trace back to an explicit requirement in spec.md
- Implementation MUST follow the generated plan.md exactly
- Code generation MUST follow modern best practices for each framework
- All steps MUST be derivable from specs and plans (reproducibility)

**Rationale**: Ensures consistency, traceability, and prevents scope creep. Changes are deliberate and documented.

### II. Correctness Over Speed

APIs, authentication, and data integrity MUST be precise. Shortcuts that compromise correctness are prohibited.

- All API behavior MUST match defined endpoints and HTTP semantics
- Data operations MUST maintain referential integrity
- Edge cases MUST be handled explicitly, not ignored
- Error responses MUST be accurate and informative

**Rationale**: A correct system can be optimized; an incorrect system must be rewritten.

### III. Security-First Design

JWT validation and user isolation MUST be enforced everywhere. Security is non-negotiable.

- All API routes (post-auth) MUST require a valid JWT
- Requests without valid tokens MUST return 401 Unauthorized
- JWT signature verification MUST occur on every request
- User ID from JWT MUST match route-level user context
- Tasks MUST never be accessible across users
- Environment variables MUST be used for all secrets
- No hardcoded credentials or magic values permitted

**Rationale**: Security breaches destroy user trust and can have legal consequences. Defense in depth starts at design.

### IV. User Data Isolation

User data MUST be isolated at the backend query level. Cross-user data access is a critical failure.

- Every database query MUST filter by authenticated user_id
- Authorization checks MUST occur before any data operation
- API endpoints MUST validate ownership before returning/modifying data
- Multi-tenant data leakage MUST be treated as a P0 incident

**Rationale**: User privacy is fundamental. Isolation at the query level prevents entire classes of vulnerabilities.

### V. Maintainability

Clear separation of frontend, backend, and auth concerns MUST be maintained.

- Frontend (Next.js) handles UI/UX and client-side state only
- Backend (FastAPI) handles business logic, data access, and API contracts
- Authentication (Better Auth) handles identity, tokens, and session management
- Each layer MUST have well-defined interfaces
- Cross-cutting concerns MUST be documented

**Rationale**: Clean architecture enables independent testing, deployment, and evolution of each layer.

### VI. API Contract Stability

API contracts MUST remain stable once specified. Breaking changes require explicit versioning.

- Endpoint paths, methods, and response schemas are contracts
- Once specified, contracts MUST NOT change without versioning
- Backward compatibility MUST be maintained within major versions
- Breaking changes MUST be documented in changelog

**Rationale**: Stable APIs enable frontend and backend to evolve independently and reduce integration failures.

## Technology Constraints

Technology stack is fixed and MUST NOT be substituted without constitution amendment.

| Layer | Technology | Version Requirement |
|-------|------------|---------------------|
| Frontend | Next.js with App Router | 16+ |
| Backend | Python FastAPI | Latest stable |
| ORM | SQLModel | Latest stable |
| Database | Neon Serverless PostgreSQL | N/A |
| Authentication | Better Auth (JWT-based) | Latest stable |
| Spec Workflow | Claude Code + Spec-Kit Plus | N/A |

**Constraints**:
- Authentication MUST be stateless using JWT
- All database access MUST go through SQLModel
- Frontend MUST use App Router (not Pages Router)

## Security Constraints

These constraints are NON-NEGOTIABLE and MUST be verified in code review.

1. **Authentication Required**: All API routes (except auth endpoints) MUST require a valid JWT
2. **Unauthorized Response**: Requests without valid tokens MUST return 401 Unauthorized
3. **Signature Verification**: JWT signature MUST be verified on every request
4. **User Context Match**: User ID from JWT MUST match route-level user context
5. **Data Isolation**: Tasks MUST never be accessible across users
6. **Secret Management**: All secrets MUST use environment variables
7. **No Hardcoding**: No credentials or tokens in source code

## Operational Constraints

These constraints govern how development proceeds.

1. **No Manual Coding**: Implementation MUST follow generated plans
2. **Independent Validation**: Each spec MUST be completed and validated independently
3. **Contract Stability**: API contracts MUST remain stable once specified
4. **Atomic Changes**: Each change MUST be small, testable, and traceable

## Governance

This constitution supersedes all other practices. Amendments require:

1. **Documentation**: Proposed change MUST be documented with rationale
2. **Impact Analysis**: Changes MUST include impact on existing specs and code
3. **Version Increment**: Amendment MUST increment constitution version
4. **Migration Plan**: If breaking, MUST include migration path

**Compliance Requirements**:
- All PRs MUST verify compliance with this constitution
- Constitution Check in plan.md MUST pass before implementation
- Violations discovered post-merge MUST be treated as P0 bugs

**Version**: 1.0.0 | **Ratified**: 2026-01-09 | **Last Amended**: 2026-01-09
