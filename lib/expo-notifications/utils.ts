import {
  ExpoNotificationType,
  ExpoNotificationPreferences,
} from "../../types/expo-notifications";

/**
 * Utilidades para el sistema de notificaciones Expo
 */

/**
 * Formatear tiempo (minutos a formato legible)
 */
export const formatTime = (minutes: number): string => {
  const formattedMinutes = +minutes?.toFixed(0) || 0;

  if (formattedMinutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(formattedMinutes / 60);
    const remainingMinutes = formattedMinutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
};

/**
 * Formatear fecha a formato legible
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day < 10 ? "0" + day : day} ${month} ${year}`;
};

/**
 * Obtener prioridad de notificación basada en el tipo
 */
export const getPriorityFromType = (
  type: ExpoNotificationType,
): "low" | "normal" | "high" | "critical" => {
  const priorityMap: Record<
    ExpoNotificationType,
    "low" | "normal" | "high" | "critical"
  > = {
    EMERGENCY_ALERT: "critical",
    RIDE_REQUEST: "high",
    DRIVER_ARRIVED: "high",
    RIDE_CANCELLED: "high",
    RIDE_ACCEPTED: "high",
    RIDE_STARTED: "normal",
    RIDE_COMPLETED: "normal",
    PAYMENT_SUCCESS: "normal",
    CHAT_MESSAGE: "normal",
    SYSTEM_UPDATE: "low",
    PROMOTIONAL: "low",
    MAINTENANCE: "low",
  };

  return priorityMap[type] || "normal";
};

/**
 * Verificar si se debe mostrar una notificación basada en preferencias
 */
export const shouldShowNotification = (
  preferences: ExpoNotificationPreferences,
  type: ExpoNotificationType,
  currentTime: Date = new Date(),
): boolean => {
  // Emergency alerts siempre se muestran, sin importar otras configuraciones
  if (type === "EMERGENCY_ALERT") {
    return true;
  }

  // Verificar si las notificaciones push están habilitadas
  if (!preferences.pushEnabled) {
    return false;
  }

  // Verificar preferencias específicas por tipo
  const typePreferenceMap: Record<
    ExpoNotificationType,
    keyof ExpoNotificationPreferences
  > = {
    RIDE_REQUEST: "rideUpdates",
    RIDE_ACCEPTED: "rideUpdates",
    RIDE_CANCELLED: "rideUpdates",
    DRIVER_ARRIVED: "rideUpdates",
    RIDE_STARTED: "rideUpdates",
    RIDE_COMPLETED: "rideUpdates",
    PAYMENT_SUCCESS: "rideUpdates",
    CHAT_MESSAGE: "driverMessages",
    EMERGENCY_ALERT: "emergencyAlerts",
    SYSTEM_UPDATE: "pushEnabled", // Siempre mostrar actualizaciones del sistema
    PROMOTIONAL: "promotional",
    MAINTENANCE: "pushEnabled", // Siempre mostrar mantenimiento
  };

  const preferenceKey = typePreferenceMap[type];
  if (preferenceKey && !preferences[preferenceKey]) {
    return false;
  }

  // Verificar horas de silencio
  if (preferences.quietHoursEnabled && isQuietHours(preferences, currentTime)) {
    // Solo permitir notificaciones críticas durante horas de silencio
    return getPriorityFromType(type) === "critical";
  }

  return true;
};

/**
 * Verificar si estamos en horas de silencio
 */
export const isQuietHours = (
  preferences: ExpoNotificationPreferences,
  currentTime: Date = new Date(),
): boolean => {
  if (!preferences.quietHoursEnabled) {
    return false;
  }

  const [startHour, startMinute] = preferences
    .quietHoursStart!.split(":")
    .map(Number);
  const [endHour, endMinute] = preferences
    .quietHoursEnd!.split(":")
    .map(Number);

  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  const currentTimeMinutes =
    currentTime.getHours() * 60 + currentTime.getMinutes();

  if (startTime <= endTime) {
    // Misma día (ej: 22:00 a 08:00 del día siguiente no aplica aquí)
    return currentTimeMinutes >= startTime && currentTimeMinutes <= endTime;
  } else {
    // Cruza medianoche
    return currentTimeMinutes >= startTime || currentTimeMinutes <= endTime;
  }
};

/**
 * Obtener mensaje de preview para notificaciones de chat
 */
export const getChatPreview = (
  message: string,
  maxLength: number = 50,
): string => {
  if (message.length <= maxLength) {
    return message;
  }
  return message.substring(0, maxLength - 3) + "...";
};

/**
 * Generar ID único para notificaciones
 */
export const generateNotificationId = (
  prefix: string = "notification",
): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calcular tiempo relativo (ej: "hace 5 min", "hace 2 horas")
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins} min ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }
};

