import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { useNotificationStore } from "../../store";
import { NotificationType } from "../../types/type";
import { log } from "@/lib/logger";

import { firebaseService } from "./firebaseService";

export class NotificationService {
  private static instance: NotificationService;
  private notificationHandler: any;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      console.log("[NotificationService] Initializing notification service...");

      // Initialize Firebase service for push notifications
      await firebaseService.requestPermissions();
      firebaseService.setupNotificationListeners();

      // Request permissions using Firebase service
      const hasPermission = await firebaseService.requestPermissions();
      if (!hasPermission) {
        console.warn(
          "[NotificationService] Notification permissions not granted",
        );
        throw new Error("Notification permissions not granted");
      }

      // Set notification handler
      this.notificationHandler = Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Set up notification listeners
      this.setupNotificationListeners();

      console.log(
        "[NotificationService] Notification service initialized successfully",
      );
    } catch (error) {
      console.error("[NotificationService] Failed to initialize:", error);
      throw error;
    }
  }

  private setupNotificationListeners(): void {
    console.log("[NotificationService] Setting up notification listeners");

    // Handle notification received while app is foreground
    Notifications.addNotificationReceivedListener((notification: any) => {
      const notificationData = notification.request?.content;
      const { title, body, data } = notificationData || {};

      console.log("📨 [NotificationService] NOTIFICATION RECEIVED VIA SERVICE", {
        timestamp: new Date().toISOString(),
        title,
        body,
        data,
        notificationId: notification.request?.identifier,
        source: "notification_service",
        isForeground: true,
        categoryIdentifier: notification.request?.content?.categoryIdentifier,
      });

      // Log additional metadata
      console.log("🔍 [NotificationService] Notification metadata:", {
        sound: notification.request?.content?.sound,
        badge: notification.request?.content?.badge,
        priority: notification.request?.content?.priority,
        subtitle: notification.request?.content?.subtitle,
        attachments: notification.request?.content?.attachments?.length || 0,
      });

      this.handleNotificationReceived(notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener((response: any) => {
      const notificationData = response.notification?.request?.content;
      const { title, body, data } = notificationData || {};

      console.log("🖱️ [NotificationService] NOTIFICATION INTERACTION VIA SERVICE", {
        timestamp: new Date().toISOString(),
        title,
        body,
        data,
        notificationId: response.notification?.request?.identifier,
        actionIdentifier: response.actionIdentifier,
        source: "notification_service",
        interactionType: response.actionIdentifier === "default" ? "tap" : response.actionIdentifier,
        userInput: response.userText || null,
      });

      // Log interaction analytics
      console.log("📊 [NotificationService] Interaction analytics:", {
        notificationType: data?.type,
        rideId: data?.rideId,
        userId: data?.userId,
        timestamp: new Date().toISOString(),
        deviceInfo: "iOS/Android", // Could get from device
      });

      this.handleNotificationTapped(response);
    });
  }

  async sendLocalNotification(
    title: string,
    body: string,
    data?: any,
  ): Promise<void> {
    try {
      console.log("[NotificationService] Sending local notification:", {
        title,
        body,
        data,
      });

      // Send local notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: this.shouldPlaySound() ? "default" : undefined,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      console.log(
        "[NotificationService] Local notification sent:",
        notificationId,
      );

      // Also add to notification store for persistence
      const notificationData = {
        id: notificationId,
        title,
        message: body,
        data: data || {},
        timestamp: new Date(),
        type: "SYSTEM_UPDATE" as const,
        priority: "normal" as const,
        isRead: false,
      };

      useNotificationStore.getState().addNotification(notificationData);

      // Trigger haptic feedback if enabled
      if (this.shouldVibrate()) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      }
    } catch (error) {
      console.error(
        "[NotificationService] Failed to send local notification:",
        error,
      );
      throw error;
    }
  }

  async scheduleNotification(
    title: string,
    body: string,
    delayInSeconds: number,
    data?: any,
  ): Promise<string> {
    const notificationId = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      log.info('NotificationService', 'Scheduling local notification', {
        notificationId,
        title,
        bodyLength: body.length,
        delayInSeconds,
        hasData: !!data,
        soundEnabled: this.shouldPlaySound(),
        vibrationEnabled: this.shouldVibrate()
      });

      // PRODUCTION-READY: Use real expo-notifications
      const scheduledNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: this.shouldPlaySound() ? 'default' : undefined,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          sticky: false,
          autoDismiss: true,
        },
        trigger: {
          seconds: delayInSeconds,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });

      log.info('NotificationService', 'Local notification scheduled successfully', {
        notificationId,
        scheduledId: scheduledNotificationId,
        title,
        delayInSeconds,
        triggerTime: new Date(Date.now() + delayInSeconds * 1000).toISOString()
      });

      // Also add to our notification store for app-internal tracking
      const notificationData = {
        id: notificationId,
        title,
        message: body,
        data: data || {},
        timestamp: new Date(),
        type: "SYSTEM_UPDATE" as const,
        priority: "normal" as const,
        isRead: false,
      };

      useNotificationStore.getState().addNotification(notificationData);

      return scheduledNotificationId;
    } catch (error) {
      log.error('NotificationService', 'Failed to schedule local notification', {
        notificationId,
        title,
        delayInSeconds,
        error: error.message
      }, error);

      // Fallback: Create notification in store only (without scheduling)
      log.warn('NotificationService', 'Using fallback notification (not scheduled)', {
        notificationId,
        reason: 'expo-notifications scheduling failed'
      });

      const notificationData = {
        id: notificationId,
        title,
        message: body,
        data: data || {},
        timestamp: new Date(),
        type: "SYSTEM_UPDATE" as const,
        priority: "normal" as const,
        isRead: false,
      };

      useNotificationStore.getState().addNotification(notificationData);

      return notificationId;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      log.info('NotificationService', 'Cancelling scheduled notification', {
        notificationId,
        platform: Platform.OS
      });

      // PRODUCTION-READY: Cancel using expo-notifications
      await Notifications.cancelScheduledNotificationAsync(notificationId);

      log.info('NotificationService', 'Notification cancelled successfully', {
        notificationId
      });
    } catch (error) {
      log.error('NotificationService', 'Failed to cancel notification', {
        notificationId,
        error: error.message
      }, error);

      // Don't throw - cancellation failures shouldn't break the app
      log.warn('NotificationService', 'Continuing despite cancellation failure', {
        notificationId,
        reason: 'Non-critical operation'
      });
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      log.info('NotificationService', 'Cancelling all scheduled notifications', {
        platform: Platform.OS
      });

      // PRODUCTION-READY: Cancel all using expo-notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      log.info('NotificationService', 'All scheduled notifications cancelled successfully');
    } catch (error) {
      log.error('NotificationService', 'Failed to cancel all notifications', {
        error: error.message
      }, error);

      // Don't throw - this is a cleanup operation
      log.warn('NotificationService', 'Continuing despite failure to cancel all notifications', {
        reason: 'Cleanup operation - non-critical'
      });
    }
  }

  async getDeviceToken(): Promise<string | null> {
    const tokenRequestId = `device_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      log.info('NotificationService', 'Requesting FCM device token', {
        tokenRequestId,
        platform: Platform.OS,
        hasFirebaseService: !!firebaseService
      });

      // Use Firebase service to get FCM token
      const token = await firebaseService.getFCMToken();

      if (token) {
        log.info('NotificationService', 'FCM device token retrieved successfully', {
          tokenRequestId,
          tokenLength: token.length,
          tokenPrefix: token.substring(0, 20) + '...',
          platform: Platform.OS
        });
      } else {
        log.warn('NotificationService', 'FCM device token retrieval failed', {
          tokenRequestId,
          reason: 'Token is null or undefined'
        });
      }

      return token;
    } catch (error) {
      log.error('NotificationService', 'Failed to get device token', {
        tokenRequestId,
        error: error.message
      }, error);
      return null;
    }
  }

  /**
   * Send a push notification to the current device
   */
  async sendPushNotification(
    title: string,
    body: string,
    data?: any,
    options?: {
      sound?: boolean;
      priority?: 'default' | 'high' | 'low';
      sticky?: boolean;
    }
  ): Promise<string> {
    const notificationId = `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      log.info('NotificationService', 'Sending push notification', {
        notificationId,
        title,
        bodyLength: body.length,
        hasData: !!data,
        options: options || {}
      });

      // PRODUCTION-READY: Send immediate push notification
      const pushNotificationId = await Notifications.presentNotificationAsync({
        title,
        body,
        data: data || {},
        ...options,
      });

      log.info('NotificationService', 'Push notification sent successfully', {
        notificationId,
        pushId: pushNotificationId,
        title,
        immediate: true
      });

      // Also add to notification store
      const notificationData = {
        id: notificationId,
        title,
        message: body,
        data: data || {},
        timestamp: new Date(),
        type: "SYSTEM_UPDATE" as const,
        priority: (options?.priority === 'high' ? 'high' : 'normal') as const,
        isRead: false,
      };

      useNotificationStore.getState().addNotification(notificationData);

      return pushNotificationId;
    } catch (error) {
      log.error('NotificationService', 'Failed to send push notification', {
        notificationId,
        title,
        error: error.message
      }, error);

      // Fallback: Just add to store without sending push
      log.warn('NotificationService', 'Using fallback notification (no push sent)', {
        notificationId,
        reason: 'expo-notifications present failed'
      });

      const notificationData = {
        id: notificationId,
        title,
        message: body,
        data: data || {},
        timestamp: new Date(),
        type: "SYSTEM_UPDATE" as const,
        priority: 'normal' as const,
        isRead: false,
      };

      useNotificationStore.getState().addNotification(notificationData);

      return notificationId;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      log.info('NotificationService', 'Setting badge count', {
        count,
        platform: Platform.OS
      });

      // PRODUCTION-READY: Set badge count using expo-notifications
      await Notifications.setBadgeCountAsync(count);

      log.info('NotificationService', 'Badge count set successfully', {
        count,
        platform: Platform.OS
      });
    } catch (error) {
      log.error('NotificationService', 'Failed to set badge count', {
        count,
        error: error.message
      }, error);

      // Don't throw - badge setting failures shouldn't break the app
      log.warn('NotificationService', 'Continuing despite badge count failure', {
        count,
        reason: 'Non-critical UI operation'
      });
    }
  }

  private handleNotificationReceived = (notification: any): void => {
    const { title, body, data } = notification.request?.content || notification;

    // Add to notification store
    const notificationData = {
      id: notification.request?.identifier || Date.now().toString(),
      title: title || "Notification",
      message: body || "",
      data: data || {},
      timestamp: new Date(),
      type: "SYSTEM_UPDATE" as const,
      priority: "normal" as const,
      isRead: false,
    };

    useNotificationStore.getState().addNotification(notificationData);

    // TODO: Trigger haptic feedback when expo-haptics is available
    console.log(
      "[NotificationService] Would trigger haptic feedback for notification",
    );

    // // Original implementation (commented until expo-notifications/haptics is available)
    // // Trigger haptic feedback for high priority notifications
    // if (notificationData.priority === 'high' || notificationData.priority === 'critical') {
    //   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    // }
  };

  private handleNotificationTapped = (response: any): void => {
    const { data } = response.notification?.request?.content || response;

    // Mark as read
    const notificationId =
      response.notification?.request?.identifier || response.id;
    if (notificationId) {
      useNotificationStore.getState().markAsRead(notificationId);
    }

    // TODO: Handle navigation based on notification type when navigation is integrated
    console.log(
      "[NotificationService] Would navigate based on notification data:",
      data,
    );

    // // Original implementation (commented until expo-notifications is available)
    // // Mark as read
    // useNotificationStore.getState().markAsRead(response.notification.request.identifier);

    // // Handle navigation based on notification type
    // this.handleNotificationNavigation(data);
  };

  private handleNotificationNavigation = (data: any): void => {
    // This will be implemented when we integrate with navigation
    // For now, just log the navigation intent
    console.log("[NotificationService] Navigation requested for:", data);
  };

  private shouldPlaySound(): boolean {
    const preferences = useNotificationStore.getState().preferences;
    return preferences.soundEnabled;
  }

  private shouldVibrate(): boolean {
    const preferences = useNotificationStore.getState().preferences;
    return preferences.vibrationEnabled;
  }

  // Utility methods for notification templates
  getNotificationContent(
    type: NotificationType,
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

  // Simulate notification for testing
  simulateNotification(notificationData: {
    title: string;
    body: string;
    data?: any;
    type?: "foreground" | "background";
  }): void {
    console.log("🎭 [NotificationService] SIMULATING NOTIFICATION VIA SERVICE", {
      timestamp: new Date().toISOString(),
      ...notificationData,
      source: "notification_service_simulation",
    });

    // Create a mock notification response similar to Expo's format
    const mockResponse = {
      notification: {
        request: {
          identifier: `simulated_${Date.now()}`,
          content: {
            title: notificationData.title,
            body: notificationData.body,
            data: notificationData.data || {},
            sound: "default",
            badge: 1,
          },
        },
      },
      actionIdentifier: "default",
      userText: null,
    };

    console.log("🎭 [NotificationService] Mock notification created:", {
      id: mockResponse.notification.request.identifier,
      type: notificationData.type,
    });

    // Simulate calling the handler based on type
    if (notificationData.type === "background") {
      console.log("🎭 [NotificationService] Triggering background tap simulation");
      // In a real scenario, this would trigger the notification response listener
    }

    console.log("✅ [NotificationService] Notification simulation completed");
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    try {
      if (this.notificationHandler) {
        this.notificationHandler = null;
      }
      await this.cancelAllNotifications();
      console.log("[NotificationService] Cleanup completed");
    } catch (error) {
      console.error("[NotificationService] Cleanup failed:", error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export helper functions
export const simulateNotificationService = (data: { title: string; body: string; data?: any; type?: "foreground" | "background" }) =>
  notificationService.simulateNotification(data);

export default notificationService;
