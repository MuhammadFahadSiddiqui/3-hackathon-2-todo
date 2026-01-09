"""Database engine and session management for async PostgreSQL."""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import SQLModel
from fastapi import HTTPException, status

from app.config import get_settings


class DatabaseConnectionError(Exception):
    """Raised when database connection fails."""
    pass

# Create async engine - will be initialized on first use
_engine = None


def get_engine():
    """Get or create the async database engine."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.async_database_url,
            echo=False,
            future=True,
        )
    return _engine


# Async session factory
def get_session_factory():
    """Get async session factory."""
    return sessionmaker(
        get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
    )


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an async database session."""
    try:
        async_session = get_session_factory()
        async with async_session() as session:
            try:
                yield session
            finally:
                await session.close()
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable",
        ) from e


async def create_db_and_tables():
    """Create all database tables."""
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def close_db_connection():
    """Close the database connection."""
    global _engine
    if _engine is not None:
        await _engine.dispose()
        _engine = None
