"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";

interface ChatPanelProps {
  onTaskListRefresh?: () => void;
  className?: string;
}

/**
 * ChatPanel component.
 * Main chat container with toggle button, message list, and input.
 */
export function ChatPanel({ onTaskListRefresh, className = "" }: ChatPanelProps) {
  const {
    messages,
    isLoading,
    error,
    isPanelOpen,
    sendMessage,
    togglePanel,
    closePanel,
    dismissError,
    retryLastMessage,
    clearHistory,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Keyboard accessibility - Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPanelOpen) {
        closePanel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPanelOpen, closePanel]);

  // Focus panel when opened
  useEffect(() => {
    if (isPanelOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isPanelOpen]);

  // Handle send with task refresh
  const handleSend = useCallback(
    async (content: string) => {
      await sendMessage(content);
      // Refresh task list after sending (AI might have made changes)
      onTaskListRefresh?.();
    },
    [sendMessage, onTaskListRefresh]
  );

  // Handle retry with task refresh
  const handleRetry = useCallback(async () => {
    await retryLastMessage();
    onTaskListRefresh?.();
  }, [retryLastMessage, onTaskListRefresh]);

  // Handle clear with confirmation
  const handleClear = useCallback(async () => {
    if (confirm("Clear all chat history? This cannot be undone.")) {
      await clearHistory();
    }
  }, [clearHistory]);

  // Toggle button (shown when panel is closed)
  if (!isPanelOpen) {
    return (
      <button
        onClick={togglePanel}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[var(--secondary-purple)] to-[var(--secondary-purple-hover)] text-white shadow-lg shadow-[var(--secondary-purple)]/30 transition-all hover:scale-110 hover:shadow-xl ${className}`}
        aria-label="Open AI Chat"
        title="Open AI Chat"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>
    );
  }

  // Full panel (shown when open)
  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="complementary"
        aria-label="AI Chat Assistant"
        className={`fixed bottom-0 right-0 z-50 flex h-full w-full flex-col bg-[var(--card-bg)] shadow-2xl transition-transform duration-300 ease-out md:bottom-6 md:right-6 md:h-[600px] md:max-h-[80vh] md:w-[380px] md:rounded-2xl md:border md:border-[var(--card-border)] ${className}`}
        style={{
          animation: "slideIn 0.3s ease-out",
        }}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[var(--secondary-purple)] to-[var(--secondary-purple-hover)]">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="font-semibold text-[var(--foreground)]">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-1">
            {/* Clear button */}
            <button
              onClick={handleClear}
              className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--card-border)] hover:text-[var(--foreground)]"
              aria-label="Clear chat history"
              title="Clear history"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            {/* Close button */}
            <button
              onClick={closePanel}
              className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--card-border)] hover:text-[var(--foreground)]"
              aria-label="Close chat"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between gap-2 border-b border-[var(--error)]/20 bg-[var(--error)]/10 px-4 py-2">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 flex-shrink-0 text-[var(--error)]"
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
              <span className="text-sm text-[var(--error)]">{error}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRetry}
                className="rounded px-2 py-1 text-xs font-medium text-[var(--error)] hover:bg-[var(--error)]/10"
              >
                Retry
              </button>
              <button
                onClick={dismissError}
                className="rounded p-1 text-[var(--error)] hover:bg-[var(--error)]/10"
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
            </div>
          </div>
        )}

        {/* Messages list */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.length === 0 && !isLoading ? (
            // Welcome message
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[var(--secondary-purple)]/20 to-[var(--primary-yellow)]/20">
                <svg
                  className="h-8 w-8 text-[var(--secondary-purple)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
                Hi! I&apos;m your AI assistant
              </h3>
              <p className="mb-4 text-sm text-[var(--muted)]">
                I can help you manage your tasks. Try:
              </p>
              <div className="space-y-2 text-sm">
                <p className="rounded-lg bg-[var(--background)] px-3 py-2 text-[var(--foreground)]">
                  &ldquo;Add a task to buy groceries&rdquo;
                </p>
                <p className="rounded-lg bg-[var(--background)] px-3 py-2 text-[var(--foreground)]">
                  &ldquo;Show my tasks&rdquo;
                </p>
                <p className="rounded-lg bg-[var(--background)] px-3 py-2 text-[var(--foreground)]">
                  &ldquo;Mark groceries as done&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </aside>

      {/* CSS for slide-in animation */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
