"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Task, tasksApi } from "@/lib/api";
import { useNotifications } from "./useNotifications";

const POLL_INTERVAL = 60000; // Check every 60 seconds

export interface UseRemindersReturn {
  reminders: Task[];
  notificationPermission: NotificationPermission | "default";
  enableNotifications: () => Promise<void>;
  dismissReminder: (taskId: number) => Promise<void>;
  dismissAllReminders: () => Promise<void>;
  refreshReminders: () => Promise<Task[]>;
}

/**
 * Hook for managing task reminders with browser notifications.
 * Polls for due reminders and shows system notifications.
 */
export function useReminders(): UseRemindersReturn {
  const [reminders, setReminders] = useState<Task[]>([]);
  const { permission, requestPermission, showNotification, isSupported } = useNotifications();
  const notifiedTasksRef = useRef<Set<number>>(new Set());
  const isPollingRef = useRef(false);

  /**
   * Fetch due reminders from the backend.
   */
  const fetchReminders = useCallback(async (): Promise<Task[]> => {
    try {
      const data = await tasksApi.getDueReminders();
      return data;
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
      return [];
    }
  }, []);

  /**
   * Refresh reminders and show notifications for new ones.
   */
  const refreshReminders = useCallback(async () => {
    const dueReminders = await fetchReminders();
    setReminders(dueReminders);

    // Show notifications for new reminders (not already notified in this session)
    if (permission === "granted") {
      for (const task of dueReminders) {
        if (!notifiedTasksRef.current.has(task.id)) {
          notifiedTasksRef.current.add(task.id);

          // Format deadline info
          let deadlineText = "";
          if (task.deadline_at) {
            const deadline = new Date(task.deadline_at);
            const now = new Date();
            if (deadline < now) {
              deadlineText = " (OVERDUE!)";
            } else {
              const diffMs = deadline.getTime() - now.getTime();
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              if (diffHours < 24) {
                deadlineText = ` (Due in ${diffHours}h)`;
              }
            }
          }

          showNotification({
            title: "Task Reminder",
            body: `${task.title}${deadlineText}`,
            tag: `reminder-${task.id}`,
            requireInteraction: true,
            data: { taskId: task.id },
          });
        }
      }
    }

    return dueReminders;
  }, [fetchReminders, permission, showNotification]);

  /**
   * Enable browser notifications.
   */
  const enableNotifications = useCallback(async () => {
    if (isSupported && permission !== "granted") {
      await requestPermission();
    }
  }, [isSupported, permission, requestPermission]);

  /**
   * Dismiss a single reminder.
   */
  const dismissReminder = useCallback(async (taskId: number) => {
    try {
      await tasksApi.acknowledgeReminder(taskId);
      setReminders((prev) => prev.filter((r) => r.id !== taskId));
      // Remove from notified set so it can notify again after interval
      notifiedTasksRef.current.delete(taskId);
    } catch (error) {
      console.error("Failed to dismiss reminder:", error);
    }
  }, []);

  /**
   * Dismiss all reminders.
   */
  const dismissAllReminders = useCallback(async () => {
    try {
      await Promise.all(reminders.map((r) => tasksApi.acknowledgeReminder(r.id)));
      setReminders([]);
      notifiedTasksRef.current.clear();
    } catch (error) {
      console.error("Failed to dismiss all reminders:", error);
    }
  }, [reminders]);

  // Start polling for reminders
  useEffect(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    // Initial fetch
    refreshReminders();

    // Poll every POLL_INTERVAL
    const interval = setInterval(() => {
      refreshReminders();
    }, POLL_INTERVAL);

    return () => {
      clearInterval(interval);
      isPollingRef.current = false;
    };
  }, [refreshReminders]);

  // Listen for visibility changes to refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Clear notified set when tab becomes visible so user sees fresh reminders
        refreshReminders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshReminders]);

  return {
    reminders,
    notificationPermission: permission,
    enableNotifications,
    dismissReminder,
    dismissAllReminders,
    refreshReminders,
  };
}
