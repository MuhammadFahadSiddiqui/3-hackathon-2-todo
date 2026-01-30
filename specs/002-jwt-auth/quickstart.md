# Quickstart: Authentication & JWT-Based API Security

**Feature**: 002-jwt-auth
**Date**: 2026-01-10

## Prerequisites

- Python 3.11+ installed
- Node.js 18+ installed
- Neon PostgreSQL database (from Feature 001)
- Backend from Feature 001 running

## Backend Setup

### 1. Install New Dependencies

```bash
cd backend
pip install pyjwt[crypto] httpx
```

Or update requirements.txt and reinstall:
```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Add to `backend/.env`:
```bash
# Existing
DATABASE_URL=postgresql://...

# New for Feature 002
BETTER_AUTH_JWKS_URL=http://localhost:3000/api/auth/jwks
BETTER_AUTH_ISSUER=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### 3. Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

## Frontend Setup

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
cd frontend
```

### 2. Install Better Auth

```bash
npm install better-auth
```

### 3. Configure Better Auth

Create `frontend/src/lib/auth.ts`:
```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    // Use your database connection
  },
  plugins: [
    jwt({
      expiresIn: "7d",
    }),
  ],
});
```

### 4. Create Auth API Route

Create `frontend/src/app/api/auth/[...all]/route.ts`:
```typescript
import { auth } from "@/lib/auth";

export const { GET, POST } = auth.handler;
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

## Testing Authentication Flow

### 1. Signup (via Better Auth)

```bash
# POST to Better Auth signup endpoint
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 2. Signin (get JWT token)

```bash
# POST to Better Auth signin endpoint
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Response includes JWT token
```

### 3. Test Protected Endpoint (with token)

```bash
# Replace <token> with JWT from signin response
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <token>"

# Expected: 200 OK with empty array []
```

### 4. Test Without Token (should fail)

```bash
curl http://localhost:8000/api/tasks

# Expected: 401 Unauthorized
# {"detail": "Not authenticated"}
```

### 5. Create Task (authenticated)

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "My first authenticated task"}'

# Expected: 201 Created with task JSON
```

### 6. Verify User Isolation

```bash
# Create second user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@example.com", "password": "password123"}'

# Get second user's token
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@example.com", "password": "password123"}'

# Try to access first user's task with second user's token
curl http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer <user2_token>"

# Expected: 404 Not Found (task belongs to user1)
```

### 7. Test Expired Token

```bash
# Use a manually crafted expired token or wait for expiration
# Then try to access protected endpoint

curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <expired_token>"

# Expected: 401 Unauthorized
# {"detail": "Token expired"}
```

## Verification Checklist

| Test | Expected Result | Status |
|------|-----------------|--------|
| Signup creates account | 201 Created | [ ] |
| Signin returns JWT | Token in response | [ ] |
| Protected endpoint without token | 401 Unauthorized | [ ] |
| Protected endpoint with valid token | 200 OK | [ ] |
| Create task with token | 201 Created | [ ] |
| List tasks returns only user's tasks | User-filtered list | [ ] |
| Access other user's task | 404 Not Found | [ ] |
| Expired token rejected | 401 Unauthorized | [ ] |
| Invalid token rejected | 401 Unauthorized | [ ] |

## Common Issues

### "Not authenticated" on all requests

- Check Authorization header format: `Bearer <token>` (with space)
- Verify token is not expired
- Check JWKS URL is accessible from backend

### CORS errors in browser

- Verify `FRONTEND_URL` in backend .env matches frontend origin
- Check CORS middleware is configured in main.py

### "Invalid token" errors

- Verify JWKS endpoint is accessible: `curl http://localhost:3000/api/auth/jwks`
- Check algorithm matches (EdDSA)
- Verify issuer/audience if validating those claims

### Database sync issues

- User table should be created automatically on first request
- Check database connection is working
- Verify migrations ran successfully

## Next Steps

After verification:
1. Implement frontend UI components (login/signup forms)
2. Add token refresh handling
3. Implement protected route layouts
4. Add loading states for auth checks
