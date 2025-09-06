import * as Notifications from 'expo-notifications';
import { Platform } from "react-native";
import * as Haptics from 'expo-haptics';
import * as Device from 'expo-device';
import { useNotificationStore } from "../../store";
import { NotificationType } from "../../types/type";
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
        console.warn('[NotificationService] Notification permissions not granted');
        throw new Error('Notification permissions not granted');
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
      console.log('[NotificationService] Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('[NotificationService] Notification tapped:', response);
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
          sound: this.shouldPlaySound() ? 'default' : undefined,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      console.log('[NotificationService] Local notification sent:', notificationId);

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
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
  ): Promise<void> {
    try {
      // TODO: Implement scheduled notification when expo-notifications is available
      console.log(
        "[NotificationService] Scheduled notification would be sent:",
        {
          title,
          body,
          delayInSeconds,
          data,
        },
      );

      // Schedule the notification using setTimeout for simulation
      const notificationId = Date.now().toString();
      setTimeout(() => {
        console.log(
          "[NotificationService] Simulated scheduled notification triggered:",
          notificationId,
        );

        // Add to notification store when triggered
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
      }, delayInSeconds * 1000);

      // // Original implementation (commented until expo-notifications is available)
      // const notificationId = await Notifications.scheduleNotificationAsync({
      //   content: {
      //     title,
      //     body,
      //     data: data || {},
      //     sound: this.shouldPlaySound() ? 'default' : undefined,
      //   },
      //   trigger: {
      //     seconds: delayInSeconds,
      //   },
      // });

      // console.log('[NotificationService] Scheduled notification:', notificationId);
    } catch (error) {
      console.error(
        "[NotificationService] Failed to schedule notification:",
        error,
      );
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      // TODO: Implement cancel notification when expo-notifications is available
      console.log(
        "[NotificationService] Would cancel notification:",
        notificationId,
      );

      // // Original implementation (commented until expo-notifications is available)
      // await Notifications.cancelScheduledNotificationAsync(notificationId);
      // console.log('[NotificationService] Cancelled notification:', notificationId);
    } catch (error) {
      console.error(
        "[NotificationService] Failed to cancel notification:",
        error,
      );
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      // TODO: Implement cancel all notifications when expo-notifications is available
      console.log("[NotificationService] Would cancel all notifications");

      // // Original implementation (commented until expo-notifications is available)
      // await Notifications.cancelAllScheduledNotificationsAsync();
      // console.log('[NotificationService] Cancelled all notifications');
    } catch (error) {
      console.error(
        "[NotificationService] Failed to cancel all notifications:",
        error,
      );
      throw error;
    }
  }

  async getDeviceToken(): Promise<string | null> {
    try {
      console.log("[NotificationService] Getting FCM device token");

      // Use Firebase service to get FCM token
      const token = await firebaseService.getFCMToken();
      console.log('[NotificationService] FCM token obtained:', token ? token.substring(0, 20) + '...' : 'null');

      return token;
    } catch (error) {
      console.error("[NotificationService] Failed to get device token:", error);
      return null;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      // TODO: Implement badge count when expo-notifications is available
      console.log("[NotificationService] Would set badge count to:", count);

      // // Original implementation (commented until expo-notifications is available)
      // await Notifications.setBadgeCountAsync(count);
      // console.log('[NotificationService] Badge count set to:', count);
    } catch (error) {
      console.error("[NotificationService] Failed to set badge count:", error);
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

export default notificationService;