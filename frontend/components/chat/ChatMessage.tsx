"use client";

import { useState } from "react";
import { Message } from "@/hooks/useChat";

interface ChatMessageProps {
  message: Message;
}

/**
 * Format timestamp for display.
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * ChatMessage component.
 * Renders a single chat message with role-based styling.
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const [showToolCalls, setShowToolCalls] = useState(false);
  const isUser = message.role === "user";
  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
      role="article"
      aria-label={`${isUser ? "You" : "AI Assistant"}: ${message.content}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? "rounded-br-sm bg-gradient-to-r from-[var(--secondary-purple)] to-[var(--secondary-purple-hover)] text-white"
            : "rounded-bl-sm border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)]"
        } ${
          message.status === "sending"
            ? "opacity-60"
            : message.status === "error"
            ? "ring-2 ring-[var(--error)]"
            : ""
        } transition-opacity`}
      >
        {/* Message content */}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </p>

        {/* Timestamp and status */}
        <div
          className={`mt-1 flex items-center gap-2 text-xs ${
            isUser ? "text-white/70" : "text-[var(--muted)]"
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>
          {message.status === "sending" && (
            <span className="flex items-center gap-1">
              <svg
                className="h-3 w-3 animate-spin"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Sending...
            </span>
          )}
          {message.status === "error" && (
            <span className="text-[var(--error)]">Failed to send</span>
          )}
        </div>

        {/* Tool calls for assistant messages */}
        {hasToolCalls && (
          <div className="mt-2 border-t border-[var(--card-border)] pt-2">
            <button
              onClick={() => setShowToolCalls(!showToolCalls)}
              className="flex items-center gap-1 text-xs text-[var(--primary-yellow)] hover:underline"
            >
              <svg
                className={`h-3 w-3 transition-transform ${
                  showToolCalls ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {message.toolCalls!.length} action
              {message.toolCalls!.length > 1 ? "s" : ""} performed
            </button>
            {showToolCalls && (
              <div className="mt-2 space-y-2">
                {message.toolCalls!.map((tool, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-[var(--background)] p-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[var(--primary-yellow)]/20 px-1.5 py-0.5 font-mono text-[var(--primary-yellow)]">
                        {tool.name}
                      </span>
                    </div>
                    {tool.arguments && Object.keys(tool.arguments).length > 0 && (
                      <div className="mt-1 text-[var(--muted)]">
                        {Object.entries(tool.arguments).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span>{" "}
                            {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                    {tool.result && (
                      <div className="mt-1 text-[var(--success)]">
                        Result:{" "}
                        {typeof tool.result === "object"
                          ? JSON.stringify(tool.result)
                          : String(tool.result)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
