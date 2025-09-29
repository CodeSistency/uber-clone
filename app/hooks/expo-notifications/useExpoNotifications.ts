import { useCallback, useEffect } from "react";

import { expoNotificationService } from "@/app/services/expo-notifications";
import { useExpoNotificationStore, useNotificationActions } from "@/store/expo-notifications/expoNotificationStore";

import {
  UseExpoNotificationsReturn,
  ExpoPushToken,
  ExpoNotificationPermissions,
  ExpoNotificationPreferences,
} from "../../../types/expo-notifications";

/**
 * Hook personalizado para el sistema de notificaciones Expo
 * Proporciona una interfaz React-friendly para todas las funcionalidades de notificaciones
 */
export const useExpoNotifications = (): UseExpoNotificationsReturn => {
  // Estado y acciones del store
  const {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,
    token,
    permissions,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updatePreferences,
    syncWithServer,
    removeNotification,
  } = useExpoNotificationStore();

  // Inicializar el servicio cuando se monte el componente
  useEffect(() => {
    const initializeService = async () => {
      try {
        await expoNotificationService.initialize();
      } catch (error) {
        console.error("[useExpoNotifications] Failed to initialize service:", error);
      }
    };

    initializeService();

    // Cleanup al desmontar
    return () => {
      // Nota: No destruimos el servicio aquí ya que puede ser usado por otros componentes
    };
  }, []);

  // Función para enviar notificación local
  const sendLocalNotification = useCallback(
    async (title: string, body: string, data?: any) => {
      try {
        const notificationId = await expoNotificationService.sendLocalNotification(
          title,
          body,
          data
        );
        return notificationId;
      } catch (error) {
        console.error("[useExpoNotifications] Failed to send local notification:", error);
        throw error;
      }
    },
    []
  );

  // Función para programar notificación
  const scheduleNotification = useCallback(
    async (title: string, body: string, delayInSeconds: number, data?: any) => {
      try {
        const trigger = { seconds: delayInSeconds };
        const notificationId = await expoNotificationService.scheduleNotification(
          title,
          body,
          trigger,
          data
        );
        return notificationId;
      } catch (error) {
        console.error("[useExpoNotifications] Failed to schedule notification:", error);
        throw error;
      }
    },
    []
  );

  // Función para cancelar notificación
  const cancelNotification = useCallback(async (id: string) => {
    try {
      await expoNotificationService.cancelNotification(id);
    } catch (error) {
      console.error("[useExpoNotifications] Failed to cancel notification:", error);
      throw error;
    }
  }, []);

  // Función para cancelar todas las notificaciones
  const cancelAllNotifications = useCallback(async () => {
    try {
      await expoNotificationService.cancelAllNotifications();
    } catch (error) {
      console.error("[useExpoNotifications] Failed to cancel all notifications:", error);
      throw error;
    }
  }, []);

  // Función para obtener token del dispositivo
  const getDeviceToken = useCallback(async (): Promise<ExpoPushToken | null> => {
    try {
      return await expoNotificationService.getPushToken();
    } catch (error) {
      console.error("[useExpoNotifications] Failed to get device token:", error);
      throw error;
    }
  }, []);

  // Función para solicitar permisos
  const requestPermissions = useCallback(async (): Promise<ExpoNotificationPermissions> => {
    try {
      const permissions = await expoNotificationService.requestPermissions();
      return permissions;
    } catch (error) {
      console.error("[useExpoNotifications] Failed to request permissions:", error);
      throw error;
    }
  }, []);

  // Función para establecer contador del badge
  const setBadgeCount = useCallback(async (count: number) => {
    try {
      await expoNotificationService.setBadgeCount(count);
    } catch (error) {
      console.error("[useExpoNotifications] Failed to set badge count:", error);
      throw error;
    }
  }, []);

  return {
    // Estado
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,
    token,
    permissions,

    // Acciones
    sendLocalNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getDeviceToken,
    requestPermissions,
    setBadgeCount,

    // Store actions
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updatePreferences,
    syncWithServer,
    removeNotification,
  };
};

