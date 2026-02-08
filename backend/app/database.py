from typing import Generator
from sqlmodel import Session, create_engine, SQLModel
from app.config import get_settings

# Import models to ensure they are registered with SQLModel metadata
from app.models.task import Task  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.conversation import Conversation  # noqa: F401
from app.models.message import Message  # noqa: F401

settings = get_settings()

engine = create_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
)


def get_session() -> Generator[Session, None, None]:
    """Dependency that provides a database session."""
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)
