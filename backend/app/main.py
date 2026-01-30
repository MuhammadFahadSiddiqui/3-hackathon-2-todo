from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import create_db_and_tables
from app.routes import auth, tasks


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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization"],
)

app.include_router(tasks.router)
app.include_router(auth.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Todo Backend API is running"}
