import {
  NotificationData,
  NotificationPreferences,
  NotificationType,
} from "../types/type";
import {
  ExpoNotificationData,
  ExpoNotificationPreferences,
  ExpoNotificationType,
} from "../types/expo-notifications";

/**
 * Utilidades para adaptar entre tipos legacy y nuevos del sistema de notificaciones
 */

/**
 * Convierte NotificationData (legacy) a ExpoNotificationData (nuevo)
 */
export const adaptToExpoNotification = (
  legacy: NotificationData,
): ExpoNotificationData => {
  // Mapear tipos legacy a tipos Expo
  const typeMapping: Record<NotificationType, ExpoNotificationType> = {
    RIDE_REQUEST: "RIDE_REQUEST",
    RIDE_ACCEPTED: "RIDE_ACCEPTED",
    RIDE_CANCELLED: "RIDE_CANCELLED",
    DRIVER_ARRIVED: "DRIVER_ARRIVED",
    RIDE_STARTED: "RIDE_STARTED",
    RIDE_COMPLETED: "RIDE_COMPLETED",
    PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
    CHAT_MESSAGE: "CHAT_MESSAGE",
    EMERGENCY_ALERT: "EMERGENCY_ALERT",
    SYSTEM_UPDATE: "SYSTEM_UPDATE",
    PROMOTIONAL: "PROMOTIONAL",
    // Nuevos tipos que no existían en legacy
    MAINTENANCE: "MAINTENANCE",
  };

  return {
    id: legacy.id,
    type: typeMapping[legacy.type] || "SYSTEM_UPDATE",
    title: legacy.title,
    message: legacy.message,
    data: legacy.data,
    timestamp: legacy.timestamp,
    isRead: legacy.isRead,
    priority: getPriorityFromType(legacy.type),
  };
};

/**
 * Convierte ExpoNotificationData (nuevo) a NotificationData (legacy)
 */
export const adaptToLegacyNotification = (
  expo: ExpoNotificationData,
): NotificationData => {
  // Mapear tipos Expo a tipos legacy (algunos tipos nuevos se mapean a existentes)
  const typeMapping: Record<ExpoNotificationType, NotificationType> = {
    RIDE_REQUEST: "RIDE_REQUEST",
    RIDE_ACCEPTED: "RIDE_ACCEPTED",
    RIDE_CANCELLED: "RIDE_CANCELLED",
    DRIVER_ARRIVED: "DRIVER_ARRIVED",
    RIDE_STARTED: "RIDE_STARTED",
    RIDE_COMPLETED: "RIDE_COMPLETED",
    PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
    CHAT_MESSAGE: "CHAT_MESSAGE",
    EMERGENCY_ALERT: "EMERGENCY_ALERT",
    SYSTEM_UPDATE: "SYSTEM_UPDATE",
    PROMOTIONAL: "PROMOTIONAL",
    MAINTENANCE: "SYSTEM_UPDATE", // Map to system update for legacy compatibility
  };

  return {
    id: expo.id,
    type: typeMapping[expo.type] || "SYSTEM_UPDATE",
    title: expo.title,
    message: expo.message,
    data: expo.data,
    timestamp: expo.timestamp,
    priority: expo.priority || "normal",
    isRead: expo.isRead,
  };
};

/**
 * Convierte NotificationPreferences (legacy) a ExpoNotificationPreferences (nuevo)
 */
export const adaptToExpoPreferences = (
  legacy: NotificationPreferences,
): ExpoNotificationPreferences => {
  return {
    pushEnabled: legacy.pushEnabled,
    smsEnabled: legacy.smsEnabled ?? false,
    rideUpdates: legacy.rideUpdates,
    driverMessages: legacy.driverMessages,
    promotional: legacy.promotional ?? false,
    emergencyAlerts: legacy.emergencyAlerts,
    soundEnabled: legacy.soundEnabled ?? true,
    vibrationEnabled: legacy.vibrationEnabled ?? true,
    badgeEnabled: legacy.badgeEnabled ?? true,
    quietHoursEnabled: legacy.quietHoursEnabled ?? false,
    quietHoursStart: legacy.quietHoursStart ?? "22:00",
    quietHoursEnd: legacy.quietHoursEnd ?? "08:00",
  };
};

/**
 * Convierte ExpoNotificationPreferences (nuevo) a NotificationPreferences (legacy)
 */
export const adaptToLegacyPreferences = (
  expo: ExpoNotificationPreferences,
): NotificationPreferences => {
  return {
    pushEnabled: expo.pushEnabled,
    smsEnabled: expo.smsEnabled,
    rideUpdates: expo.rideUpdates,
    driverMessages: expo.driverMessages,
    promotional: expo.promotional,
    emergencyAlerts: expo.emergencyAlerts,
    soundEnabled: expo.soundEnabled,
    vibrationEnabled: expo.vibrationEnabled,
  };
};

/**
 * Determina la prioridad basada en el tipo de notificación legacy
 */
export const getPriorityFromType = (
  type: NotificationType,
): "low" | "normal" | "high" | "critical" => {
  const priorityMapping: Record<
    NotificationType,
    "low" | "normal" | "high" | "critical"
  > = {
    EMERGENCY_ALERT: "critical",
    RIDE_REQUEST: "high",
    DRIVER_ARRIVED: "high",
    RIDE_CANCELLED: "high",
    RIDE_STARTED: "normal",
    RIDE_COMPLETED: "normal",
    PAYMENT_SUCCESS: "normal",
    CHAT_MESSAGE: "normal",
    RIDE_ACCEPTED: "normal",
    SYSTEM_UPDATE: "low",
    PROMOTIONAL: "low",
    MAINTENANCE: "low",
  };

  return priorityMapping[type] || "normal";
};

/**
 * Convierte array de notificaciones entre formatos
 */
export const adaptNotificationArray = {
  toExpo: (legacy: NotificationData[]): ExpoNotificationData[] => {
    return legacy.map(adaptToExpoNotification);
  },

  toLegacy: (expo: ExpoNotificationData[]): NotificationData[] => {
    return expo.map(adaptToLegacyNotification);
  },
};

/**
 * Valida compatibilidad de tipos durante migración
 */
export const validateTypeCompatibility = {
  notification: (notification: any): notification is NotificationData => {
    return (
      typeof notification === "object" &&
      typeof notification.id === "string" &&
      typeof notification.title === "string" &&
      typeof notification.message === "string" &&
      typeof notification.isRead === "boolean" &&
      notification.timestamp instanceof Date
    );
  },

  preferences: (preferences: any): preferences is NotificationPreferences => {
    return (
      typeof preferences === "object" &&
      typeof preferences.pushEnabled === "boolean" &&
      typeof preferences.rideUpdates === "boolean" &&
      typeof preferences.driverMessages === "boolean"
    );
  },
};
