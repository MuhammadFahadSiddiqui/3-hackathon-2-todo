"""Task CRUD API endpoints."""

from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_session
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["Tasks"])


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    session: AsyncSession = Depends(get_session),
) -> Task:
    """Create a new task for the specified user."""
    task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task


@router.get(
    "",
    response_model=List[TaskResponse],
    summary="List all tasks for a user",
)
async def list_tasks(
    user_id: str,
    session: AsyncSession = Depends(get_session),
) -> List[Task]:
    """Return all tasks belonging to the specified user."""
    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    result = await session.execute(statement)
    tasks = result.scalars().all()
    return list(tasks)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get a single task",
)
async def get_task(
    user_id: str,
    task_id: str,
    session: AsyncSession = Depends(get_session),
) -> Task:
    """Return a specific task by ID for the specified user."""
    statement = select(Task).where(Task.user_id == user_id, Task.id == task_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
)
async def update_task(
    user_id: str,
    task_id: str,
    task_data: TaskUpdate,
    session: AsyncSession = Depends(get_session),
) -> Task:
    """Update an existing task's title and/or description."""
    statement = select(Task).where(Task.user_id == user_id, Task.id == task_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    task.title = task_data.title
    task.description = task_data.description
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
)
async def delete_task(
    user_id: str,
    task_id: str,
    session: AsyncSession = Depends(get_session),
) -> None:
    """Permanently remove a task."""
    statement = select(Task).where(Task.user_id == user_id, Task.id == task_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    await session.delete(task)
    await session.commit()


@router.patch(
    "/{task_id}/complete",
    response_model=TaskResponse,
    summary="Mark task as complete",
)
async def complete_task(
    user_id: str,
    task_id: str,
    session: AsyncSession = Depends(get_session),
) -> Task:
    """
    Set the task's completed status to true and record the completion timestamp.
    This operation is idempotent - calling it on an already completed task returns 200 OK.
    """
    statement = select(Task).where(Task.user_id == user_id, Task.id == task_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    # Only update if not already completed (idempotent)
    if not task.completed:
        task.completed = True
        task.completed_at = datetime.utcnow()
        session.add(task)
        await session.commit()
        await session.refresh(task)
    return task
