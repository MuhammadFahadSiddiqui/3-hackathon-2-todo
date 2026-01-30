"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { tasksApi, Task } from "@/lib/api";
import { TaskItem } from "@/components/TaskItem";
import { TaskSkeleton } from "@/components/TaskSkeleton";
import { TaskHistory } from "@/components/TaskHistory";
import { ErrorBanner, getErrorMessage } from "@/components/ErrorBanner";
import { addHistoryEntry } from "@/lib/task-history";

export default function TasksPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // T030: Task and editing state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // History refresh trigger
  const [historyRefresh, setHistoryRefresh] = useState(0);

  // Redirect unauthenticated users
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load tasks
  useEffect(() => {
    if (isAuthenticated === true) {
      loadTasks();
    }
  }, [isAuthenticated]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.list();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle) return;

    try {
      const task = await tasksApi.create({ title: trimmedTitle });
      setTasks([...tasks, task]);
      setNewTaskTitle("");
      setError(null);
      // Log to history
      addHistoryEntry("created", task.id, task.title);
      setHistoryRefresh((prev) => prev + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // T027: Handle task update (for inline editing)
  const handleSaveTask = async (id: number, title: string) => {
    const task = tasks.find((t) => t.id === id);
    try {
      const updated = await tasksApi.update(id, { title });
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
      setError(null);
      // Log to history
      addHistoryEntry("updated", id, title);
      setHistoryRefresh((prev) => prev + 1);
    } catch (err) {
      setError(getErrorMessage(err));
      throw err; // Re-throw for TaskItem to handle rollback
    }
  };

  // Toggle task status (pending ↔ completed)
  const handleToggleStatus = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      const updated = await tasksApi.toggleStatus(id);
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
      setError(null);
      // Log to history
      addHistoryEntry(
        updated.is_completed ? "completed" : "uncompleted",
        id,
        task.title
      );
      setHistoryRefresh((prev) => prev + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // T054: Delete with confirmation
  const handleDeleteTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!confirm("Delete this task?")) return;

    try {
      await tasksApi.delete(id);
      setTasks(tasks.filter((t) => t.id !== id));
      setError(null);
      // Log to history
      if (task) {
        addHistoryEntry("deleted", id, task.title);
        setHistoryRefresh((prev) => prev + 1);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Show loading while auth state is being determined
  if (authLoading || isAuthenticated === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-yellow)] border-t-transparent" />
          <span className="text-[var(--muted)]">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (isAuthenticated === false) {
    return null;
  }

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="relative overflow-hidden py-8 sm:py-12">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-10 h-64 w-64 rounded-full bg-[var(--primary-yellow)]/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-10 h-64 w-64 rounded-full bg-[var(--secondary-purple)]/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary-yellow)] to-[var(--primary-yellow-hover)] shadow-lg shadow-[var(--primary-yellow)]/25">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
            My Tasks
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Manage and organize your daily tasks
          </p>
        </div>

        {/* Stats Cards */}
        {tasks.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-yellow)]/10">
                  <svg
                    className="h-5 w-5 text-[var(--primary-yellow)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {pendingCount}
                  </p>
                  <p className="text-xs text-[var(--muted)]">Pending</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
                  <svg
                    className="h-5 w-5 text-[var(--success)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {completedCount}
                  </p>
                  <p className="text-xs text-[var(--muted)]">Completed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* T048: Error banner */}
        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Create task form */}
        <form
          onSubmit={handleCreateTask}
          className="mb-4 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-lg"
        >
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--secondary-purple)]/10">
              <svg
                className="h-5 w-5 text-[var(--secondary-purple)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <label htmlFor="newTask" className="sr-only">
              New task title
            </label>
            <input
              id="newTask"
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 bg-transparent px-2 py-2 text-[var(--foreground)] placeholder-[var(--muted-light)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="rounded-lg bg-gradient-to-r from-[var(--secondary-purple)] to-[var(--secondary-purple-hover)] px-5 py-2.5 font-semibold text-white shadow-md shadow-[var(--secondary-purple)]/25 transition-all hover:shadow-lg hover:shadow-[var(--secondary-purple)]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Task
            </button>
          </div>
        </form>

        {/* Search Bar */}
        {tasks.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2">
              <svg
                className="h-5 w-5 flex-shrink-0 text-[var(--muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <label htmlFor="searchTask" className="sr-only">
                Search tasks
              </label>
              <input
                id="searchTask"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="flex-1 bg-transparent py-1 text-[var(--foreground)] placeholder-[var(--muted-light)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="rounded-lg p-1 text-[var(--muted)] transition-colors hover:bg-[var(--card-border)] hover:text-[var(--foreground)]"
                  aria-label="Clear search"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* T017, T018: Show skeleton while loading */}
        {loading ? (
          <TaskSkeleton count={3} />
        ) : tasks.length === 0 ? (
          /* T019, T020: Empty state */
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-yellow)]/10">
              <svg
                className="h-8 w-8 text-[var(--primary-yellow)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-[var(--foreground)]">
              No tasks yet!
            </h3>
            <p className="mb-4 text-[var(--muted)]">
              Start by adding your first task above.
            </p>
            <p className="text-sm text-[var(--muted-light)]">
              Stay organized and boost your productivity
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          /* No search results */
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 text-center shadow-lg">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)]/10">
              <svg
                className="h-6 w-6 text-[var(--muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-[var(--foreground)]">
              No matching tasks
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Try a different search term
            </p>
          </div>
        ) : (
          /* T029, T031: Task list with TaskItem components */
          <ul className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isEditing={editingId === task.id}
                onEdit={(id) => setEditingId(id)}
                onSave={handleSaveTask}
                onCancel={() => setEditingId(null)}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTask}
              />
            ))}
          </ul>
        )}

        {/* Task History */}
        <TaskHistory refreshTrigger={historyRefresh} />
      </div>
    </div>
  );
}
