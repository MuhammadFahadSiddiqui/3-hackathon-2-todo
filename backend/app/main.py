from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import create_db_and_tables
from app.routes import auth, tasks, auth_routes, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    create_db_and_tables()
    yield


app = FastAPI(
    title="Todo Backend API",
    description="RESTful API for multi-user task management",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS middleware configuration
settings = get_settings()

# Allow multiple origins (production + local development)
allowed_origins = [settings.frontend_url]
# Add localhost for development if not already included
if "localhost" not in settings.frontend_url:
    allowed_origins.extend([
        "http://localhost:3000",
        "http://localhost:3001"
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization"],
)

app.include_router(tasks.router)
app.include_router(auth.router)
app.include_router(auth_routes.router)
app.include_router(chat.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Todo Backend API is running"}
