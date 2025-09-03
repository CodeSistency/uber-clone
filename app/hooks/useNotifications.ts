import { useEffect, useCallback } from "react";

// import * as Notifications from 'expo-notifications'; // Temporarily commented
import { useNotificationStore, useRealtimeStore } from "../../store";
import { NotificationType, NotificationData } from "../../types/type";
import { notificationStorage } from "../lib/storage";
import { notificationService } from "../services/notificationService";

export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updatePreferences,
    setLoading,
    setError,
  } = useNotificationStore();

  const { connectionStatus } = useRealtimeStore();

  // Initialize notifications on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        setLoading(true);

        // Initialize notification service
        await notificationService.initialize();

        // Load preferences from storage
        const savedPreferences = await notificationStorage.getPreferences();
        if (savedPreferences) {
          updatePreferences(savedPreferences);
        }

        // Load notification history
        const history = await notificationStorage.getNotificationHistory();
        history.forEach((notification) => addNotification(notification));

        console.log(
          "[useNotifications] Notifications initialized successfully",
        );
      } catch (error) {
        console.error(
          "[useNotifications] Failed to initialize notifications:",
          error,
        );
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize notifications",
        );
      } finally {
        setLoading(false);
      }
    };

    initializeNotifications();
  }, []);

  // Save preferences to storage when they change
  useEffect(() => {
    const savePreferences = async () => {
      try {
        await notificationStorage.savePreferences(preferences);
      } catch (error) {
        console.error("[useNotifications] Failed to save preferences:", error);
      }
    };

    if (preferences) {
      savePreferences();
    }
  }, [preferences]);

  // Save notifications to storage when they change
  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await notificationStorage.saveNotificationHistory(notifications);
      } catch (error) {
        console.error(
          "[useNotifications] Failed to save notification history:",
          error,
        );
      }
    };

    if (notifications.length > 0) {
      saveNotifications();
    }
  }, [notifications]);

  // Send local notification
  const sendLocalNotification = useCallback(
    async (title: string, body: string, data?: any) => {
      try {
        await notificationService.sendLocalNotification(title, body, data);
      } catch (error) {
        console.error(
          "[useNotifications] Failed to send local notification:",
          error,
        );
        throw error;
      }
    },
    [],
  );

  // Schedule notification
  const scheduleNotification = useCallback(
    async (title: string, body: string, delayInSeconds: number, data?: any) => {
      try {
        await notificationService.scheduleNotification(
          title,
          body,
          delayInSeconds,
          data,
        );
      } catch (error) {
        console.error(
          "[useNotifications] Failed to schedule notification:",
          error,
        );
        throw error;
      }
    },
    [],
  );

  // Cancel notification
  const cancelNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.cancelNotification(notificationId);
    } catch (error) {
      console.error("[useNotifications] Failed to cancel notification:", error);
      throw error;
    }
  }, []);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async () => {
    try {
      await notificationService.cancelAllNotifications();
    } catch (error) {
      console.error(
        "[useNotifications] Failed to cancel all notifications:",
        error,
      );
      throw error;
    }
  }, []);

  // Get device token
  const getDeviceToken = useCallback(async () => {
    try {
      return await notificationService.getDeviceToken();
    } catch (error) {
      console.error("[useNotifications] Failed to get device token:", error);
      throw error;
    }
  }, []);

  // Set badge count
  const setBadgeCount = useCallback(async (count: number) => {
    try {
      await notificationService.setBadgeCount(count);
    } catch (error) {
      console.error("[useNotifications] Failed to set badge count:", error);
      throw error;
    }
  }, []);

  // Update badge count when unread count changes
  useEffect(() => {
    setBadgeCount(unreadCount);
  }, [unreadCount, setBadgeCount]);

  // Check if notifications are enabled
  const areNotificationsEnabled = useCallback(() => {
    return preferences.pushEnabled;
  }, [preferences.pushEnabled]);

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type: NotificationType) => {
      return notifications.filter(
        (notification: NotificationData) => notification.type === type,
      );
    },
    [notifications],
  );

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(
      (notification: NotificationData) => !notification.isRead,
    );
  }, [notifications]);

  // Get notifications by priority
  const getNotificationsByPriority = useCallback(
    (priority: "low" | "normal" | "high" | "critical") => {
      return notifications.filter(
        (notification: NotificationData) => notification.priority === priority,
      );
    },
    [notifications],
  );

  return {
    // State
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,

    // Connection status
    isOnline: connectionStatus.isConnected,
    websocketConnected: connectionStatus.websocketConnected,

    // Actions
    sendLocalNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getDeviceToken,
    setBadgeCount,

    // Store actions
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updatePreferences,
    setLoading,
    setError,

    // Utility functions
    areNotificationsEnabled,
    getNotificationsByType,
    getUnreadNotifications,
    getNotificationsByPriority,
  };
};
