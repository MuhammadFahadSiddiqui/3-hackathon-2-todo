"""MCP Tool definitions for task CRUD operations."""
from typing import Dict, Any, Optional
from sqlmodel import Session, select
from app.models.task import Task
from datetime import datetime


# OpenAI-compatible tool definitions
TASK_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user. Use this when the user wants to add, create, or make a new task or todo item.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title or name of the task"
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional detailed description of the task"
                    }
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "Get the user's tasks. Use this when the user wants to see, view, list, or check their tasks or todos.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "description": "Filter tasks by status. 'pending' for incomplete tasks, 'completed' for done tasks, 'all' for everything."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as completed/done. Use this when the user wants to complete, finish, mark done, or check off a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The ID of the task to complete"
                    },
                    "title_search": {
                        "type": "string",
                        "description": "Search for task by title if ID is not known"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update a task's title or description. Use this when the user wants to rename, change, edit, or modify a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The ID of the task to update"
                    },
                    "title_search": {
                        "type": "string",
                        "description": "Search for task by title if ID is not known"
                    },
                    "new_title": {
                        "type": "string",
                        "description": "The new title for the task"
                    },
                    "new_description": {
                        "type": "string",
                        "description": "The new description for the task"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete/remove a task permanently. Use this when the user wants to delete, remove, or get rid of a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The ID of the task to delete"
                    },
                    "title_search": {
                        "type": "string",
                        "description": "Search for task by title if ID is not known"
                    }
                },
                "required": []
            }
        }
    }
]


def find_task_by_title(session: Session, user_id: str, title_search: str) -> Optional[Task]:
    """Find a task by partial title match."""
    statement = select(Task).where(
        Task.user_id == user_id,
        Task.title.ilike(f"%{title_search}%")
    )
    return session.exec(statement).first()


def execute_add_task(
    session: Session,
    user_id: str,
    title: str,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """Create a new task."""
    task = Task(
        user_id=user_id,
        title=title,
        description=description or ""
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return {
        "success": True,
        "task": {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "is_completed": task.is_completed
        }
    }


def execute_list_tasks(
    session: Session,
    user_id: str,
    status: str = "all"
) -> Dict[str, Any]:
    """Get user's tasks filtered by status."""
    statement = select(Task).where(Task.user_id == user_id)

    if status == "pending":
        statement = statement.where(Task.is_completed == False)
    elif status == "completed":
        statement = statement.where(Task.is_completed == True)

    statement = statement.order_by(Task.created_at.desc())
    tasks = session.exec(statement).all()

    return {
        "success": True,
        "count": len(tasks),
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "is_completed": t.is_completed
            }
            for t in tasks
        ]
    }


def execute_complete_task(
    session: Session,
    user_id: str,
    task_id: Optional[int] = None,
    title_search: Optional[str] = None
) -> Dict[str, Any]:
    """Mark a task as completed."""
    task = None

    if task_id:
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = session.exec(statement).first()
    elif title_search:
        task = find_task_by_title(session, user_id, title_search)

    if not task:
        return {"success": False, "error": "Task not found"}

    if task.is_completed:
        return {"success": False, "error": "Task is already completed"}

    task.is_completed = True
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)

    return {
        "success": True,
        "task": {
            "id": task.id,
            "title": task.title,
            "is_completed": task.is_completed
        }
    }


def execute_update_task(
    session: Session,
    user_id: str,
    task_id: Optional[int] = None,
    title_search: Optional[str] = None,
    new_title: Optional[str] = None,
    new_description: Optional[str] = None
) -> Dict[str, Any]:
    """Update a task's title or description."""
    task = None

    if task_id:
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = session.exec(statement).first()
    elif title_search:
        task = find_task_by_title(session, user_id, title_search)

    if not task:
        return {"success": False, "error": "Task not found"}

    if new_title:
        task.title = new_title
    if new_description is not None:
        task.description = new_description

    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)

    return {
        "success": True,
        "task": {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "is_completed": task.is_completed
        }
    }


def execute_delete_task(
    session: Session,
    user_id: str,
    task_id: Optional[int] = None,
    title_search: Optional[str] = None
) -> Dict[str, Any]:
    """Delete a task."""
    task = None

    if task_id:
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = session.exec(statement).first()
    elif title_search:
        task = find_task_by_title(session, user_id, title_search)

    if not task:
        return {"success": False, "error": "Task not found"}

    deleted_title = task.title
    session.delete(task)
    session.commit()

    return {
        "success": True,
        "deleted_task": {
            "id": task.id,
            "title": deleted_title
        }
    }


def execute_tool(
    session: Session,
    user_id: str,
    tool_name: str,
    arguments: Dict[str, Any]
) -> Dict[str, Any]:
    """Execute a tool by name with given arguments."""
    tool_executors = {
        "add_task": execute_add_task,
        "list_tasks": execute_list_tasks,
        "complete_task": execute_complete_task,
        "update_task": execute_update_task,
        "delete_task": execute_delete_task
    }

    executor = tool_executors.get(tool_name)
    if not executor:
        return {"success": False, "error": f"Unknown tool: {tool_name}"}

    try:
        return executor(session, user_id, **arguments)
    except Exception as e:
        return {"success": False, "error": str(e)}
