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
      log.info("ExpoNotificationService", "Service already initialized");
      return;
    }

    const operationId = `init_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      log.info(
        "ExpoNotificationService",
        "Initializing Expo Notification Service",
        {
          operationId,
          platform: Platform.OS,
          deviceName: Device.deviceName,
          hasNotificationSupport: !!Notifications,
        },
      );

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

        log.info("ExpoNotificationService", "Push token obtained", {
          operationId,
          tokenType: token.type,
          tokenPrefix: token.data.substring(0, 20) + "...",
        });
      } else {
        log.warn("ExpoNotificationService", "No push token available", {
          operationId,
        });
      }

      // 4. Configurar event listeners
      this.setupEventListeners();

      // 5. Verificar permisos
      const permissions = await this.checkPermissions();
      useExpoNotificationStore.getState().setPermissions(permissions);

      this.isInitialized = true;

      log.info(
        "ExpoNotificationService",
        "Expo Notification Service initialized successfully",
        {
          operationId,
          hasToken: !!token,
          permissionsGranted: permissions.granted,
        },
      );
    } catch (error) {
      log.error(
        "ExpoNotificationService",
        "Failed to initialize service",
        {
          operationId,
          error: (error as Error)?.message,
        },
        error instanceof Error ? error : undefined,
      );

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
      log.info("ExpoNotificationService", "Destroying service");

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

      log.info("ExpoNotificationService", "Service destroyed successfully");
    } catch (error) {
      log.error("ExpoNotificationService", "Error destroying service", {
        error: (error as Error)?.message,
      });
    }
  }

  /**
   * Configurar event listeners para notificaciones
   */
  private setupEventListeners(): void {
    log.info("ExpoNotificationService", "Setting up event listeners");

    // Listener para notificaciones recibidas (foreground)
    this.notificationSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        log.info(
          "ExpoNotificationService",
          "Notification received in foreground",
          {
            notificationId: notification.request.identifier,
            title: notification.request.content.title,
            hasData: !!notification.request.content.data,
          },
        );

        this.handleNotificationReceived(notification);
      });

    // Listener para respuestas a notificaciones (taps)
    this.responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        log.info("ExpoNotificationService", "Notification response received", {
          notificationId: response.notification.request.identifier,
          action: response.actionIdentifier,
          hasInput: !!response.userText,
        });

        this.handleNotificationResponse(response);
      });

    log.info(
      "ExpoNotificationService",
      "Event listeners configured successfully",
    );
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
      log.error(
        "ExpoNotificationService",
        "Error handling notification received",
        {
          error: (error as Error)?.message,
        },
      );
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
      log.debug("ExpoNotificationService", "Navigation handling pending", {
        notificationId,
        data,
      });
    } catch (error) {
      log.error(
        "ExpoNotificationService",
        "Error handling notification response",
        {
          error: (error as Error)?.message,
        },
      );
    }
  }

  /**
   * Trigger haptic feedback
   */
  private async triggerHapticFeedback(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      log.debug("ExpoNotificationService", "Haptic feedback not available");
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
          log.error(
            "ExpoNotificationService",
            "Error in debounced getPushToken",
            {
              error: (error as Error)?.message,
            },
          );
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
      log.error("ExpoNotificationService", "Failed to refresh token", {
        error: (error as Error)?.message,
      });
      throw error;
    }
  }

  // ========== PERMISSIONS ==========

  async requestPermissions(): Promise<ExpoNotificationPermissions> {
    try {
      log.info(
        "ExpoNotificationService",
        "Requesting notification permissions",
      );

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

      log.info("ExpoNotificationService", "Permissions result", {
        granted: permissions.granted,
        canAskAgain: permissions.canAskAgain,
        status: permissions.status,
      });

      return permissions;
    } catch (error) {
      log.error("ExpoNotificationService", "Error requesting permissions", {
        error: (error as Error)?.message,
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
      log.error("ExpoNotificationService", "Error checking permissions", {
        error: (error as Error)?.message,
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
      log.warn("ExpoNotificationService", "Throttling notification send", {
        waitTime,
        lastNotificationTime: this.lastNotificationTime,
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

      log.info("ExpoNotificationService", "Local notification sent", {
        notificationId,
        title,
      });

      return notificationId;
    } catch (error) {
      log.error(
        "ExpoNotificationService",
        "Failed to send local notification",
        {
          title,
          error: (error as Error)?.message,
        },
      );
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

      log.info("ExpoNotificationService", "Notification scheduled", {
        notificationId,
        title,
        triggerType:
          trigger && typeof trigger === "object"
            ? Object.keys(trigger)[0]
            : String(trigger),
      });

      return notificationId;
    } catch (error) {
      log.error("ExpoNotificationService", "Failed to schedule notification", {
        title,
        error: (error as Error)?.message,
      });
      throw error;
    }
  }

  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      log.info("ExpoNotificationService", "Notification cancelled", {
        identifier,
      });
    } catch (error) {
      log.error("ExpoNotificationService", "Failed to cancel notification", {
        identifier,
        error: (error as Error)?.message,
      });
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      log.info("ExpoNotificationService", "All notifications cancelled");
    } catch (error) {
      log.error(
        "ExpoNotificationService",
        "Failed to cancel all notifications",
        {
          error: (error as Error)?.message,
        },
      );
      throw error;
    }
  }

  // ========== BADGE MANAGEMENT ==========

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      log.debug("ExpoNotificationService", "Badge count set", { count });
    } catch (error) {
      log.error("ExpoNotificationService", "Failed to set badge count", {
        count,
        error: (error as Error)?.message,
      });
      throw error;
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return count;
    } catch (error) {
      log.error("ExpoNotificationService", "Failed to get badge count", {
        error: (error as Error)?.message,
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
      log.info("ExpoNotificationService", "Android channel created", {
        channelId: channel.id,
        name: channel.name,
      });
    } catch (error) {
      log.error("ExpoNotificationService", "Failed to create Android channel", {
        channelId: channel.id,
        error: (error as Error)?.message,
      });
      throw error;
    }
  }

  async deleteChannel(channelId: string): Promise<void> {
    if (Platform.OS !== "android") return;

    try {
      await Notifications.deleteNotificationChannelAsync(channelId);
      log.info("ExpoNotificationService", "Android channel deleted", {
        channelId,
      });
    } catch (error) {
      log.error("ExpoNotificationService", "Failed to delete Android channel", {
        channelId,
        error: (error as Error)?.message,
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
      log.error("ExpoNotificationService", "Failed to get Android channels", {
        error: (error as Error)?.message,
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

    log.debug("ExpoNotificationService", "Event listener added", {
      listenerId,
      event,
    });

    return listenerId;
  }

  removeEventListener(identifier: string): boolean {
    const removed = this.eventListeners.delete(identifier);

    if (removed) {
      log.debug("ExpoNotificationService", "Event listener removed", {
        identifier,
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
      log.debug("ExpoNotificationService", "All listeners removed for event", {
        event,
        removedCount: listenersToRemove.length,
      });
    } else {
      const removedCount = this.eventListeners.size;
      this.eventListeners.clear();
      log.debug("ExpoNotificationService", "All event listeners removed", {
        removedCount,
      });
    }
  }

  private emitEvent(event: string, data: any): void {
    const listeners = Array.from(this.eventListeners.values()).filter(
      (listener) => listener.event === event,
    );

    log.debug("ExpoNotificationService", "Emitting event", {
      event,
      listenerCount: listeners.length,
    });

    listeners.forEach(({ callback }) => {
      try {
        callback(data);
      } catch (error) {
        log.error("ExpoNotificationService", "Error in event listener", {
          event,
          error: (error as Error)?.message,
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
    log.info("ExpoNotificationService", "Simulating notification", {
      title: data.title,
      type: data.type || "foreground",
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

    log.info("ExpoNotificationService", "Notification simulation completed");
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
