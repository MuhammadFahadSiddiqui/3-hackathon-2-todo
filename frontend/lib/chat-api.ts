/**
 * Chat API client for AI-powered todo management.
 * Uses the same authenticated request pattern as the main API.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get the auth token from storage.
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Make an authenticated API request.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `API Error: ${response.status}`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // Response body not JSON, use status message
    }
    const error = new Error(message) as Error & { status: number };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Tool call information from AI response.
 */
export interface ToolCallInfo {
  name: string;
  arguments: Record<string, unknown>;
  result?: Record<string, unknown>;
}

/**
 * Chat response from the AI assistant.
 */
export interface ChatResponse {
  message: string;
  tool_calls?: ToolCallInfo[];
  conversation_id?: number;
}

/**
 * A single message in conversation history.
 */
export interface HistoryMessage {
  id: number;
  role: "user" | "assistant" | "tool";
  content: string;
  created_at: string;
}

/**
 * Full conversation history.
 */
export interface ConversationHistory {
  conversation_id: number;
  messages: HistoryMessage[];
}

/**
 * Chat API methods for AI-powered task management.
 */
export const chatApi = {
  /**
   * Send a chat message to the AI assistant.
   * @param message - Natural language message from the user
   * @returns AI response with optional tool call information
   */
  sendMessage: (message: string): Promise<ChatResponse> =>
    apiRequest<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  /**
   * Get conversation history.
   * @param limit - Maximum number of messages to return (default: 50)
   * @returns Conversation history with messages
   */
  getHistory: (limit = 50): Promise<ConversationHistory> =>
    apiRequest<ConversationHistory>(`/api/chat/history?limit=${limit}`),

  /**
   * Clear conversation history.
   */
  clearHistory: (): Promise<void> =>
    apiRequest<void>("/api/chat/clear", { method: "DELETE" }),
};
