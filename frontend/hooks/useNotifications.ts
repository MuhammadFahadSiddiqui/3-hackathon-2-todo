"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Notification sound as base64 data URI (short bell sound)
const NOTIFICATION_SOUND_URI =
  "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onb6zoINbPkBlg6W9wa2NbEw5QWaIqsW+qYthRjxEZ4msxr2qh19EOEVniazGvaqHX0Q4RWeJrMa9qodfRDhFZ4msxr2qh19EOEVniazGvaqHXw==";

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
}

export interface UseNotificationsReturn {
  permission: NotificationPermission | "default";
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (options: NotificationOptions) => void;
  playSound: () => void;
}

/**
 * Hook for managing browser notifications with sound.
 */
export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission | "default">("default");
  const [isSupported, setIsSupported] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check support and permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Create audio element for notification sound
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(NOTIFICATION_SOUND_URI);
      audioRef.current.volume = 0.5;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  /**
   * Request notification permission from the user.
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return "denied";
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return "denied";
    }
  }, [isSupported]);

  /**
   * Play notification sound.
   */
  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        // Ignore autoplay errors (user hasn't interacted yet)
        console.debug("Could not play notification sound:", err);
      });
    }
  }, []);

  /**
   * Show a browser notification with sound.
   */
  const showNotification = useCallback(
    (options: NotificationOptions) => {
      if (!isSupported || permission !== "granted") {
        // Fall back to console log if notifications not available
        console.log(`[Reminder] ${options.title}: ${options.body}`);
        return;
      }

      try {
        // Play sound first
        playSound();

        // Show notification
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/icon-192.png",
          tag: options.tag,
          requireInteraction: options.requireInteraction ?? true,
          data: options.data,
        });

        // Handle click - focus the app
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto-close after 10 seconds if not interacted
        setTimeout(() => {
          notification.close();
        }, 10000);
      } catch (error) {
        console.error("Failed to show notification:", error);
      }
    },
    [isSupported, permission, playSound]
  );

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    playSound,
  };
}
