# Quickstart: Core Todo Backend API

**Feature**: 001-todo-backend-api
**Date**: 2026-01-09

## Prerequisites

- Python 3.11 or higher
- Access to Neon PostgreSQL database
- `DATABASE_URL` environment variable set

## Setup

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
.\venv\Scripts\activate   # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and set your Neon PostgreSQL connection string:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host/database?sslmode=require
```

### 5. Start the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## Verify Installation

### Health Check

```bash
curl http://localhost:8000/
```

Expected response:
```json
{"status": "healthy"}
```

### Create a Task

```bash
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My first task", "description": "Testing the API"}'
```

Expected response (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-123",
  "title": "My first task",
  "description": "Testing the API",
  "completed": false,
  "created_at": "2026-01-09T10:30:00Z",
  "completed_at": null
}
```

### List Tasks

```bash
curl http://localhost:8000/api/user-123/tasks
```

### Get Single Task

```bash
curl http://localhost:8000/api/user-123/tasks/{task_id}
```

### Update Task

```bash
curl -X PUT http://localhost:8000/api/user-123/tasks/{task_id} \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated title", "description": "Updated description"}'
```

### Complete Task

```bash
curl -X PATCH http://localhost:8000/api/user-123/tasks/{task_id}/complete
```

### Delete Task

```bash
curl -X DELETE http://localhost:8000/api/user-123/tasks/{task_id}
```

## API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Common Issues

### Database Connection Failed

```
Error: Connection to database failed
```

**Solution**: Verify `DATABASE_URL` in `.env` file:
- Check credentials are correct
- Ensure `?sslmode=require` is included for Neon
- Verify network connectivity to Neon

### Module Not Found

```
ModuleNotFoundError: No module named 'app'
```

**Solution**: Run from the `backend` directory, not from `app`:
```bash
cd backend
uvicorn app.main:app --reload
```

### Port Already in Use

```
Error: Address already in use
```

**Solution**: Use a different port:
```bash
uvicorn app.main:app --reload --port 8001
```

## Running Tests

```bash
# From backend directory
pytest tests/ -v
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app entry point
│   ├── config.py         # Environment configuration
│   ├── database.py       # Database connection
│   ├── models/
│   │   └── task.py       # SQLModel Task entity
│   ├── schemas/
│   │   └── task.py       # Request/Response schemas
│   └── routes/
│       └── tasks.py      # API endpoints
├── tests/
│   └── test_tasks.py     # API tests
├── requirements.txt
├── .env.example
└── README.md
```

## Next Steps

After verifying the backend works:

1. Run `/sp.tasks` to generate implementation tasks
2. Implement each task following the plan
3. Run tests to verify functionality
4. Proceed to frontend integration (separate feature)