/**
 * Agrupar notificaciones por fecha
 */
export const groupNotificationsByDate = <T extends { timestamp: Date }>(
  notifications: T[],
): Record<string, T[]> => {
  const groups: Record<string, T[]> = {};

  notifications.forEach((notification) => {
    const date = new Date(notification.timestamp);
    const dateKey = date.toDateString(); // Agrupa por día

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(notification);
  });

  return groups;
};

/**
 * Obtener estadísticas de notificaciones
 */
export const getNotificationStats = (
  notifications: Array<{ isRead: boolean; type: ExpoNotificationType }>,
) => {
  const total = notifications.length;
  const unread = notifications.filter((n) => !n.isRead).length;
  const read = total - unread;

  // Conteo por tipo
  const byType: Record<ExpoNotificationType, number> = {} as Record<
    ExpoNotificationType,
    number
  >;

  notifications.forEach((notification) => {
    byType[notification.type] = (byType[notification.type] || 0) + 1;
  });

  return {
    total,
    unread,
    read,
    byType,
    readRate: total > 0 ? (read / total) * 100 : 0,
  };
};

/**
 * Validar configuración de notificaciones
 */
export const validateNotificationConfig = (
  config: any,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config) {
    errors.push("Configuration is required");
    return { isValid: false, errors };
  }

  if (
    typeof config.appName !== "string" ||
    config.appName.trim().length === 0
  ) {
    errors.push("appName must be a non-empty string");
  }

  if (
    typeof config.appVersion !== "string" ||
    config.appVersion.trim().length === 0
  ) {
    errors.push("appVersion must be a non-empty string");
  }

  // Validar configuración de horas de silencio
  if (config.quietHoursEnabled) {
    if (!config.quietHoursStart || !config.quietHoursEnd) {
      errors.push(
        "quietHoursStart and quietHoursEnd are required when quietHoursEnabled is true",
      );
    } else {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(config.quietHoursStart)) {
        errors.push("quietHoursStart must be in HH:mm format");
      }
      if (!timeRegex.test(config.quietHoursEnd)) {
        errors.push("quietHoursEnd must be in HH:mm format");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Crear configuración por defecto para notificaciones
 */
export const createDefaultNotificationConfig = () => ({
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
});

/**
 * Comparar dos configuraciones de notificaciones
 */
export const areNotificationPreferencesEqual = (
  prefs1: ExpoNotificationPreferences,
  prefs2: ExpoNotificationPreferences,
): boolean => {
  const keys = Object.keys(prefs1) as Array<keyof ExpoNotificationPreferences>;

  for (const key of keys) {
    if (prefs1[key] !== prefs2[key]) {
      return false;
    }
  }

  return true;
};

/**
 * Obtener icono/emoji para tipo de notificación
 */
export const getNotificationIcon = (type: ExpoNotificationType): string => {
  const iconMap: Record<ExpoNotificationType, string> = {
    RIDE_REQUEST: "🚗",
    RIDE_ACCEPTED: "✅",
    RIDE_CANCELLED: "❌",
    DRIVER_ARRIVED: "🚶",
    RIDE_STARTED: "🚀",
    RIDE_COMPLETED: "🎯",
    PAYMENT_SUCCESS: "💰",
    CHAT_MESSAGE: "💬",
    EMERGENCY_ALERT: "🚨",
    SYSTEM_UPDATE: "🔄",
    PROMOTIONAL: "🎉",
    MAINTENANCE: "🔧",
  };

  return iconMap[type] || "📱";
};

/**
 * Obtener color para tipo de notificación (para UI)
 */
export const getNotificationColor = (type: ExpoNotificationType): string => {
  const colorMap: Record<ExpoNotificationType, string> = {
    RIDE_REQUEST: "#0286FF",
    RIDE_ACCEPTED: "#10B981",
    RIDE_CANCELLED: "#EF4444",
    DRIVER_ARRIVED: "#F59E0B",
    RIDE_STARTED: "#8B5CF6",
    RIDE_COMPLETED: "#06B6D4",
    PAYMENT_SUCCESS: "#84CC16",
    CHAT_MESSAGE: "#EC4899",
    EMERGENCY_ALERT: "#DC2626",
    SYSTEM_UPDATE: "#6B7280",
    PROMOTIONAL: "#F97316",
    MAINTENANCE: "#64748B",
  };

  return colorMap[type] || "#6B7280";
};
