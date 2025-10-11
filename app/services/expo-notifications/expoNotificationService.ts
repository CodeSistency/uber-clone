import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { log } from "@/lib/logger";
import {
  expoNotificationConfig,
  setupExpoNotificationHandler,
  setupExpoAndroidChannels,
} from "@/lib/expo-notifications/config";
import {
  expoTokenManager,
  getExpoPushToken,
} from "@/lib/expo-notifications/tokenManager";
import { useExpoNotificationStore } from "@/store/expo-notifications/expoNotificationStore";

import {
  ExpoNotificationServiceInterface,
  ExpoNotificationError,
  ExpoNotificationData,
  ExpoNotificationType,
  ExpoPushToken,
  ExpoNotificationPermissions,
  ExpoNotificationEventType,
  ExpoNotificationEventMap,
} from "../../../types/expo-notifications";

/**
 * Servicio principal para Expo Notifications
 * Implementa patrón singleton y maneja todas las operaciones de notificaciones
 */
export class ExpoNotificationService
  implements ExpoNotificationServiceInterface
{
  private static instance: ExpoNotificationService;
  private isInitialized = false;
  private eventListeners: Map<string, { event: string; callback: Function }> =
    new Map();
  private notificationSubscription: Notifications.Subscription | null = null;
  private responseSubscription: Notifications.Subscription | null = null;

  // Debouncing para tokens (evitar llamadas excesivas)
  private tokenDebounceTimer: NodeJS.Timeout | null = null;
  private readonly TOKEN_DEBOUNCE_MS = 5000; // 5 segundos

  // Throttling para notificaciones locales
  private lastNotificationTime = 0;
  private readonly NOTIFICATION_THROTTLE_MS = 1000; // 1 segundo entre notificaciones

  static getInstance(): ExpoNotificationService {
    if (!ExpoNotificationService.instance) {
      ExpoNotificationService.instance = new ExpoNotificationService();
    }
    return ExpoNotificationService.instance;
  }

  /**
   * Inicializar el servicio de notificaciones
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      log.info("Service already initialized", {
        component: "ExpoNotificationService",
        action: "initialize",
        data: {}
      });
      return;
    }

    const operationId = `init_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      log.info("Initializing Expo Notification Service", {
        component: "ExpoNotificationService",
        action: "initialize",
        data: {
          operationId,
          platform: Platform.OS,
          deviceName: Device.deviceName,
          hasNotificationSupport: !!Notifications,
        },
      });

      // 1. Configurar handler global
      setupExpoNotificationHandler();

      // 2. Configurar canales Android si es necesario
      if (Platform.OS === "android") {
        await setupExpoAndroidChannels();
      }

      // 3. Obtener token push
      const token = await getExpoPushToken();
      if (token) {
        // Actualizar store con el token
        useExpoNotificationStore.getState().setToken(token);

        log.info("Push token obtained", {
          component: "ExpoNotificationService",
          action: "initialize",
          data: {
            operationId,
            tokenType: token.type,
            tokenPrefix: token.data.substring(0, 20) + "...",
          },
        });
      } else {
        log.warn("No push token available", {
          component: "ExpoNotificationService",
          action: "initialize",
          data: {
            operationId,
          },
        });
      }

      // 4. Configurar event listeners
      this.setupEventListeners();

      // 5. Verificar permisos
      const permissions = await this.checkPermissions();
      useExpoNotificationStore.getState().setPermissions(permissions);

      this.isInitialized = true;

      log.info("Expo Notification Service initialized successfully", {
        component: "ExpoNotificationService",
        action: "initialize",
        data: {
          operationId,
          hasToken: !!token,
          permissionsGranted: permissions.granted,
        },
      });
    } catch (error) {
      log.error("Failed to initialize service", {
        component: "ExpoNotificationService",
        action: "initialize",
        data: {
          operationId,
          error: (error as Error)?.message,
        },
      });

      throw new ExpoNotificationError(
        `Service initialization failed: ${(error as Error)?.message}`,
        ExpoNotificationError.INVALID_CONFIGURATION,
        { originalError: error },
      );
    }
  }

  /**
   * Destruir el servicio y limpiar recursos
   */
  async destroy(): Promise<void> {
    try {
      log.info("Destroying service", {
        component: "ExpoNotificationService",
        action: "destroy",
        data: {}
      });

      // Limpiar timers de debouncing
      if (this.tokenDebounceTimer) {
        clearTimeout(this.tokenDebounceTimer);
        this.tokenDebounceTimer = null;
      }

      // Remover event listeners
      this.removeAllListeners();

      // Cancelar suscripciones
      if (this.notificationSubscription) {
        Notifications.removeNotificationSubscription(
          this.notificationSubscription,
        );
        this.notificationSubscription = null;
      }

      if (this.responseSubscription) {
        Notifications.removeNotificationSubscription(this.responseSubscription);
        this.responseSubscription = null;
      }

      // Limpiar tokens
      await expoTokenManager.clearTokens();

      // Reset estado
      useExpoNotificationStore.getState().setToken(null);
      useExpoNotificationStore.getState().setPermissions(null);

      this.isInitialized = false;

      log.info("Service destroyed successfully", {
        component: "ExpoNotificationService",
        action: "destroy",
        data: {}
      });
    } catch (error) {
      log.error("Error destroying service", {
        component: "ExpoNotificationService",
        action: "destroy",
        data: {
          error: (error as Error)?.message,
        },
      });
    }
  }

  /**
   * Configurar event listeners para notificaciones
   */
  private setupEventListeners(): void {
    log.info("Setting up event listeners", {
      component: "ExpoNotificationService",
      action: "setupEventListeners",
      data: {}
    });

    // Listener para notificaciones recibidas (foreground)
    this.notificationSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        log.info("Notification received in foreground", {
          component: "ExpoNotificationService",
          action: "notificationReceived",
          data: {
            notificationId: notification.request.identifier,
            title: notification.request.content.title,
            hasData: !!notification.request.content.data,
          },
        });

        this.handleNotificationReceived(notification);
      });

    // Listener para respuestas a notificaciones (taps)
    this.responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        log.info("Notification response received", {
          component: "ExpoNotificationService",
          action: "notificationResponse",
          data: {
            notificationId: response.notification.request.identifier,
            action: response.actionIdentifier,
            hasInput: !!response.userText,
          },
        });

        this.handleNotificationResponse(response);
      });

    log.info("Event listeners configured successfully", {
      component: "ExpoNotificationService",
      action: "setupEventListeners",
      data: {}
    });
  }

  /**
   * Manejar notificación recibida
   */
  private handleNotificationReceived(
    notification: Notifications.Notification,
  ): void {
    try {
      const { title, body, data } = notification.request.content;

      // Crear objeto de notificación para el store
      const notificationData: ExpoNotificationData = {
        id: notification.request.identifier,
        title: title || "Notification",
        message: body || "",
        data: data || {},
        timestamp: new Date(notification.date),
        type: (data?.type as ExpoNotificationType) || "SYSTEM_UPDATE",
        priority:
          (data?.priority as "low" | "normal" | "high" | "critical") ||
          "normal",
        isRead: false,
      };

      // Agregar al store
      useExpoNotificationStore.getState().addNotification(notificationData);

      // Trigger haptic feedback para notificaciones importantes
      if (
        notificationData.priority === "high" ||
        notificationData.priority === "critical"
      ) {
        this.triggerHapticFeedback();
      }

      // Emitir evento interno
      this.emitEvent("notificationReceived", notification);
    } catch (error) {
      log.error("Error handling notification received", {
        component: "ExpoNotificationService",
        action: "handleNotificationReceived",
        data: {
          error: (error as Error)?.message,
        },
      });
    }
  }

  /**
   * Manejar respuesta a notificación (tap)
   */
  private handleNotificationResponse(
    response: Notifications.NotificationResponse,
  ): void {
    try {
      const notificationId = response.notification.request.identifier;
      const { data } = response.notification.request.content;

      // Marcar como leída
      useExpoNotificationStore.getState().markAsRead(notificationId);

      // Emitir evento interno
      this.emitEvent("notificationResponse", response);

      // TODO: Implementar navegación basada en el tipo de notificación
      log.debug("Navigation handling pending", {
        component: "ExpoNotificationService",
        action: "handleNotificationResponse",
        data: {
          notificationId,
          data,
        },
      });
    } catch (error) {
      log.error("Error handling notification response", {
        component: "ExpoNotificationService",
        action: "handleNotificationResponse",
        data: {
          error: (error as Error)?.message,
        },
      });
    }
  }

  /**
   * Trigger haptic feedback
   */
  private async triggerHapticFeedback(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      log.debug("Haptic feedback not available", {
        component: "ExpoNotificationService",
        action: "playHapticFeedback",
        data: {}
      });
    }
  }

  // ========== TOKEN MANAGEMENT ==========

  async getPushToken(): Promise<ExpoPushToken | null> {
    this.ensureInitialized();

    // Implementar debouncing para evitar llamadas excesivas
    return new Promise((resolve) => {
      if (this.tokenDebounceTimer) {
        clearTimeout(this.tokenDebounceTimer);
      }

      this.tokenDebounceTimer = setTimeout(async () => {
        try {
          const token = await expoTokenManager.getPushToken();
          resolve(token);
        } catch (error) {
          log.error("Error in debounced getPushToken", {
            component: "ExpoNotificationService",
            action: "getPushToken",
            data: {
              error: (error as Error)?.message,
            },
          });
          resolve(null);
        }
      }, this.TOKEN_DEBOUNCE_MS);
    });
  }

  async refreshToken(): Promise<ExpoPushToken | null> {
    this.ensureInitialized();

    try {
      const newToken = await expoTokenManager.refreshToken();
      if (newToken) {
        useExpoNotificationStore.getState().setToken(newToken);
      }
      return newToken;
    } catch (error) {
      log.error("Failed to refresh token", {
        component: "ExpoNotificationService",
        action: "refreshPushToken",
        data: {
          error: (error as Error)?.message,
        },
      });
      throw error;
    }
  }

  // ========== PERMISSIONS ==========

  async requestPermissions(): Promise<ExpoNotificationPermissions> {
    try {
      log.info("Requesting notification permissions", {
        component: "ExpoNotificationService",
        action: "requestPermissions",
        data: {}
      });

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const permissions: ExpoNotificationPermissions = {
        granted: finalStatus === "granted",
        canAskAgain: finalStatus !== "denied",
        status: finalStatus,
      };

      // Actualizar store
      useExpoNotificationStore.getState().setPermissions(permissions);

      log.info("Permissions result", {
        component: "ExpoNotificationService",
        action: "requestPermissions",
        data: {
          granted: permissions.granted,
          canAskAgain: permissions.canAskAgain,
          status: permissions.status,
        },
      });

      return permissions;
    } catch (error) {
      log.error("Error requesting permissions", {
        component: "ExpoNotificationService",
        action: "requestPermissions",
        data: {
          error: (error as Error)?.message,
        },
      });
      throw error;
    }
  }

  async checkPermissions(): Promise<ExpoNotificationPermissions> {
    try {
      const { status } = await Notifications.getPermissionsAsync();

      const permissions: ExpoNotificationPermissions = {
        granted: status === "granted",
        canAskAgain: status !== "denied",
        status,
      };

      return permissions;
    } catch (error) {
      log.error("Error checking permissions", {
        component: "ExpoNotificationService",
        action: "checkPermissions",
        data: {
          error: (error as Error)?.message,
        },
      });
      throw error;
    }
  }

  // ========== NOTIFICATIONS ==========

  async sendLocalNotification(
    title: string,
    body: string,
    data?: any,
    options?: any,
  ): Promise<string> {
    this.ensureInitialized();

    // Implementar throttling para evitar spam de notificaciones
    const now = Date.now();
    const timeSinceLastNotification = now - this.lastNotificationTime;

    if (timeSinceLastNotification < this.NOTIFICATION_THROTTLE_MS) {
      const waitTime =
        this.NOTIFICATION_THROTTLE_MS - timeSinceLastNotification;
      log.warn("Throttling notification send", {
        component: "ExpoNotificationService",
        action: "sendNotification",
        data: {
          waitTime,
          lastNotificationTime: this.lastNotificationTime,
        },
      });

      // Esperar el tiempo restante antes de enviar
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastNotificationTime = Date.now();

    try {
      const config = expoNotificationConfig.getConfig();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          subtitle: null,
          body,
          data: data || {},
          sound: config.playSound ? "default" : undefined,
          ...options,
        },
        trigger: null, // Enviar inmediatamente
      });

      // Agregar al store
      const notificationData: ExpoNotificationData = {
        id: notificationId,
        title,
        message: body,
        data: data || {},
        timestamp: new Date(),
        type: (data?.type as ExpoNotificationType) || "SYSTEM_UPDATE",
        priority: "normal",
        isRead: false,
      };

      useExpoNotificationStore.getState().addNotification(notificationData);

      log.info("Local notification sent", {
        component: "ExpoNotificationService",
        action: "sendNotification",
        data: {
          notificationId,
          title,
        },
      });

      return notificationId;
    } catch (error) {
      log.error("Failed to send local notification", {
        component: "ExpoNotificationService",
        action: "sendNotification",
        data: {
          title,
          error: (error as Error)?.message,
        },
      });
      throw error;
    }
  }

  async scheduleNotification(
    title: string,
    body: string,
    trigger: any,
    data?: any,
    options?: any,
  ): Promise<string> {
    this.ensureInitialized();

    try {
      const config = expoNotificationConfig.getConfig();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: config.playSound ? "default" : undefined,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          ...options,
        },
        trigger,
      });

      log.info("Notification scheduled", {
        component: "ExpoNotificationService",
        action: "scheduleNotification",
        data: {
          notificationId,
          title,
          triggerType:
            trigger && typeof trigger === "object"
              ? Object.keys(trigger)[0]
              : String(trigger),
        },
      });

      return notificationId;
    } catch (error) {
      log.error("Failed to schedule notification", {
        component: "ExpoNotificationService",
        action: "scheduleNotification",
        data: {
          title,
          error: (error as Error)?.message,
        },
      });
      throw error;
    }
  }

  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      log.info("Notification cancelled", {
        component: "ExpoNotificationService",
        action: "cancelNotification",
        data: {
          identifier,
        },
      });
    } catch (error) {
      log.error("Failed to cancel notification", {
        component: "ExpoNotificationService",
        action: "cancelNotification",
        data: {
          identifier,
          error: (error as Error)?.message,
        },
      });
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      log.info("All notifications cancelled", {
        component: "ExpoNotificationService",
        action: "cancelAllNotifications",
        data: {}
      });
    } catch (error) {
      log.error("Failed to cancel all notifications", {
        component: "ExpoNotificationService",
        action: "cancelAllNotifications",
        data: {
          error: (error as Error)?.message,
        },
      });
      throw error;
    }
  }

  // ========== BADGE MANAGEMENT ==========

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      log.debug("Badge count set", {
        component: "ExpoNotificationService",
        action: "setBadgeCount",
        data: { count }
      });
    } catch (error) {
      log.error("Failed to set badge count", {
        component: "ExpoNotificationService",
        action: "setBadgeCount",
        data: {
          count,
          error: (error as Error)?.message,
        },
      });
      throw error;
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return count;
    } catch (error) {
      log.error("Failed to get badge count", {
        component: "ExpoNotificationService",
        action: "getBadgeCount",
        data: {
          error: (error as Error)?.message,
        },
      });
      return 0;
    }
  }

  async clearBadge(): Promise<void> {
    return this.setBadgeCount(0);
  }

  // ========== ANDROID CHANNELS ==========

  async createChannel(channel: any): Promise<void> {
    if (Platform.OS !== "android") return;

    try {
      await Notifications.setNotificationChannelAsync(channel.id, channel);
      log.info("Android channel created", {
        component: "ExpoNotificationService",
        action: "createChannel",
        data: {
          channelId: channel.id,
          name: channel.name,
        },
      });
    } catch (error) {
      log.error("Failed to create Android channel", {
        component: "ExpoNotificationService",
        action: "createChannel",
        data: {
          channelId: channel.id,
          error: (error as Error)?.message,
        },
      });
      throw error;
    }
  }

  async deleteChannel(channelId: string): Promise<void> {
    if (Platform.OS !== "android") return;

    try {
      await Notifications.deleteNotificationChannelAsync(channelId);
      log.info("Android channel deleted", {
        component: "ExpoNotificationService",
        action: "deleteChannel",
        data: {
          channelId,
        },
      });
    } catch (error) {
      log.error("Failed to delete Android channel", {
        component: "ExpoNotificationService",
        action: "deleteChannel",
        data: {
          channelId,
          error: (error as Error)?.message,
        },
      });
      throw error;
    }
  }

  async getChannels(): Promise<any[]> {
    if (Platform.OS !== "android") return [];

    try {
      const channels = await Notifications.getNotificationChannelsAsync();
      return channels;
    } catch (error) {
      log.error("Failed to get Android channels", {
        component: "ExpoNotificationService",
        action: "getChannels",
        data: {
          error: (error as Error)?.message,
        },
      });
      return [];
    }
  }

  // ========== EVENT MANAGEMENT ==========

  addEventListener<T extends ExpoNotificationEventType>(
    event: T,
    callback: ExpoNotificationEventMap[T],
  ): string {
    const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.eventListeners.set(listenerId, {
      event,
      callback: callback as Function,
    });

    log.debug("Event listener added", {
      component: "ExpoNotificationService",
      action: "addEventListener",
      data: {
        listenerId,
        event,
      },
    });

    return listenerId;
  }

  removeEventListener(identifier: string): boolean {
    const removed = this.eventListeners.delete(identifier);

    if (removed) {
      log.debug("Event listener removed", {
        component: "ExpoNotificationService",
        action: "removeEventListener",
        data: {
          identifier,
        },
      });
    }

    return removed;
  }

  removeAllListeners(event?: ExpoNotificationEventType): void {
    if (event) {
      const listenersToRemove: string[] = [];

      for (const [id, listener] of this.eventListeners) {
        if (listener.event === event) {
          listenersToRemove.push(id);
        }
      }

      listenersToRemove.forEach((id) => this.eventListeners.delete(id));
      log.debug("All listeners removed for event", {
        component: "ExpoNotificationService",
        action: "removeAllEventListeners",
        data: {
          event,
          removedCount: listenersToRemove.length,
        },
      });
    } else {
      const removedCount = this.eventListeners.size;
      this.eventListeners.clear();
      log.debug("All event listeners removed", {
        component: "ExpoNotificationService",
        action: "removeAllEventListeners",
        data: {
          removedCount,
        },
      });
    }
  }

  private emitEvent(event: string, data: any): void {
    const listeners = Array.from(this.eventListeners.values()).filter(
      (listener) => listener.event === event,
    );

    log.debug("Emitting event", {
      component: "ExpoNotificationService",
      action: "emitEvent",
      data: {
        event,
        listenerCount: listeners.length,
      },
    });

    listeners.forEach(({ callback }) => {
      try {
        callback(data);
      } catch (error) {
        log.error("Error in event listener", {
          component: "ExpoNotificationService",
          action: "emitEvent",
          data: {
            event,
            error: (error as Error)?.message,
          },
        });
      }
    });
  }

  // ========== UTILITY METHODS ==========

  getNotificationContent(
    type: ExpoNotificationType,
    data?: any,
  ): { title: string; body: string } {
    switch (type) {
      case "RIDE_REQUEST":
        return {
          title: "New Ride Request",
          body: `Pickup at ${data?.pickupLocation || "your location"}`,
        };

      case "RIDE_ACCEPTED":
        return {
          title: "Driver Found!",
          body: `Your driver ${data?.driverName || "is on the way"}`,
        };

      case "RIDE_CANCELLED":
        return {
          title: "Ride Cancelled",
          body: "Your ride has been cancelled by the driver",
        };

      case "DRIVER_ARRIVED":
        return {
          title: "Driver Arrived",
          body: "Your driver is waiting outside",
        };

      case "RIDE_STARTED":
        return {
          title: "Ride Started",
          body: "Enjoy your ride!",
        };

      case "RIDE_COMPLETED":
        return {
          title: "Ride Completed",
          body: `Total: $${data?.fare || "0.00"}`,
        };

      case "CHAT_MESSAGE":
        return {
          title: "New Message",
          body: data?.preview || "You have a new message",
        };

      case "EMERGENCY_ALERT":
        return {
          title: "Emergency Alert",
          body: "Emergency services have been notified",
        };

      default:
        return {
          title: "Uber",
          body: "You have a new notification",
        };
    }
  }

  simulateNotification(data: {
    title: string;
    body: string;
    data?: any;
    type?: "foreground" | "background";
  }): void {
    log.info("Simulating notification", {
      component: "ExpoNotificationService",
      action: "simulateNotification",
      data: {
        title: data.title,
        type: data.type || "foreground",
      },
    });

    // Crear notificación mock para testing
    const mockNotification: Notifications.Notification = {
      request: {
        identifier: `simulated_${Date.now()}`,
        content: {
          title: data.title,
          subtitle: null,
          body: data.body,
          data: data.data || {},
          sound: "default",
          categoryIdentifier: null,
        },
        trigger: { type: "push" },
      },
      date: Date.now(),
    };

    // Simular recepción
    this.handleNotificationReceived(mockNotification);

    log.info("Notification simulation completed", {
      component: "ExpoNotificationService",
      action: "simulateNotification",
      data: {}
    });
  }

  // ========== PRIVATE METHODS ==========

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new ExpoNotificationError(
        "ExpoNotificationService not initialized. Call initialize() first.",
        ExpoNotificationError.INVALID_CONFIGURATION,
      );
    }
  }
}

// Exportar instancia singleton
export const expoNotificationService = ExpoNotificationService.getInstance();
