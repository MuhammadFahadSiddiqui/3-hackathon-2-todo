# Quickstart: Frontend Todo Application

**Feature**: 003-todo-frontend
**Prerequisites**: Feature 002 (JWT Auth) complete and running

## Development Setup

### 1. Start Backend (if not running)

```bash
cd backend
source venv/bin/activate  # or create: python -m venv venv
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Start Frontend

```bash
cd frontend
npm install  # if needed
npm run dev
```

Frontend runs at: http://localhost:3000
Backend API at: http://localhost:8000

### 3. Environment Variables

Ensure `frontend/.env.local` exists:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

---

## Testing Flows

### Flow 1: Route Protection (US1)

```bash
# Test 1: Unauthenticated access to /tasks
1. Open browser, clear localStorage
2. Navigate to http://localhost:3000/tasks
3. Expected: Redirect to /login

# Test 2: Authenticated redirect from /login
1. Sign in successfully
2. Manually navigate to /login
3. Expected: Redirect to /tasks
```

### Flow 2: Task Dashboard (US2)

```bash
# Test 1: Loading state
1. Sign in and go to /tasks
2. Open DevTools Network, set throttling to "Slow 3G"
3. Refresh page
4. Expected: Skeleton loading UI visible before tasks appear

# Test 2: Create task
1. Type "Test Task" in the input
2. Click "Add" or press Enter
3. Expected: Task appears immediately in list

# Test 3: Complete task
1. Click checkbox on an incomplete task
2. Expected: Task shows completed state (strikethrough)

# Test 4: Delete task
1. Click "Delete" on a task
2. Expected: Confirmation dialog appears
3. Confirm deletion
4. Expected: Task removed from list
```

### Flow 3: Task Editing (US3)

```bash
# Test 1: Enter edit mode
1. Click on a task title
2. Expected: Title becomes editable input

# Test 2: Save edit
1. Change the title text
2. Press Enter or click outside
3. Expected: Title updates, edit mode closes

# Test 3: Cancel edit
1. Enter edit mode
2. Press Escape
3. Expected: Original title restored, edit mode closes
```

### Flow 4: User Profile (US4)

```bash
# Test 1: Email display
1. Sign in with test@example.com
2. Look at header area
3. Expected: "test@example.com" visible

# Test 2: Sign out
1. Click "Sign Out" button
2. Expected: Redirect to /login, localStorage cleared
```

### Flow 5: Mobile Responsive (US5)

```bash
# Test 1: Mobile viewport
1. Open DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (e.g., iPhone SE)
4. Navigate through app
5. Expected: All elements readable and tappable

# Test 2: Touch targets
1. On mobile viewport, check button sizes
2. Expected: All buttons at least 44x44px tap area
```

### Flow 6: Error Handling (US6)

```bash
# Test 1: Network failure
1. Open DevTools → Network → Offline
2. Try to create a task
3. Expected: Error message displayed

# Test 2: Session expiration
1. Sign in
2. Clear localStorage manually (DevTools → Application → Local Storage)
3. Try to create a task
4. Expected: Redirect to /login
```

---

## Verification Checklist

Run through each item before marking feature complete:

### Route Protection
- [ ] Direct /tasks access redirects to /login (unauthenticated)
- [ ] /login redirects to /tasks (authenticated)
- [ ] /signup redirects to /tasks (authenticated)
- [ ] Page refresh maintains auth state

### Task Dashboard
- [ ] Loading skeleton shows during fetch
- [ ] Tasks display correctly
- [ ] Create task works
- [ ] Complete task works
- [ ] Delete task shows confirmation
- [ ] Empty state shows when no tasks

### Task Editing
- [ ] Click title enters edit mode
- [ ] Enter saves edit
- [ ] Escape cancels edit
- [ ] Edit failures show error

### User Profile
- [ ] Email shown in header
- [ ] Sign out works

### Responsive
- [ ] Works at 320px width
- [ ] Touch targets are adequate

### Error Handling
- [ ] Network errors show message
- [ ] 401 redirects to login

---

## Common Issues

### Issue: Redirect loop between /login and /tasks

**Cause**: Token exists but is invalid
**Fix**: Clear localStorage and try again

```javascript
localStorage.clear();
location.reload();
```

### Issue: CORS errors

**Cause**: Backend CORS not configured for frontend URL
**Fix**: Verify `FRONTEND_URL` in backend `.env` matches frontend origin

### Issue: Tasks not loading

**Cause**: API URL misconfigured or backend not running
**Fix**: Check `NEXT_PUBLIC_API_URL` in `.env.local` and verify backend is running

---

## Demo Script

For hackathon demo:

1. **Start fresh**: Clear browser data, show login page
2. **Sign up**: Create account with email/password
3. **First task**: Add "Prepare presentation"
4. **More tasks**: Add 2-3 more tasks quickly
5. **Complete**: Check off one task
6. **Edit**: Click to edit a task title
7. **Delete**: Remove a task (show confirmation)
8. **Mobile**: Toggle to mobile view, show responsiveness
9. **Sign out**: Click sign out, show redirect to login
10. **User isolation**: Sign in as different user, show empty task list

Total demo time: ~2 minutes
