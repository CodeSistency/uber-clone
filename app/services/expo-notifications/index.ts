// Exportar el servicio principal de notificaciones Expo
export {
  expoNotificationService,
  ExpoNotificationService,
} from "./expoNotificationService";

// Re-exportar tipos para conveniencia
export type {
  ExpoNotificationServiceInterface,
  ExpoNotificationPermissions,
  ExpoPushToken,
  ExpoNotificationData,
  ExpoNotificationType,
  ExpoNotificationEventType,
  ExpoNotificationEventMap,
} from "../../../types/expo-notifications";
