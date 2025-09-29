import { create } from "zustand";

import { log } from "@/lib/logger";
import {
  ExpoNotificationStore,
  ExpoNotificationData,
  ExpoNotificationPreferences,
  ExpoPushToken,
  ExpoNotificationPermissions,
  ExpoNotificationType,
} from "../../types/expo-notifications";

/**
 * Store Zustand para el sistema de notificaciones Expo
 * Gestiona estado de notificaciones, preferencias y configuración
 */
export const useExpoNotificationStore = create<ExpoNotificationStore>((set, get) => ({
  // ========== ESTADO INICIAL ==========
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
    badgeEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  },
  isLoading: false,
  error: null,
  lastSync: null,
  token: null,
  permissions: null,

  // ========== ACCIONES ==========

  addNotification: (notification: ExpoNotificationData) => {
    log.info("[ExpoNotificationStore] Adding notification", {
      id: notification.id,
      type: notification.type,
      title: notification.title,
    });

    set((state) => {
      // Verificar si la notificación ya existe
      const existingIndex = state.notifications.findIndex(n => n.id === notification.id);
      let newNotifications: ExpoNotificationData[];

      if (existingIndex >= 0) {
        // Actualizar notificación existente
        newNotifications = [...state.notifications];
        newNotifications[existingIndex] = { ...notification };
      } else {
        // Agregar nueva notificación con límite de memoria
        const MAX_NOTIFICATIONS = 100;
        const notificationsToKeep = state.notifications.slice(0, MAX_NOTIFICATIONS - 1);
        newNotifications = [notification, ...notificationsToKeep];
      }

      // Cleanup automático: eliminar notificaciones antiguas (más de 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      newNotifications = newNotifications.filter(n => n.timestamp > thirtyDaysAgo);

      // Calcular nuevo contador de no leídas
      const newUnreadCount = newNotifications.filter(n => !n.isRead).length;

      log.debug("[ExpoNotificationStore] Notification added", {
        totalNotifications: newNotifications.length,
        unreadCount: newUnreadCount,
        wasUpdate: existingIndex >= 0,
        cleanedOld: state.notifications.length - newNotifications.length,
      });

      return {
        notifications: newNotifications,
        unreadCount: newUnreadCount,
      };
    });
  },

  markAsRead: (notificationId: string) => {
    log.debug("[ExpoNotificationStore] Marking notification as read", { notificationId });

    set((state) => {
      const updatedNotifications = state.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );

      const newUnreadCount = updatedNotifications.filter(n => !n.isRead).length;

      log.debug("[ExpoNotificationStore] Notification marked as read", {
        unreadCount: newUnreadCount,
      });

      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };
    });
  },

  markAllAsRead: () => {
    log.info("[ExpoNotificationStore] Marking all notifications as read");

    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () => {
    log.info("[ExpoNotificationStore] Clearing all notifications");

    set(() => ({
      notifications: [],
      unreadCount: 0,
    }));
  },

  updatePreferences: (preferences: ExpoNotificationPreferences) => {
    log.info("[ExpoNotificationStore] Updating preferences", {
      pushEnabled: preferences.pushEnabled,
      soundEnabled: preferences.soundEnabled,
      vibrationEnabled: preferences.vibrationEnabled,
    });

    set(() => ({ preferences }));
  },

  setToken: (token: ExpoPushToken | null) => {
    log.info("[ExpoNotificationStore] Setting push token", {
      hasToken: !!token,
      tokenType: token?.type,
    });

    set(() => ({ token }));
  },

  setPermissions: (permissions: ExpoNotificationPermissions | null) => {
    log.info("[ExpoNotificationStore] Setting permissions", {
      hasPermissions: !!permissions,
      granted: permissions?.granted,
      status: permissions?.status,
    });

    set(() => ({ permissions }));
  },

  setLoading: (loading: boolean) => {
    set(() => ({ isLoading: loading }));
  },

  setError: (error: string | null) => {
    if (error) {
      log.error("[ExpoNotificationStore] Setting error", { error });
    }

    set(() => ({ error }));
  },

  syncWithServer: async () => {
    log.info("[ExpoNotificationStore] Starting server sync");

    set(() => ({ isLoading: true, error: null }));

    try {
      // TODO: Implementar sincronización con servidor
      // - Obtener notificaciones pendientes del servidor
      // - Enviar confirmaciones de lectura
      // - Actualizar estado basado en respuesta del servidor

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación

      set(() => ({
        lastSync: new Date(),
        isLoading: false,
      }));

      log.info("[ExpoNotificationStore] Server sync completed");

    } catch (error) {
      const errorMessage = (error as Error)?.message || "Sync failed";
      log.error("[ExpoNotificationStore] Server sync failed", { error: errorMessage });

      set(() => ({
        error: errorMessage,
        isLoading: false,
      }));

      throw error;
    }
  },

  // Método para remover una notificación específica
  removeNotification: (notificationId: string) => {
    log.debug("[ExpoNotificationStore] Removing notification", { notificationId });

    set((state) => {
      const updatedNotifications = state.notifications.filter(
        notification => notification.id !== notificationId
      );

      const newUnreadCount = updatedNotifications.filter(n => !n.isRead).length;

      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };
    });
  },
}));

