"use client";

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const DEFAULT_MAX_LENGTH = 2000;

/**
 * ChatInput component.
 * Text input with send button for chat messages.
 */
export function ChatInput({
  onSend,
  isLoading,
  disabled = false,
  placeholder = "Type a message...",
  maxLength = DEFAULT_MAX_LENGTH,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmedValue = value.trim();
  const isOverLimit = value.length > maxLength;
  const canSend = trimmedValue.length > 0 && !isLoading && !disabled && !isOverLimit;
  const showCharCount = value.length > maxLength * 0.8;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      // Max 4 lines (approximately 96px)
      textarea.style.height = `${Math.min(scrollHeight, 96)}px`;
    }
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canSend) {
      onSend(trimmedValue);
      setValue("");
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSend(trimmedValue);
        setValue("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-[var(--card-border)] p-3">
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            rows={1}
            className={`w-full resize-none rounded-lg border bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-light)] focus:outline-none focus:ring-2 transition-colors ${
              isOverLimit
                ? "border-[var(--error)] focus:ring-[var(--error)]/50"
                : "border-[var(--card-border)] focus:ring-[var(--primary-yellow)]/50 focus:border-[var(--primary-yellow)]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Chat message"
            aria-invalid={isOverLimit}
          />
          {showCharCount && (
            <span
              className={`absolute bottom-1 right-2 text-xs ${
                isOverLimit ? "text-[var(--error)]" : "text-[var(--muted)]"
              }`}
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={!canSend}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[var(--secondary-purple)] to-[var(--secondary-purple-hover)] text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          aria-label="Send message"
        >
          {isLoading ? (
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
      {isOverLimit && (
        <p className="mt-1 text-xs text-[var(--error)]">
          Message is too long (max {maxLength} characters)
        </p>
      )}
    </form>
  );
}
