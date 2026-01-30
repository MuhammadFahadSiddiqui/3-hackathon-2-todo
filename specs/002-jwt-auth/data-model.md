# Data Model: Authentication & JWT-Based API Security

**Feature**: 002-jwt-auth
**Date**: 2026-01-10
**Source**: [spec.md](./spec.md) Key Entities section

## Entities

### User

**Purpose**: Represents an authenticated user in the system

**SQLModel Definition**:
```python
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True, max_length=36)
    email: str = Field(unique=True, index=True, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | str | PK, max 36 chars | UUID from Better Auth |
| `email` | str | unique, indexed | User email address |
| `created_at` | datetime | auto-generated | First sync timestamp |

**Notes**:
- Password is NOT stored in backend; Better Auth manages authentication
- User record synced from Better Auth on first authenticated request
- ID matches Better Auth's user ID for consistency

### JWT Token (Transient)

**Purpose**: Authentication credential passed in requests

**Not stored in database** - validated on each request

**Payload Structure**:
```python
from pydantic import BaseModel

class TokenPayload(BaseModel):
    sub: str          # User ID (required)
    iat: int          # Issued at timestamp
    exp: int          # Expiration timestamp
    iss: str          # Issuer URL
    aud: str          # Audience URL
    email: str | None = None  # User email (optional)
```

**Claims**:

| Claim | Required | Description |
|-------|----------|-------------|
| `sub` | Yes | Subject - User ID |
| `iat` | Yes | Issued At - Unix timestamp |
| `exp` | Yes | Expiration - Unix timestamp |
| `iss` | No | Issuer - Better Auth URL |
| `aud` | No | Audience - API URL |
| `email` | No | User email for convenience |

**Validation Rules**:
- Signature must verify against JWKS public key
- `exp` must be in the future
- `iss` should match configured issuer (optional validation)
- `sub` must be present and non-empty

### UserContext (Runtime)

**Purpose**: Authenticated user context available to route handlers

**Pydantic Model**:
```python
from pydantic import BaseModel

class UserContext(BaseModel):
    id: str           # User ID from JWT sub claim
    email: str | None # Email if available in token
```

**Usage**:
```python
@app.get("/api/tasks")
async def list_tasks(user: UserContext = Depends(get_current_user)):
    # user.id is the authenticated user's ID
    tasks = session.exec(
        select(Task).where(Task.user_id == user.id)
    ).all()
    return tasks
```

## Relationships

```
┌─────────────┐         ┌─────────────┐
│    User     │ 1───n   │    Task     │
├─────────────┤         ├─────────────┤
│ id (PK)     │────────>│ user_id (FK)│
│ email       │         │ id (PK)     │
│ created_at  │         │ title       │
└─────────────┘         │ description │
                        │ is_completed│
                        │ created_at  │
                        │ updated_at  │
                        └─────────────┘
```

**Relationship Details**:
- User has many Tasks (1:N)
- Task belongs to one User
- `Task.user_id` references `User.id`
- Ownership enforced at query level (not FK constraint for flexibility)

## State Transitions

### User Lifecycle

```
[Anonymous] ──signup──> [Registered] ──signin──> [Authenticated]
                              ^                        │
                              │                        │
                              └────────signout─────────┘
```

**States**:
- **Anonymous**: No user record, no token
- **Registered**: User record exists in Better Auth + backend
- **Authenticated**: Valid JWT token present in request

### Token Lifecycle

```
[None] ──signin──> [Valid] ──time passes──> [Expired]
                      │
                      ├──signout──> [Invalidated]*
                      │
                      └──tampered──> [Invalid]
```

*Note: Stateless JWT - "invalidated" means client discards token

## Validation Rules

### User Entity

| Rule | Implementation |
|------|----------------|
| Email format | Validated by Better Auth at signup |
| Email uniqueness | Database unique constraint |
| ID format | UUID string, max 36 characters |

### Token Validation

| Rule | Error Response |
|------|----------------|
| Missing Authorization header | 401 "Not authenticated" |
| Missing Bearer prefix | 401 "Invalid authentication credentials" |
| Invalid signature | 401 "Invalid token" |
| Expired token | 401 "Token expired" |
| Missing sub claim | 401 "Invalid token" |

## Migration Notes

### From Feature 001 (Todo API)

**Task Table Changes**: None required
- `user_id` field already exists as string
- No FK constraint needed (flexible user sync)

**New Table**: `users`
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_users_email ON users(email);
```

### Sync Strategy

When authenticated request arrives:
1. Extract `sub` (user ID) from JWT
2. Check if user exists in `users` table
3. If not, create user record with ID and email from token
4. Proceed with request using user ID for ownership

```python
async def get_current_user(payload: TokenPayload, session: Session):
    user = session.get(User, payload.sub)
    if not user:
        user = User(id=payload.sub, email=payload.email)
        session.add(user)
        session.commit()
    return UserContext(id=user.id, email=user.email)
```
