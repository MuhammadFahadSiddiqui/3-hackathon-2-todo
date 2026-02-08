from datetime import datetime, timedelta
from typing import List
from uuid import UUID
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
    # Check for duplicate title for the same user
    existing_task = session.exec(
        select(Task).where(
            Task.user_id == UUID(current_user.id),
            Task.title == task_data.title
        )
    ).first()
    if existing_task:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A task with the title '{task_data.title}' already exists",
        )

    task = Task(
        user_id=UUID(current_user.id),  # Use authenticated user ID from token
        title=task_data.title,
        description=task_data.description,
        is_completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        deadline_at=task_data.deadline_at,
        reminder_interval_minutes=task_data.reminder_interval_minutes,
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
    statement = select(Task).where(Task.user_id == UUID(current_user.id))
    tasks = session.exec(statement).all()
    return list(tasks)


@router.get("/due-reminders", response_model=List[TaskResponse])
def get_due_reminders(
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> List[Task]:
    """Get pending tasks that need reminders shown."""
    now = datetime.utcnow()

    # Get pending tasks with reminder settings
    statement = select(Task).where(
        Task.user_id == UUID(current_user.id),
        Task.is_completed == False,
        Task.reminder_interval_minutes != None,
    )
    tasks = session.exec(statement).all()

    due_tasks = []
    for task in tasks:
        # Check if reminder is due based on interval
        if task.last_reminded_at is None:
            # Never shown, show if task has been created
            due_tasks.append(task)
        else:
            # Check if enough time has passed since last reminder
            next_reminder_time = task.last_reminded_at + timedelta(
                minutes=task.reminder_interval_minutes
            )
            if now >= next_reminder_time:
                due_tasks.append(task)

    return due_tasks


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: UUID,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Get a specific task by ID for the authenticated user."""
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == UUID(current_user.id)
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
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Update an existing task for the authenticated user."""
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == UUID(current_user.id)
    )
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    task.title = task_data.title
    task.description = task_data.description
    task.deadline_at = task_data.deadline_at
    task.reminder_interval_minutes = task_data.reminder_interval_minutes
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> None:
    """Delete a task for the authenticated user."""
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == UUID(current_user.id)
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
    task_id: UUID,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Mark a task as completed for the authenticated user."""
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == UUID(current_user.id)
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
    task_id: UUID,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Toggle task completion status for the authenticated user."""
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == UUID(current_user.id)
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


@router.patch("/{task_id}/acknowledge-reminder", response_model=TaskResponse)
def acknowledge_reminder(
    task_id: UUID,
    current_user: UserContext = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Mark a task's reminder as acknowledged to prevent spamming."""
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == UUID(current_user.id)
    )
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    task.last_reminded_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
