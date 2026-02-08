/**
 * API client for communicating with the backend.
 * Automatically attaches Authorization header with JWT token.
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
 * Task API methods
 */
export interface TaskCreateData {
  title: string;
  description?: string;
  deadline_at?: string;
  reminder_interval_minutes?: number;
}

export interface TaskUpdateData {
  title: string;
  description?: string;
  deadline_at?: string | null;
  reminder_interval_minutes?: number | null;
}

export const tasksApi = {
  list: () => apiRequest<Task[]>("/api/tasks"),

  create: (data: TaskCreateData) =>
    apiRequest<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: (id: string) => apiRequest<Task>(`/api/tasks/${id}`),

  update: (id: string, data: TaskUpdateData) =>
    apiRequest<Task>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/api/tasks/${id}`, {
      method: "DELETE",
    }),

  complete: (id: string) =>
    apiRequest<Task>(`/api/tasks/${id}/complete`, {
      method: "PATCH",
    }),

  toggleStatus: (id: string) =>
    apiRequest<Task>(`/api/tasks/${id}/toggle-status`, {
      method: "PATCH",
    }),

  getDueReminders: () => apiRequest<Task[]>("/api/tasks/due-reminders"),

  acknowledgeReminder: (id: string) =>
    apiRequest<Task>(`/api/tasks/${id}/acknowledge-reminder`, {
      method: "PATCH",
    }),
};

/**
 * Auth API methods
 */
export const authApi = {
  me: () => apiRequest<User>("/api/me"),
};

// Type definitions
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  deadline_at: string | null;
  reminder_interval_minutes: number | null;
  last_reminded_at: string | null;
}

export interface User {
  id: string;
  email: string;
}