/**
 * Hook específico para gestionar permisos de notificación
 */
export const useNotificationPermissions = () => {
  const { permissions, requestPermissions } = useExpoNotifications();

  const hasPermissions = permissions?.granted || false;
  const canAskAgain = permissions?.canAskAgain || false;
  const status = permissions?.status || "undetermined";

  return {
    hasPermissions,
    canAskAgain,
    status,
    permissions,
    requestPermissions,
  };
};

/**
 * Hook específico para gestionar tokens push
 */
export const usePushToken = () => {
  const { token, getDeviceToken } = useExpoNotifications();

  const hasToken = !!token;
  const tokenType = token?.type;
  const tokenData = token?.data;

  return {
    token,
    hasToken,
    tokenType,
    tokenData,
    getDeviceToken,
  };
};

/**
 * Hook específico para gestionar badge del app
 */
export const useAppBadge = () => {
  const { unreadCount, setBadgeCount } = useExpoNotifications();

  // Actualizar badge automáticamente cuando cambie el contador
  useEffect(() => {
    setBadgeCount(unreadCount).catch(error => {
      console.error("[useAppBadge] Failed to update badge:", error);
    });
  }, [unreadCount, setBadgeCount]);

  const clearBadge = useCallback(async () => {
    try {
      await setBadgeCount(0);
    } catch (error) {
      console.error("[useAppBadge] Failed to clear badge:", error);
      throw error;
    }
  }, [setBadgeCount]);

  return {
    badgeCount: unreadCount,
    setBadgeCount,
    clearBadge,
  };
};

/**
 * Hook específico para notificaciones de tipo específico
 */
export const useNotificationsByType = (type: string) => {
  const { notifications } = useExpoNotifications();

  const filteredNotifications = notifications.filter(n => n.type === type);
  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;

  return {
    notifications: filteredNotifications,
    unreadCount,
    hasNotifications: filteredNotifications.length > 0,
  };
};

/**
 * Hook específico para preferencias de notificación
 */
export const useNotificationPreferences = () => {
  const { preferences, updatePreferences } = useExpoNotifications();

  const updatePreference = useCallback(
    (key: keyof ExpoNotificationPreferences, value: any) => {
      const updatedPreferences = { ...preferences, [key]: value };
      updatePreferences(updatedPreferences);
    },
    [preferences, updatePreferences]
  );

  const togglePreference = useCallback(
    (key: keyof ExpoNotificationPreferences) => {
      const currentValue = preferences[key as keyof ExpoNotificationPreferences];
      if (typeof currentValue === "boolean") {
        updatePreference(key, !currentValue);
      }
    },
    [preferences, updatePreference]
  );

  return {
    preferences,
    updatePreferences,
    updatePreference,
    togglePreference,
  };
};

/**
 * Hook para simular notificaciones (útil para testing/demos)
 */
export const useNotificationSimulator = () => {
  const simulateNotification = useCallback(
    (title: string, body: string, data?: any, type?: "foreground" | "background") => {
      expoNotificationService.simulateNotification({
        title,
        body,
        data,
        type,
      });
    },
    []
  );

  const simulateRideRequest = useCallback(() => {
    simulateNotification(
      "New Ride Request",
      "Pickup at 123 Main St, dropoff at 456 Oak Ave",
      {
        type: "RIDE_REQUEST",
        rideId: `simulated_${Date.now()}`,
        pickupAddress: "123 Main St",
        dropoffAddress: "456 Oak Ave",
        fare: 25.50,
      },
      "foreground"
    );
  }, [simulateNotification]);

  const simulateRideAccepted = useCallback(() => {
    simulateNotification(
      "Driver Found!",
      "Your driver John is on the way",
      {
        type: "RIDE_ACCEPTED",
        rideId: `simulated_${Date.now()}`,
        driverName: "John",
      },
      "foreground"
    );
  }, [simulateNotification]);

  return {
    simulateNotification,
    simulateRideRequest,
    simulateRideAccepted,
  };
};


