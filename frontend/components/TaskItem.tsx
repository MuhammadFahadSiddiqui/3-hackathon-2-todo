"use client";

import { useState, useRef, useEffect } from "react";
import { Task } from "@/lib/api";

// T021: TaskItem component with TaskItemProps interface
interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onSave: (id: string, title: string) => Promise<void>;
  onCancel: () => void;
  onToggleStatus: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskItem({
  task,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onToggleStatus,
  onDelete,
}: TaskItemProps) {
  const [editTitle, setEditTitle] = useState(task.title);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit title when task changes or editing starts
  useEffect(() => {
    setEditTitle(task.title);
  }, [task.title, isEditing]);

  // T027: Handle save
  const handleSave = async () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle || trimmedTitle === task.title) {
      onCancel();
      return;
    }

    setSaving(true);
    try {
      await onSave(task.id, trimmedTitle);
    } catch {
      // T028: Error handling with rollback - parent handles error display
      setEditTitle(task.title);
    } finally {
      setSaving(false);
    }
  };

  // T025: Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditTitle(task.title);
      onCancel();
    }
  };

  // T026: Handle blur
  const handleBlur = () => {
    if (!saving) {
      handleSave();
    }
  };

  return (
    <li
      className={`group relative overflow-hidden rounded-xl border bg-[var(--card-bg)] shadow-sm transition-all duration-200 hover:shadow-md ${
        task.is_completed
          ? "border-[var(--success)]/30 bg-[var(--success)]/5"
          : "border-[var(--card-border)] hover:border-[var(--primary-yellow)]/30"
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Checkbox - now toggles status */}
        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            checked={task.is_completed}
            onChange={() => onToggleStatus(task.id)}
            className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-[var(--card-border)] bg-[var(--background)] transition-all checked:border-[var(--success)] checked:bg-[var(--success)] hover:border-[var(--primary-yellow)] focus-visible:ring-2 focus-visible:ring-[var(--primary-yellow)] focus-visible:ring-offset-2"
            aria-label={
              task.is_completed
                ? `Mark "${task.title}" as pending`
                : `Mark "${task.title}" as complete`
            }
          />
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title (display or edit mode) */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={saving}
            className="flex-1 rounded-lg border border-[var(--secondary-purple)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-purple)]"
            aria-label="Edit task title"
          />
        ) : (
          <span
            onClick={() => !task.is_completed && onEdit(task.id)}
            className={`flex-1 cursor-pointer truncate transition-colors ${
              task.is_completed
                ? "cursor-default text-[var(--muted)] line-through"
                : "text-[var(--foreground)] hover:text-[var(--secondary-purple)]"
            }`}
            role="button"
            tabIndex={task.is_completed ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !task.is_completed) {
                onEdit(task.id);
              }
            }}
            aria-label={`Edit "${task.title}"`}
          >
            {task.title}
          </span>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {!task.is_completed && !isEditing && (
            <button
              onClick={() => onEdit(task.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--secondary-purple)]/10 hover:text-[var(--secondary-purple)] focus-visible:ring-2 focus-visible:ring-[var(--secondary-purple)]"
              aria-label={`Edit "${task.title}"`}
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {/* Delete button */}
          <button
            onClick={() => onDelete(task.id)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--error)]/10 hover:text-[var(--error)] focus-visible:ring-2 focus-visible:ring-[var(--error)]"
            aria-label={`Delete "${task.title}"`}
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Completed indicator bar */}
      {task.is_completed && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[var(--success)] to-emerald-400" />
      )}
    </li>
  );
}
