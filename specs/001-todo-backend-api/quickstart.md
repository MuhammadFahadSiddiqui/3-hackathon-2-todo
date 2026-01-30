# Quickstart: Todo Backend API

**Feature Branch**: `001-todo-backend-api`
**Date**: 2026-01-10

## Prerequisites

- Python 3.11 or higher
- Access to a Neon PostgreSQL database
- `pip` package manager

## Setup

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your Neon database credentials:

```env
DATABASE_URL=postgresql://username:password@host.neon.tech:5432/dbname?sslmode=require
```

### 5. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## Verify Installation

### Health Check

```bash
curl http://localhost:8000/
```

Expected: Server responds (FastAPI default or custom health endpoint)

### API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI.

## Quick API Test

### Create a Task

```bash
curl -X POST "http://localhost:8000/api/user-123/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "My first task", "description": "Testing the API"}'
```

Expected Response (201 Created):
```json
{
  "id": 1,
  "user_id": "user-123",
  "title": "My first task",
  "description": "Testing the API",
  "is_completed": false,
  "created_at": "2026-01-10T12:00:00Z",
  "updated_at": "2026-01-10T12:00:00Z"
}
```

### List Tasks

```bash
curl "http://localhost:8000/api/user-123/tasks"
```

### Get Single Task

```bash
curl "http://localhost:8000/api/user-123/tasks/1"
```

### Update Task

```bash
curl -X PUT "http://localhost:8000/api/user-123/tasks/1" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated task title", "description": "New description"}'
```

### Complete Task

```bash
curl -X PATCH "http://localhost:8000/api/user-123/tasks/1/complete"
```

### Delete Task

```bash
curl -X DELETE "http://localhost:8000/api/user-123/tasks/1"
```

Expected: 204 No Content

## User Isolation Test

Verify tasks are isolated between users:

```bash
# Create task for user-a
curl -X POST "http://localhost:8000/api/user-a/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "User A task"}'

# Try to access from user-b (should return 404)
curl "http://localhost:8000/api/user-b/tasks/1"
```

Expected: 404 Not Found

## Troubleshooting

### Database Connection Error

```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution**: Verify DATABASE_URL in `.env` and ensure Neon database is accessible.

### SSL Required Error

```
SSL connection is required
```

**Solution**: Ensure `?sslmode=require` is in your DATABASE_URL.

### Module Not Found

```
ModuleNotFoundError: No module named 'app'
```

**Solution**: Run uvicorn from the `backend/` directory, not from project root.

## Development Workflow

1. Make changes to code
2. Server auto-reloads (with `--reload` flag)
3. Test via Swagger UI at `/docs`
4. Verify with curl commands above

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List all tasks |
| POST | `/api/{user_id}/tasks` | Create task |
| GET | `/api/{user_id}/tasks/{id}` | Get task |
| PUT | `/api/{user_id}/tasks/{id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Mark complete |

## Next Steps

After verification:
1. Run `/sp.tasks` to generate implementation tasks
2. Follow task list to implement features
3. Test each user story independently
