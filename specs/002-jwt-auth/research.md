# Research: Authentication & JWT-Based API Security

**Feature**: 002-jwt-auth
**Date**: 2026-01-10
**Purpose**: Resolve technical unknowns and document technology decisions

## Decision 1: JWT Library for FastAPI

**Decision**: Use PyJWT with cryptography extras (`pyjwt[crypto]`)

**Rationale**:
- Purpose-built for JWT encoding/decoding in Python
- Full RFC 7519 compliance
- Supports EdDSA (Ed25519) algorithm used by Better Auth
- Production-grade and widely adopted

**Alternatives Considered**:
- `python-jose`: Also supports JWT but less active maintenance
- `authlib`: More comprehensive but heavier dependency
- Custom implementation: Not recommended for security-critical code

**Installation**: `pip install pyjwt[crypto]`

## Decision 2: JWT Algorithm

**Decision**: EdDSA (Ed25519) - asymmetric signing

**Rationale**:
- Better Auth default algorithm for JWT plugin
- Modern, efficient, and secure (128-bit security equivalent)
- Asymmetric keys eliminate secret sharing between services
- Smaller signatures than RSA (64 bytes vs 256 bytes)

**Alternatives Considered**:
- RS256 (RSA): Industry standard but larger keys/signatures
- HS256 (HMAC): Requires shared secret between services - security risk
- ES256 (ECDSA): Valid alternative but EdDSA is faster

## Decision 3: Key Management Strategy

**Decision**: Fetch public keys from JWKS endpoint (no secret sharing)

**Rationale**:
- Better Auth exposes public keys at `/api/auth/jwks`
- Standard OIDC/OAuth2 mechanism for key distribution
- Private key stays in Next.js, never shared with FastAPI
- Supports automatic key rotation

**Implementation**:
```python
# FastAPI fetches public key from Better Auth
JWKS_URL = "http://localhost:3000/api/auth/jwks"
```

**Alternatives Considered**:
- Shared secret (HS256): Security anti-pattern for microservices
- Copy public key to FastAPI config: Breaks on key rotation
- Manual key synchronization: Error-prone

## Decision 4: Token Verification Pattern

**Decision**: FastAPI Depends pattern with HTTPBearer

**Rationale**:
- Native FastAPI security integration
- Generates OpenAPI schema automatically
- Dependency injection keeps code DRY and testable
- HTTPBearer is RFC 6750 standard

**Implementation Pattern**:
```python
from fastapi import Depends
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(credentials = Depends(security)):
    # Verify and return payload
    pass

@app.get("/api/tasks")
async def list_tasks(user = Depends(get_current_user)):
    # user.id is authenticated user ID
    pass
```

## Decision 5: JWKS Caching Strategy

**Decision**: In-memory cache with 1-hour TTL

**Rationale**:
- Reduces latency (no network call per request)
- Handles key rotation gracefully
- Simple implementation without external cache

**Refresh Strategy**:
1. Cache JWKS response for 1 hour
2. On unknown `kid` (key ID), refresh cache and retry
3. If still unknown after refresh, reject token

**Alternatives Considered**:
- No caching: High latency, network dependency on every request
- Redis cache: Overkill for single-instance deployment
- File-based cache: Complexity without benefit

## Decision 6: User Identity Extraction

**Decision**: Extract user ID from `sub` (subject) claim

**Rationale**:
- Standard JWT claim for user identifier (RFC 7519)
- Better Auth sets `sub` to user ID by default
- Consistent with OIDC specifications

**JWT Payload Structure** (from Better Auth):
```json
{
  "sub": "user-uuid-123",
  "iat": 1704067200,
  "exp": 1704068100,
  "iss": "https://app.example.com",
  "aud": "https://app.example.com",
  "email": "user@example.com"
}
```

## Decision 7: Route Path Changes

**Decision**: Remove `user_id` from route paths, derive from JWT

**Rationale**:
- Security: Never trust client-provided user ID
- Simplicity: Cleaner API paths
- Consistency: User context always from authenticated token

**Before**: `GET /api/{user_id}/tasks` (user_id in path)
**After**: `GET /api/tasks` (user_id from JWT `sub` claim)

## Decision 8: CORS Configuration

**Decision**: Enable CORS for frontend origin with credentials

**Rationale**:
- Frontend (Next.js) and backend (FastAPI) on different origins
- Authorization header must be allowed
- Credentials required for cookie-based sessions (if any)

**Implementation**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization"],
)
```

## Decision 9: Error Response Format

**Decision**: Standard 401 Unauthorized with JSON detail

**Rationale**:
- Consistent with existing 404 responses
- User-friendly without exposing internals
- Prevents timing attacks (constant response time)

**Error Cases**:
| Condition | Status | Detail |
|-----------|--------|--------|
| No Authorization header | 401 | "Not authenticated" |
| Invalid Bearer format | 401 | "Invalid authentication credentials" |
| Expired token | 401 | "Token expired" |
| Invalid signature | 401 | "Invalid token" |
| Unknown key ID | 401 | "Invalid token" |

## Decision 10: User Model in Database

**Decision**: Create User SQLModel synced from Better Auth

**Rationale**:
- Backend needs user reference for task ownership
- Better Auth manages auth state, backend stores user metadata
- Sync on first API request if user doesn't exist

**User Fields**:
- `id`: Primary key (matches Better Auth user ID)
- `email`: User email (for reference)
- `created_at`: When first synced

## Technology Summary

| Component | Technology | Version |
|-----------|------------|---------|
| JWT Library | PyJWT | 2.8+ |
| HTTP Client | httpx | 0.27+ |
| JWT Algorithm | EdDSA (Ed25519) | - |
| Key Source | JWKS endpoint | - |
| Auth Transport | Bearer token | RFC 6750 |
| Frontend Auth | Better Auth | Latest |

## References

- [Better Auth JWT Plugin](https://www.better-auth.com/docs/plugins/jwt)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [RFC 7519 - JWT](https://datatracker.ietf.org/doc/html/rfc7519)
- [RFC 6750 - Bearer Token](https://datatracker.ietf.org/doc/html/rfc6750)
