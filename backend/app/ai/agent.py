"""OpenAI Agent configuration for todo chatbot."""
import os
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI
from sqlmodel import Session
from app.ai.tools import TASK_TOOLS, execute_tool

# Initialize OpenAI client
client: Optional[OpenAI] = None


def get_client() -> OpenAI:
    """Get or create OpenAI client."""
    global client
    if client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        client = OpenAI(api_key=api_key)
    return client


MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

SYSTEM_PROMPT = """You are a helpful todo assistant. You help users manage their tasks through natural language conversation.

You can help users:
- Add new tasks to their list
- View their tasks (all, pending, or completed)
- Mark tasks as complete
- Update task titles or descriptions
- Delete tasks they no longer need

Guidelines:
1. Be concise and friendly in your responses
2. Always confirm actions you've taken
3. If a user's request is unclear, ask for clarification
4. When listing tasks, format them clearly with numbers
5. If a task is not found, suggest checking the task name or listing all tasks
6. When multiple tasks might match, ask the user to be more specific

Remember: You can only manage tasks for the authenticated user. Each user has their own private task list."""


async def process_with_agent(
    messages: List[Dict[str, str]],
    session: Session,
    user_id: str
) -> Dict[str, Any]:
    """
    Process messages with OpenAI agent and execute tool calls.

    Args:
        messages: Conversation history as list of {"role": str, "content": str}
        session: Database session for tool execution
        user_id: Authenticated user's ID for scoping operations

    Returns:
        Dict with 'content' (AI response) and optional 'tool_calls' info
    """
    openai_client = get_client()

    # Build full message list with system prompt
    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    # First API call - may include tool calls
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=full_messages,
        tools=TASK_TOOLS,
        tool_choice="auto"
    )

    message = response.choices[0].message
    tool_calls_info = []

    # If there are tool calls, execute them
    if message.tool_calls:
        # Add assistant message with tool calls to conversation
        full_messages.append({
            "role": "assistant",
            "content": message.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                }
                for tc in message.tool_calls
            ]
        })

        # Execute each tool call and add results
        for tool_call in message.tool_calls:
            tool_name = tool_call.function.name
            arguments = json.loads(tool_call.function.arguments)

            # Execute the tool
            result = execute_tool(session, user_id, tool_name, arguments)

            tool_calls_info.append({
                "name": tool_name,
                "arguments": arguments,
                "result": result
            })

            # Add tool result to messages
            full_messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result)
            })

        # Get final response after tool execution
        final_response = openai_client.chat.completions.create(
            model=MODEL,
            messages=full_messages,
            tools=TASK_TOOLS,
            tool_choice="auto"
        )

        final_message = final_response.choices[0].message
        return {
            "content": final_message.content or "",
            "tool_calls": tool_calls_info
        }

    # No tool calls - return direct response
    return {
        "content": message.content or "",
        "tool_calls": None
    }
