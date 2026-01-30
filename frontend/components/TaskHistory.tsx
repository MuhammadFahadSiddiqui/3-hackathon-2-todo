"use client";

import { useState, useEffect } from "react";
import {
  getHistory,
  clearHistory,
  formatTimestamp,
  getActionColor,
  getActionLabel,
  HistoryEntry,
} from "@/lib/task-history";

interface TaskHistoryProps {
  refreshTrigger?: number;
}

export function TaskHistory({ refreshTrigger }: TaskHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, [refreshTrigger]);

  const handleClear = () => {
    if (confirm("Clear all task history?")) {
      clearHistory();
      setEntries([]);
    }
  };

  return (
    <div className="mt-8">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 text-left shadow-sm transition-all hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--secondary-purple)]/10">
            <svg
              className="h-4 w-4 text-[var(--secondary-purple)]"
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
          <span className="font-medium text-[var(--foreground)]">
            Activity History
          </span>
          {entries.length > 0 && (
            <span className="rounded-full bg-[var(--secondary-purple)]/10 px-2 py-0.5 text-xs font-medium text-[var(--secondary-purple)]">
              {entries.length}
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-[var(--muted)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* History Panel */}
      {isOpen && (
        <div className="mt-2 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
          {entries.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-[var(--muted)]">No activity yet</p>
              <p className="mt-1 text-sm text-[var(--muted-light)]">
                Your task actions will appear here
              </p>
            </div>
          ) : (
            <>
              {/* Clear Button */}
              <div className="flex justify-end border-b border-[var(--card-border)] px-4 py-2">
                <button
                  onClick={handleClear}
                  className="rounded-lg px-3 py-1.5 text-sm text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
                >
                  Clear History
                </button>
              </div>

              {/* Entries */}
              <ul className="max-h-64 divide-y divide-[var(--card-border)] overflow-y-auto">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                        entry.action === "deleted"
                          ? "bg-[var(--error)]/10"
                          : entry.action === "completed"
                          ? "bg-[var(--success)]/10"
                          : entry.action === "created"
                          ? "bg-[var(--success)]/10"
                          : entry.action === "uncompleted"
                          ? "bg-[var(--primary-yellow)]/10"
                          : "bg-[var(--secondary-purple)]/10"
                      }`}
                    >
                      {entry.action === "created" && (
                        <svg
                          className="h-3.5 w-3.5 text-[var(--success)]"
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
                      )}
                      {entry.action === "updated" && (
                        <svg
                          className="h-3.5 w-3.5 text-[var(--secondary-purple)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      )}
                      {entry.action === "completed" && (
                        <svg
                          className="h-3.5 w-3.5 text-[var(--success)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {entry.action === "uncompleted" && (
                        <svg
                          className="h-3.5 w-3.5 text-[var(--primary-yellow)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      )}
                      {entry.action === "deleted" && (
                        <svg
                          className="h-3.5 w-3.5 text-[var(--error)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[var(--foreground)]">
                        <span className={`font-medium ${getActionColor(entry.action)}`}>
                          {getActionLabel(entry.action)}
                        </span>
                        {" "}
                        <span className="text-[var(--muted)]">&quot;{entry.taskTitle}&quot;</span>
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-[var(--muted-light)]">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
