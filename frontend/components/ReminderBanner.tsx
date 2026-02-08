"use client";

import { Task } from "@/lib/api";

interface ReminderBannerProps {
  reminders: Task[];
  onDismiss: (taskId: string) => void;
  onDismissAll: () => void;
  notificationPermission?: NotificationPermission | "default";
  onEnableNotifications?: () => void;
}

export function ReminderBanner({
  reminders,
  onDismiss,
  onDismissAll,
  notificationPermission = "default",
  onEnableNotifications,
}: ReminderBannerProps) {
  const showNotificationPrompt =
    notificationPermission === "default" && onEnableNotifications;

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return "Overdue!";
    } else if (diffHours < 1) {
      return "Due soon!";
    } else if (diffHours < 24) {
      return `Due in ${diffHours}h`;
    } else {
      return `Due in ${diffDays}d`;
    }
  };

  // Show notification permission prompt if needed (even without reminders)
  if (reminders.length === 0) {
    if (showNotificationPrompt) {
      return (
        <div className="mb-6 overflow-hidden rounded-xl border border-[var(--secondary-purple)]/30 bg-[var(--secondary-purple)]/10 shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="text-sm text-[var(--foreground)]">
                Enable notifications to receive task reminders
              </span>
            </div>
            <button
              onClick={onEnableNotifications}
              className="rounded-lg bg-[var(--secondary-purple)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--secondary-purple-hover)]"
            >
              Enable
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-[var(--primary-yellow)]/30 bg-[var(--primary-yellow)]/10 shadow-lg">
      <div className="flex items-center justify-between border-b border-[var(--primary-yellow)]/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-[var(--primary-yellow)] animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="font-semibold text-[var(--foreground)]">
            Task Reminders ({reminders.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showNotificationPrompt && (
            <button
              onClick={onEnableNotifications}
              className="rounded-lg bg-[var(--secondary-purple)] px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-[var(--secondary-purple-hover)]"
              title="Enable browser notifications"
            >
              Enable Alerts
            </button>
          )}
          {reminders.length > 1 && (
            <button
              onClick={onDismissAll}
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Dismiss all
            </button>
          )}
        </div>
      </div>
      <ul className="divide-y divide-[var(--primary-yellow)]/10">
        {reminders.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-[var(--foreground)]">
                {task.title}
              </p>
              {task.deadline_at && (
                <p
                  className={`text-sm ${
                    new Date(task.deadline_at) < new Date()
                      ? "text-[var(--error)] font-medium"
                      : "text-[var(--muted)]"
                  }`}
                >
                  {formatDeadline(task.deadline_at)}
                </p>
              )}
              {task.reminder_interval_minutes && (
                <p className="text-xs text-[var(--muted-light)]">
                  Recurring every{" "}
                  {task.reminder_interval_minutes >= 60
                    ? `${Math.floor(task.reminder_interval_minutes / 60)}h`
                    : `${task.reminder_interval_minutes}m`}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(task.id)}
              className="ml-4 rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--card-bg)] hover:text-[var(--foreground)]"
              aria-label="Dismiss reminder"
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
          </li>
        ))}
      </ul>
    </div>
  );
}
