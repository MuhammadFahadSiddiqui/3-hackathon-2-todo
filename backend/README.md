# Todo Backend API

RESTful API backend for a multi-user todo application built with FastAPI, SQLModel, and Neon PostgreSQL.

## Features

- Create, read, update, and delete tasks
- Mark tasks as complete
- User-scoped data isolation (tasks are isolated per user)
- Async database operations with PostgreSQL

## Prerequisites

- Python 3.11+
- Neon PostgreSQL database account
- pip (Python package manager)

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

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/{user_id}/tasks` | List all tasks for user |
| POST | `/api/{user_id}/tasks` | Create a new task |
| GET | `/api/{user_id}/tasks/{task_id}` | Get a single task |
| PUT | `/api/{user_id}/tasks/{task_id}` | Update a task |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete a task |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | Mark task complete |

## Usage Examples

### Health Check

```bash
curl http://localhost:8000/
```

### Create a Task

```bash
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
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
  -d '{"title": "Buy groceries from Costco", "description": "Updated list"}'
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

When the server is running:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # Database connection management
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py          # Task SQLModel entity
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py          # Pydantic request/response schemas
│   └── routes/
│       ├── __init__.py
│       └── tasks.py         # Task CRUD endpoints
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

## Error Responses

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 404 | Task not found |
| 422 | Validation error |
| 503 | Database unavailable |

## License

MIT