// ========== SELECTORES OPTIMIZADOS ==========

/**
 * Selector para obtener notificaciones por tipo
 */
export const useNotificationsByType = (type: ExpoNotificationType) =>
  useExpoNotificationStore((state) =>
    state.notifications.filter(notification => notification.type === type)
  );

/**
 * Selector para obtener notificaciones no leídas
 */
export const useUnreadNotifications = () =>
  useExpoNotificationStore((state) =>
    state.notifications.filter(notification => !notification.isRead)
  );

/**
 * Selector para obtener notificaciones por prioridad
 */
export const useNotificationsByPriority = (priority: "low" | "normal" | "high" | "critical") =>
  useExpoNotificationStore((state) =>
    state.notifications.filter(notification => notification.priority === priority)
  );

/**
 * Selector para verificar si las notificaciones están habilitadas
 */
export const useNotificationsEnabled = () =>
  useExpoNotificationStore((state) => state.preferences.pushEnabled);

/**
 * Selector para obtener preferencias de sonido
 */
export const useSoundEnabled = () =>
  useExpoNotificationStore((state) => state.preferences.soundEnabled);

/**
 * Selector para obtener preferencias de vibración
 */
export const useVibrationEnabled = () =>
  useExpoNotificationStore((state) => state.preferences.vibrationEnabled);

/**
 * Selector para verificar si estamos en horas de silencio
 */
export const useIsQuietHours = () => {
  const preferences = useExpoNotificationStore((state) => state.preferences);

  return () => {
    if (!preferences.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = preferences.quietHoursStart!.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHoursEnd!.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      // Misma día
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Cruza medianoche
      return currentTime >= startTime || currentTime <= endTime;
    }
  };
};

/**
 * Selector para obtener resumen de notificaciones
 */
export const useNotificationSummary = () =>
  useExpoNotificationStore((state) => ({
    total: state.notifications.length,
    unread: state.unreadCount,
    lastSync: state.lastSync,
    hasToken: !!state.token,
    permissionsGranted: state.permissions?.granted || false,
  }));

/**
 * Selector para obtener estado de carga y error
 */
export const useNotificationStatus = () =>
  useExpoNotificationStore((state) => ({
    isLoading: state.isLoading,
    error: state.error,
    lastSync: state.lastSync,
  }));

// ========== HOOKS DE ACCIÓN ==========

/**
 * Hook para acciones comunes de notificaciones
 */
export const useNotificationActions = () => {
  const store = useExpoNotificationStore();

  return {
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    clearNotifications: store.clearNotifications,
    updatePreferences: store.updatePreferences,
    syncWithServer: store.syncWithServer,
    removeNotification: store.removeNotification,
  };
};
