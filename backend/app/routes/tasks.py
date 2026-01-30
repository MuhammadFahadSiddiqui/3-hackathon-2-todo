from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.auth import get_current_user, UserContext
from app.database import get_session
from app.models import Task
from app.schemas import TaskCreate, TaskUpdate, TaskResponse

# Updated router prefix: removed {user_id} - now derived from JWT token
router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Create a new task for the authenticated user."""
    task = Task(
        user_id=current_user.id,  # Use authenticated user ID from token
        title=task_data.title,
        description=task_data.description,
        is_completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.get("", response_model=List[TaskResponse])
def list_tasks(
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> List[Task]:
    """List all tasks for the authenticated user."""
    statement = select(Task).where(Task.user_id == current_user.id)
    tasks = session.exec(statement).all()
    return list(tasks)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Get a specific task by ID for the authenticated user."""
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == current_user.id
    )
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Update an existing task for the authenticated user."""
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == current_user.id
    )
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    task.title = task_data.title
    task.description = task_data.description
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> None:
    """Delete a task for the authenticated user."""
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == current_user.id
    )
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    session.delete(task)
    session.commit()


@router.patch("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Mark a task as completed for the authenticated user."""
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == current_user.id
    )
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    task.is_completed = True
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.patch("/{task_id}/toggle-status", response_model=TaskResponse)
def toggle_task_status(
    task_id: int,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Toggle task completion status for the authenticated user."""
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == current_user.id
    )
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    task.is_completed = not task.is_completed
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
