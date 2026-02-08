"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  chatApi,
  ChatResponse,
  HistoryMessage,
  ToolCallInfo,
} from "@/lib/chat-api";

/**
 * Message type for frontend state.
 */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCallInfo[];
  status: "sending" | "sent" | "error";
}

/**
 * Return type for useChat hook.
 */
export interface UseChatReturn {
  // State
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isPanelOpen: boolean;
  conversationId: number | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  dismissError: () => void;
  retryLastMessage: () => Promise<void>;
}

/**
 * Map backend HistoryMessage to frontend Message type.
 */
function mapHistoryMessage(msg: HistoryMessage): Message | null {
  // Skip tool role messages (internal)
  if (msg.role === "tool") return null;

  return {
    id: String(msg.id),
    role: msg.role as "user" | "assistant",
    content: msg.content,
    timestamp: new Date(msg.created_at),
    status: "sent",
  };
}

/**
 * Generate a unique ID for optimistic messages.
 */
function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Custom hook for chat state management.
 */
export function useChat(): UseChatReturn {
  const router = useRouter();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null
  );

  // Track if history has been loaded
  const historyLoaded = useRef(false);

  /**
   * Load conversation history from backend.
   */
  const loadHistory = useCallback(async () => {
    if (historyLoaded.current) return;

    try {
      setIsLoading(true);
      const history = await chatApi.getHistory();

      // Map and filter messages
      const mappedMessages = history.messages
        .map(mapHistoryMessage)
        .filter((msg): msg is Message => msg !== null);

      setMessages(mappedMessages);
      setConversationId(history.conversation_id);
      historyLoaded.current = true;
      setError(null);
    } catch (err) {
      const error = err as Error & { status?: number };
      if (error.status === 401) {
        router.push("/login");
      } else if (error.status !== 404) {
        // 404 means no conversation yet, which is fine
        console.error("Failed to load chat history:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  /**
   * Send a message to the AI assistant.
   */
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();
      if (!trimmedContent || isLoading) return;

      // Create optimistic user message
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: trimmedContent,
        timestamp: new Date(),
        status: "sending",
      };

      // Add user message to state
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);
      setLastFailedMessage(null);

      try {
        const response: ChatResponse = await chatApi.sendMessage(trimmedContent);

        // Update user message status to sent
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
          )
        );

        // Add assistant response
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
          toolCalls: response.tool_calls,
          status: "sent",
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Update conversation ID if returned
        if (response.conversation_id) {
          setConversationId(response.conversation_id);
        }
      } catch (err) {
        const error = err as Error & { status?: number };

        // Update user message status to error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: "error" } : msg
          )
        );

        // Store for retry
        setLastFailedMessage(trimmedContent);

        if (error.status === 401) {
          setError("Session expired. Please log in again.");
          router.push("/login");
        } else {
          setError("Unable to send message. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, router]
  );

  /**
   * Retry the last failed message.
   */
  const retryLastMessage = useCallback(async () => {
    if (!lastFailedMessage) return;

    // Remove the failed message from state
    setMessages((prev) => prev.filter((msg) => msg.status !== "error"));

    // Retry sending
    await sendMessage(lastFailedMessage);
  }, [lastFailedMessage, sendMessage]);

  /**
   * Clear conversation history.
   */
  const clearHistory = useCallback(async () => {
    try {
      await chatApi.clearHistory();
      setMessages([]);
      setConversationId(null);
      historyLoaded.current = false;
      setError(null);
    } catch (err) {
      const error = err as Error & { status?: number };
      if (error.status === 401) {
        router.push("/login");
      } else {
        setError("Failed to clear history. Please try again.");
      }
    }
  }, [router]);

  /**
   * Toggle panel visibility.
   */
  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  /**
   * Open panel.
   */
  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  /**
   * Close panel.
   */
  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  /**
   * Dismiss error.
   */
  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  // Load history when panel opens for the first time
  useEffect(() => {
    if (isPanelOpen && !historyLoaded.current) {
      loadHistory();
    }
  }, [isPanelOpen, loadHistory]);

  return {
    messages,
    isLoading,
    error,
    isPanelOpen,
    conversationId,
    sendMessage,
    loadHistory,
    clearHistory,
    togglePanel,
    openPanel,
    closePanel,
    dismissError,
    retryLastMessage,
  };
}
