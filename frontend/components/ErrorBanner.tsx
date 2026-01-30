"use client";

import { useEffect } from "react";

// T044-T047: ErrorBanner component with auto-dismiss
interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export function ErrorBanner({
  message,
  onDismiss,
  autoDismissMs = 5000,
}: ErrorBannerProps) {
  useEffect(() => {
    if (autoDismissMs > 0 && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--error)]/20">
          <svg
            className="h-4 w-4 text-[var(--error)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span className="text-sm font-medium text-[var(--error)]">
          {message}
        </span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[var(--error)] transition-colors hover:bg-[var(--error)]/20 focus-visible:ring-2 focus-visible:ring-[var(--error)]"
          aria-label="Dismiss error"
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
  );
}

// T049-T053: Error message mapping
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const apiError = error as Error & { status?: number };

    if (apiError.status === 401) {
      return "Session expired. Please sign in again.";
    }
    if (apiError.status === 404) {
      return "Task not found. It may have been deleted.";
    }
    if (apiError.status === 500) {
      return "Something went wrong. Please try again.";
    }
    if (apiError.message.includes("fetch") || apiError.message.includes("network")) {
      return "Unable to connect. Check your internet.";
    }
  }
  return "Something went wrong. Please try again.";
}
