import { useEffect, useCallback } from "react";

import { NotificationType, NotificationData } from "../../types/type";

// MIGRATION: Ahora usa el wrapper de compatibilidad que internamente usa Expo
// El código legacy se mantiene comentado para referencia durante la transición
// import { useNotificationStore, useRealtimeStore } from "../../store";
// import { NotificationType, NotificationData } from "../../types/type";
// import { notificationStorage } from "../lib/storage";
// import { notificationService } from "../services/notificationService";

// Nuevo sistema: wrapper de compatibilidad
import { useNotificationsCompat } from "./useNotificationsCompat";

export const useNotifications = () => {
  // Usar el wrapper de compatibilidad que mantiene la API legacy
  // pero internamente usa el nuevo sistema Expo
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
    // Mantener compatibilidad con métodos adicionales del nuevo sistema
    sendLocalNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getDeviceToken,
    requestPermissions,
    setBadgeCount,
    removeNotification,
  } = useNotificationsCompat();

  // MIGRATION: El connectionStatus ya no es necesario con el nuevo sistema
  // const { connectionStatus } = useRealtimeStore();

  // MIGRATION: La inicialización ahora se maneja en useNotificationsCompat
  // El wrapper se encarga de inicializar el sistema Expo y migrar datos legacy

  // MIGRATION: La persistencia ahora se maneja automáticamente en useNotificationsCompat
  // El wrapper guarda tanto en formato legacy (para compatibilidad) como en el nuevo formato

  // MIGRATION: Todas las funciones ahora se delegan al wrapper de compatibilidad
  // Los métodos del nuevo sistema Expo están disponibles a través de useNotificationsCompat

  // Funciones de utilidad legacy (mantener para compatibilidad)
  const areNotificationsEnabled = useCallback(() => {
    return preferences?.pushEnabled && preferences?.soundEnabled;
  }, [preferences]);

  const getNotificationsByType = useCallback(
    (type: NotificationType) => {
      return notifications.filter(
        (notification: NotificationData) => notification.type === type,
      );
    },
    [notifications],
  );

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(
      (notification: NotificationData) => !notification.isRead,
    );
  }, [notifications]);

  const getNotificationsByPriority = useCallback(
    (priority: "low" | "normal" | "high" | "critical") => {
      // MIGRATION: El sistema legacy no tenía prioridades, devolver array vacío
      // En futuras versiones se puede implementar mapeo desde el sistema Expo
      return [];
    },
    [],
  );

  // MIGRATION: Auto-update badge count cuando cambia unreadCount
  useEffect(() => {
    if (setBadgeCount) {
      setBadgeCount(unreadCount).catch((error) => {
        
      });
    }
  }, [unreadCount, setBadgeCount]);

  return {
    // State (mapeado desde sistema Expo)
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,

    // MIGRATION: Connection status ya no disponible en el nuevo sistema
    isOnline: true, // Asumir online para compatibilidad
    websocketConnected: true, // Asumir conectado para compatibilidad

    // Actions (delegadas al wrapper de compatibilidad)
    sendLocalNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getDeviceToken,
    requestPermissions,
    setBadgeCount,

    // Store actions (delegadas al wrapper)
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updatePreferences,
    removeNotification,

    // Utility functions (algunas adaptadas para compatibilidad)
    areNotificationsEnabled,
    getNotificationsByType,
    getUnreadNotifications,
    getNotificationsByPriority,
  };
};

export default useNotifications;
