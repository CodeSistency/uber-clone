import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { log } from "@/lib/logger";

import {
  ExpoNotificationConfig,
  ExpoNotificationChannel,
  ExpoNotificationChannelGroup,
} from "../../types/expo-notifications";

/**
 * Configuración centralizada para Expo Notifications
 * Sistema independiente del servicio Firebase existente
 */
class ExpoNotificationConfigManager {
  private static instance: ExpoNotificationConfigManager;
  private config: ExpoNotificationConfig | null = null;

  static getInstance(): ExpoNotificationConfigManager {
    if (!ExpoNotificationConfigManager.instance) {
      ExpoNotificationConfigManager.instance =
        new ExpoNotificationConfigManager();
    }
    return ExpoNotificationConfigManager.instance;
  }

  /**
   * Obtener configuración completa de Expo Notifications
   */
  getConfig(): ExpoNotificationConfig {
    if (!this.config) {
      this.config = this.buildConfig();
    }
    return this.config;
  }

  /**
   * Construir configuración desde variables de entorno y valores por defecto
   */
  private buildConfig(): ExpoNotificationConfig {
    const expoConfig = Constants.expoConfig;

    const config: ExpoNotificationConfig = {
      // App configuration
      projectId:
        expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.slug,
      appName: expoConfig?.name || "Uber Clone",
      appVersion: expoConfig?.version || "1.0.0",

      // Platform specific settings
      ios:
        Platform.OS === "ios"
          ? {
              iconBadgeNumber: 0,
              criticalSoundEnabled: false,
            }
          : undefined,

      android:
        Platform.OS === "android"
          ? {
              channelGroups: this.getDefaultChannelGroups(),
              defaultChannelId: "default",
              iconResource: "@mipmap/ic_launcher",
              smallIconResource: "@mipmap/ic_notification",
            }
          : undefined,

      // Behavior settings from environment or defaults
      autoDismiss: this.getEnvBoolean(
        "EXPO_PUBLIC_NOTIFICATIONS_AUTO_DISMISS",
        true,
      ),
      showInForeground: this.getEnvBoolean(
        "EXPO_PUBLIC_NOTIFICATIONS_FOREGROUND",
        true,
      ),
      playSound: this.getEnvBoolean("EXPO_PUBLIC_NOTIFICATIONS_SOUND", true),
      vibrate: this.getEnvBoolean("EXPO_PUBLIC_NOTIFICATIONS_VIBRATE", true),
      showBadge: this.getEnvBoolean("EXPO_PUBLIC_NOTIFICATIONS_BADGE", true),

      // Retry and timeout settings
      retryAttempts: this.getEnvNumber(
        "EXPO_PUBLIC_NOTIFICATIONS_RETRY_ATTEMPTS",
        3,
      ),
      retryDelay: this.getEnvNumber(
        "EXPO_PUBLIC_NOTIFICATIONS_RETRY_DELAY",
        1000,
      ),
      requestTimeout: this.getEnvNumber(
        "EXPO_PUBLIC_NOTIFICATIONS_TIMEOUT",
        30000,
      ),
    };

    log.info("ExpoNotificationConfig", "Configuration built", {
      platform: Platform.OS,
      projectId: config.projectId,
      appName: config.appName,
      hasAndroidConfig: !!config.android,
      hasIosConfig: !!config.ios,
    });

    return config;
  }

  /**
   * Grupos de canales por defecto para Android
   */
  private getDefaultChannelGroups(): ExpoNotificationChannelGroup[] {
    return [
      {
        id: "rides",
        name: "Viajes",
        channels: [
          {
            id: "ride_requests",
            name: "Solicitudes de Viaje",
            importance: "high",
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#0286FF",
            sound: "default",
            showBadge: true,
            bypassDnd: false,
          },
          {
            id: "ride_updates",
            name: "Actualizaciones de Viaje",
            importance: "high",
            vibrationPattern: [0, 150, 150, 150],
            lightColor: "#10B981",
            sound: "default",
            showBadge: true,
            bypassDnd: false,
          },
          {
            id: "ride_completed",
            name: "Viajes Completados",
            importance: "default",
            vibrationPattern: [0, 100, 100, 100],
            lightColor: "#F59E0B",
            sound: "default",
            showBadge: true,
            bypassDnd: false,
          },
        ],
      },
      {
        id: "communication",
        name: "Comunicación",
        channels: [
          {
            id: "chat_messages",
            name: "Mensajes de Chat",
            importance: "default",
            vibrationPattern: [0, 100, 100, 100],
            lightColor: "#8B5CF6",
            sound: "default",
            showBadge: true,
            bypassDnd: false,
          },
          {
            id: "driver_messages",
            name: "Mensajes del Conductor",
            importance: "high",
            vibrationPattern: [0, 200, 200, 200],
            lightColor: "#EF4444",
            sound: "default",
            showBadge: true,
            bypassDnd: true,
          },
        ],
      },
      {
        id: "system",
        name: "Sistema",
        channels: [
          {
            id: "emergency",
            name: "Emergencias",
            importance: "high",
            vibrationPattern: [0, 1000, 500, 1000],
            lightColor: "#DC2626",
            sound: "default",
            showBadge: true,
            bypassDnd: true,
          },
          {
            id: "promotional",
            name: "Promocionales",
            importance: "low",
            vibrationPattern: [],
            lightColor: "#6B7280",
            sound: "none",
            showBadge: false,
            bypassDnd: false,
          },
          {
            id: "default",
            name: "General",
            importance: "default",
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#0286FF",
            sound: "default",
            showBadge: true,
            bypassDnd: false,
          },
        ],
      },
    ];
  }

