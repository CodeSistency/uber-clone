import { useEffect, useCallback, useMemo } from "react";

// Importar el nuevo sistema Expo
import { useExpoNotificationStore } from "../../store/expo-notifications/expoNotificationStore";
import { expoNotificationService } from "../services/expo-notifications";

// Importar tipos legacy para compatibilidad
import { NotificationData, NotificationPreferences, NotificationType } from "../../types/type";

// Importar servicios legacy para transición gradual
import { notificationStorage } from "../lib/storage";

/**
 * Hook de compatibilidad que mantiene la API legacy de useNotifications
 * pero internamente usa el nuevo sistema Expo Notifications.
 *
 * Esto permite una migración gradual sin romper componentes existentes.
 */
export const useNotificationsCompat = () => {
  // Usar el nuevo sistema Expo internamente (directamente el store y servicio)
  const expoStore = useExpoNotificationStore();

  // Adaptadores de tipos: convertir entre NotificationData y ExpoNotificationData
  const adaptToLegacyNotification = useCallback((expoNotification: any): NotificationData => {
    return {
      id: expoNotification.id,
      type: expoNotification.type as NotificationType,
      title: expoNotification.title,
      message: expoNotification.message,
      data: expoNotification.data,
      timestamp: expoNotification.timestamp,
      isRead: expoNotification.isRead,
    };
  }, []);

  const adaptToExpoNotification = useCallback((legacyNotification: NotificationData): any => {
    return {
      id: legacyNotification.id,
      type: legacyNotification.type,
      title: legacyNotification.title,
      message: legacyNotification.message,
      data: legacyNotification.data,
      timestamp: legacyNotification.timestamp,
      isRead: legacyNotification.isRead,
      priority: 'normal', // Default priority for legacy compatibility
    };
  }, []);

  // Convertir notificaciones del nuevo formato al legacy
  const legacyNotifications = useMemo(() => {
    return expoStore.notifications.map(adaptToLegacyNotification);
  }, [expoStore.notifications, adaptToLegacyNotification]);

  // Convertir preferencias (son compatibles, solo agregar campos faltantes)
  const legacyPreferences: NotificationPreferences = useMemo(() => {
    return {
      pushEnabled: expoStore.preferences.pushEnabled,
      smsEnabled: expoStore.preferences.smsEnabled ?? false,
      rideUpdates: expoStore.preferences.rideUpdates,
      driverMessages: expoStore.preferences.driverMessages,
      promotional: expoStore.preferences.promotional ?? false,
      emergencyAlerts: expoStore.preferences.emergencyAlerts,
      soundEnabled: expoStore.preferences.soundEnabled,
      vibrationEnabled: expoStore.preferences.vibrationEnabled,
      // Nuevos campos del sistema Expo (no usados en legacy)
      badgeEnabled: expoStore.preferences.badgeEnabled ?? true,
      quietHoursEnabled: expoStore.preferences.quietHoursEnabled ?? false,
      quietHoursStart: expoStore.preferences.quietHoursStart ?? "22:00",
      quietHoursEnd: expoStore.preferences.quietHoursEnd ?? "08:00",
    };
  }, [expoStore.preferences]);

  // Adaptar acciones para mantener API compatible
  const addNotification = useCallback((notification: NotificationData) => {
    const expoNotification = adaptToExpoNotification(notification);
    expoStore.addNotification(expoNotification);
  }, [expoStore, adaptToExpoNotification]);

  const markAsRead = useCallback((notificationId: string) => {
    expoStore.markAsRead(notificationId);
  }, [expoStore]);

  const markAllAsRead = useCallback(() => {
    expoStore.markAllAsRead();
  }, [expoStore]);

  const clearNotifications = useCallback(() => {
    expoStore.clearNotifications();
  }, [expoStore]);

  const updatePreferences = useCallback((preferences: NotificationPreferences) => {
    // Convertir preferencias legacy al nuevo formato
    const expoPreferences = {
      pushEnabled: preferences.pushEnabled,
      smsEnabled: preferences.smsEnabled ?? false,
      rideUpdates: preferences.rideUpdates,
      driverMessages: preferences.driverMessages,
      promotional: preferences.promotional ?? false,
      emergencyAlerts: preferences.emergencyAlerts,
      soundEnabled: preferences.soundEnabled,
      vibrationEnabled: preferences.vibrationEnabled,
      badgeEnabled: preferences.badgeEnabled ?? true,
      quietHoursEnabled: preferences.quietHoursEnabled ?? false,
      quietHoursStart: preferences.quietHoursStart ?? "22:00",
      quietHoursEnd: preferences.quietHoursEnd ?? "08:00",
    };

    expoStore.updatePreferences(expoPreferences);
  }, [expoStore]);

  // Inicialización compatible con el sistema legacy
  useEffect(() => {
    const initializeCompatLayer = async () => {
      try {
        // Cargar estado legacy desde AsyncStorage si existe
        const savedPreferences = await notificationStorage.getPreferences();
        const history = await notificationStorage.getNotificationHistory();

        if (savedPreferences) {
          console.log("[useNotificationsCompat] Migrating legacy preferences");
          updatePreferences(savedPreferences);
        }

        if (history && history.length > 0) {
          console.log("[useNotificationsCompat] Migrating legacy notification history", {
            count: history.length
          });
          // Convertir y agregar notificaciones legacy al nuevo store
          history.forEach(notification => {
            addNotification(notification);
          });
        }

        console.log("[useNotificationsCompat] Compatibility layer initialized");
      } catch (error) {
        console.error("[useNotificationsCompat] Error initializing compatibility layer:", error);
      }
    };

    initializeCompatLayer();
  }, [addNotification, updatePreferences]);

  // Inicializar el servicio Expo cuando se monte el componente
  useEffect(() => {
    const initializeService = async () => {
      try {
        await expoNotificationService.initialize();
        console.log("[useNotificationsCompat] Expo notification service initialized");
      } catch (error) {
        console.error("[useNotificationsCompat] Failed to initialize Expo service:", error);
      }
    };

    initializeService();
  }, []);

  // Persistencia automática (mantiene comportamiento legacy)
  useEffect(() => {
    const saveToLegacyStorage = async () => {
      try {
        // Guardar en formato legacy para compatibilidad
        await notificationStorage.savePreferences(legacyPreferences);
        await notificationStorage.saveNotificationHistory(legacyNotifications);
      } catch (error) {
        console.error("[useNotificationsCompat] Error saving to legacy storage:", error);
      }
    };

    if (legacyNotifications.length > 0 || Object.keys(legacyPreferences).length > 0) {
      saveToLegacyStorage();
    }
  }, [legacyNotifications, legacyPreferences]);

  // Retornar API compatible con el sistema legacy
  return {
    // Estado (mapeado desde el nuevo sistema)
    notifications: legacyNotifications,
    unreadCount: expoStore.unreadCount,
    preferences: legacyPreferences,
    isLoading: expoStore.isLoading,
    error: expoStore.error,

    // Acciones (adaptadas para el nuevo sistema)
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updatePreferences,

    // Acciones adicionales del nuevo sistema (implementadas directamente)
    sendLocalNotification: useCallback(async (title: string, body: string, data?: any) => {
      return await expoNotificationService.sendLocalNotification(title, body, data);
    }, []),

    scheduleNotification: useCallback(async (title: string, body: string, delayInSeconds: number, data?: any) => {
      return await expoNotificationService.scheduleNotification(title, body, { seconds: delayInSeconds }, data);
    }, []),

    cancelNotification: useCallback(async (notificationId: string) => {
      return await expoNotificationService.cancelNotification(notificationId);
    }, []),

    cancelAllNotifications: useCallback(async () => {
      return await expoNotificationService.cancelAllNotifications();
    }, []),

    getDeviceToken: useCallback(async () => {
      const token = await expoNotificationService.getPushToken();
      return token?.data || null;
    }, []),

    requestPermissions: useCallback(async () => {
      const result = await expoNotificationService.requestPermissions();
      return result;
    }, []),

    setBadgeCount: useCallback(async (count: number) => {
      return await expoNotificationService.setBadgeCount(count);
    }, []),

    removeNotification: expoStore.removeNotification,
  };
};


