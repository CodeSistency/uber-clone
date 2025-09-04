import { create } from "zustand";
import { NotificationData, NotificationPreferences } from "@/types/type";

// Notification Store Interface
interface NotificationStore {
  notifications: NotificationData[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;

  // Actions
  addNotification: (notification: NotificationData) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updatePreferences: (preferences: NotificationPreferences) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  removeNotification: (notificationId: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: {
    pushEnabled: true,
    smsEnabled: false,
    rideUpdates: true,
    driverMessages: true,
    promotional: false,
    emergencyAlerts: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  isLoading: false,
  error: null,

  addNotification: (notification: NotificationData) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 100), // Keep only last 100
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    }));
  },

  markAsRead: (notificationId: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      );

      const newUnreadCount = updatedNotifications.filter(
        (n) => !n.isRead,
      ).length;

      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () => {
    set(() => ({
      notifications: [],
      unreadCount: 0,
    }));
  },

  updatePreferences: (preferences: NotificationPreferences) => {
    set(() => ({ preferences }));
  },

  setLoading: (loading: boolean) => {
    set(() => ({ isLoading: loading }));
  },

  setError: (error: string | null) => {
    set(() => ({ error }));
  },

  removeNotification: (notificationId: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.filter(
        (notification) => notification.id !== notificationId,
      );
      const newUnreadCount = updatedNotifications.filter(
        (n) => !n.isRead,
      ).length;

      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };
    });
  },
}));
