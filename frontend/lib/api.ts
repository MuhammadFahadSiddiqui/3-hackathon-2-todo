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
    const error = new Error(`API Error: ${response.status}`) as Error & {
      status: number;
    };
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
export const tasksApi = {
  list: () => apiRequest<Task[]>("/api/tasks"),

  create: (data: { title: string; description?: string }) =>
    apiRequest<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: (id: number) => apiRequest<Task>(`/api/tasks/${id}`),

  update: (id: number, data: { title: string; description?: string }) =>
    apiRequest<Task>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/api/tasks/${id}`, {
      method: "DELETE",
    }),

  complete: (id: number) =>
    apiRequest<Task>(`/api/tasks/${id}/complete`, {
      method: "PATCH",
    }),

  toggleStatus: (id: number) =>
    apiRequest<Task>(`/api/tasks/${id}/toggle-status`, {
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
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}
