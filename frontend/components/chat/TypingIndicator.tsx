"use client";

/**
 * TypingIndicator component.
 * Shows animated dots while AI is processing.
 */
export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 px-4 py-3"
      aria-label="AI is typing"
      role="status"
    >
      <div className="flex items-center gap-1">
        <span
          className="h-2 w-2 rounded-full bg-[var(--muted)] animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1s" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-[var(--muted)] animate-bounce"
          style={{ animationDelay: "150ms", animationDuration: "1s" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-[var(--muted)] animate-bounce"
          style={{ animationDelay: "300ms", animationDuration: "1s" }}
        />
      </div>
      <span className="sr-only">AI is typing...</span>
    </div>
  );
}
