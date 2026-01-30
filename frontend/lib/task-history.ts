/**
 * Lightweight task history service using localStorage.
 * Stores create, update, and delete events for the current user.
 */

export type HistoryAction = "created" | "updated" | "completed" | "uncompleted" | "deleted";

export interface HistoryEntry {
  id: string;
  action: HistoryAction;
  taskId: number;
  taskTitle: string;
  timestamp: string;
}

const HISTORY_KEY = "task_history";
const MAX_ENTRIES = 50;

/**
 * Get history entries for the current user from localStorage.
 */
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Add a new history entry.
 */
export function addHistoryEntry(
  action: HistoryAction,
  taskId: number,
  taskTitle: string
): void {
  if (typeof window === "undefined") return;

  const entries = getHistory();
  const newEntry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action,
    taskId,
    taskTitle,
    timestamp: new Date().toISOString(),
  };

  // Add new entry at the beginning and limit to MAX_ENTRIES
  const updatedEntries = [newEntry, ...entries].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedEntries));
  } catch {
    // Handle storage quota exceeded
    console.warn("Failed to save history entry");
  }
}

/**
 * Clear all history entries.
 */
export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Format timestamp for display.
 */
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Get action color class for styling.
 */
export function getActionColor(action: HistoryAction): string {
  switch (action) {
    case "created":
      return "text-[var(--success)]";
    case "updated":
      return "text-[var(--secondary-purple)]";
    case "completed":
      return "text-[var(--success)]";
    case "uncompleted":
      return "text-[var(--primary-yellow)]";
    case "deleted":
      return "text-[var(--error)]";
    default:
      return "text-[var(--muted)]";
  }
}

/**
 * Get action icon for display.
 */
export function getActionLabel(action: HistoryAction): string {
  switch (action) {
    case "created":
      return "Created";
    case "updated":
      return "Updated";
    case "completed":
      return "Completed";
    case "uncompleted":
      return "Reopened";
    case "deleted":
      return "Deleted";
    default:
      return action;
  }
}