  /**
   * Configurar NotificationHandler global
   */
  setupNotificationHandler(): void {
    const config = this.getConfig();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: config.showInForeground,
        shouldPlaySound: config.playSound,
        shouldSetBadge: config.showBadge,
        shouldShowBanner: config.showInForeground,
        shouldShowList: config.showInForeground,
      }),
    });

    log.info("ExpoNotificationConfig", "Notification handler configured", {
      showInForeground: config.showInForeground,
      playSound: config.playSound,
      showBadge: config.showBadge,
    });
  }

  /**
   * Crear canales de notificación en Android
   */
  async setupAndroidChannels(): Promise<void> {
    if (Platform.OS !== "android" || !this.config?.android) {
      return;
    }

    try {
      // Crear canales individuales
      for (const group of this.config.android!.channelGroups) {
        for (const channel of group.channels) {
          await Notifications.setNotificationChannelAsync(channel.id, {
            name: channel.name,
            importance: this.mapImportanceToAndroid(channel.importance),
            vibrationPattern: channel.vibrationPattern,
            lightColor: channel.lightColor,
            bypassDnd: channel.bypassDnd,
            showBadge: channel.showBadge,
            sound: channel.sound === "default" ? "default" : undefined,
          });

          log.debug("ExpoNotificationConfig", "Android channel created", {
            channelId: channel.id,
            name: channel.name,
            importance: channel.importance,
          });
        }
      }

      log.info(
        "ExpoNotificationConfig",
        "Android notification channels setup complete",
        {
          channelGroupsCount: this.config.android.channelGroups.length,
          totalChannels: this.config.android.channelGroups.reduce(
            (sum, group) => sum + group.channels.length,
            0,
          ),
        },
      );
    } catch (error) {
      log.error(
        "ExpoNotificationConfig",
        "Failed to setup Android channels",
        {
          error: (error as Error)?.message,
        },
        error instanceof Error ? error : undefined,
      );
      throw error;
    }
  }

  /**
   * Mapear importancia de canal a valores de Android
   */
  private mapImportanceToAndroid(
    importance: "default" | "high" | "low" | "min",
  ): Notifications.AndroidImportance {
    switch (importance) {
      case "min":
        return Notifications.AndroidImportance.MIN;
      case "low":
        return Notifications.AndroidImportance.LOW;
      case "default":
        return Notifications.AndroidImportance.DEFAULT;
      case "high":
        return Notifications.AndroidImportance.HIGH;
      default:
        return Notifications.AndroidImportance.DEFAULT;
    }
  }

  /**
   * Obtener valor booleano de variable de entorno
   */
  private getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === "true";
  }

  /**
   * Obtener valor numérico de variable de entorno
   */
  private getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Obtener canal por ID
   */
  getChannelById(channelId: string): ExpoNotificationChannel | null {
    if (!this.config?.android) return null;

    for (const group of this.config.android.channelGroups) {
      const channel = group.channels.find(
        (c: ExpoNotificationChannel) => c.id === channelId,
      );
      if (channel) return channel;
    }

    return null;
  }

  /**
   * Obtener canal recomendado para un tipo de notificación
   */
  getRecommendedChannelForType(type: string): string {
    const channelMapping: Record<string, string> = {
      RIDE_REQUEST: "ride_requests",
      RIDE_ACCEPTED: "ride_updates",
      RIDE_CANCELLED: "ride_updates",
      DRIVER_ARRIVED: "ride_updates",
      RIDE_STARTED: "ride_updates",
      RIDE_COMPLETED: "ride_completed",
      PAYMENT_SUCCESS: "ride_completed",
      CHAT_MESSAGE: "chat_messages",
      EMERGENCY_ALERT: "emergency",
      SYSTEM_UPDATE: "default",
      PROMOTIONAL: "promotional",
    };

    return channelMapping[type] || "default";
  }
}

// Exportar instancia singleton
export const expoNotificationConfig =
  ExpoNotificationConfigManager.getInstance();

// Exportar funciones de utilidad
export const getExpoNotificationConfig = () =>
  expoNotificationConfig.getConfig();
export const setupExpoNotificationHandler = () =>
  expoNotificationConfig.setupNotificationHandler();
export const setupExpoAndroidChannels = () =>
  expoNotificationConfig.setupAndroidChannels();
export const getExpoChannelById = (id: string) =>
  expoNotificationConfig.getChannelById(id);
export const getExpoRecommendedChannel = (type: string) =>
  expoNotificationConfig.getRecommendedChannelForType(type);
