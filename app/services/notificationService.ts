import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { log } from "@/lib/logger";

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
      log.info("Initializing notification service", {
        component: "NotificationService",
        action: "initialize",
        data: {}
      });

      // Initialize Firebase service for push notifications
      await firebaseService.requestPermissions();
      firebaseService.setupNotificationListeners();

      // Request permissions using Firebase service
      const hasPermission = await firebaseService.requestPermissions();
      if (!hasPermission) {
        log.warn("Notification permissions not granted", {
          component: "NotificationService",
          action: "initialize",
          data: {}
        });
        throw new Error("Notification permissions not granted");
      }

      // Set notification handler
      this.notificationHandler = Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Set up notification listeners
      this.setupNotificationListeners();

      log.info("Notification service initialized successfully", {
        component: "NotificationService",
        action: "initialize",
        data: {}
      });
    } catch (error) {
      log.error("Failed to initialize notification service", {
        component: "NotificationService",
        action: "initialize",
        data: {
          error: (error as Error)?.message,
        },
      });
      throw error;
    }
  }

  private setupNotificationListeners(): void {
    log.info("Setting up notification listeners", {
      component: "NotificationService",
      action: "setupNotificationListeners",
      data: {}
    });

    // Handle notification received while app is foreground
    Notifications.addNotificationReceivedListener((notification: any) => {
      const notificationData = notification.request?.content;
      const { title, body, data } = notificationData || {};

      log.info("Notification received via service", {
        component: "NotificationService",
        action: "notificationReceived",
        data: {
          timestamp: new Date().toISOString(),
          title,
          body,
          data,
          notificationId: notification.request?.identifier,
          source: "notification_service",
          isForeground: true,
          categoryIdentifier: notification.request?.content?.categoryIdentifier,
        },
      });

      // Log additional metadata
      log.debug("Notification metadata", {
        component: "NotificationService",
        action: "notificationReceived",
        data: {
          sound: notification.request?.content?.sound,
          badge: notification.request?.content?.badge,
          priority: notification.request?.content?.priority,
          subtitle: notification.request?.content?.subtitle,
          attachments: notification.request?.content?.attachments?.length || 0,
        },
      });

      this.handleNotificationReceived(notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener((response: any) => {
      const notificationData = response.notification?.request?.content;
      const { title, body, data } = notificationData || {};

      log.info("Notification interaction via service", {
        component: "NotificationService",
        action: "notification_interaction",
        data: {
          timestamp: new Date().toISOString(),
          title,
          body,
          data,
          notificationId: response.notification?.request?.identifier,
          actionIdentifier: response.actionIdentifier,
          source: "notification_service",
          interactionType:
            response.actionIdentifier === "default"
              ? "tap"
              : response.actionIdentifier,
          userInput: response.userText || null,
        }
      });

      // Log interaction analytics
      log.info("Interaction analytics", {
        component: "NotificationService",
        action: "interaction_analytics",
        data: {
          notificationType: data?.type,
          rideId: data?.rideId,
          userId: data?.userId,
          timestamp: new Date().toISOString(),
          deviceInfo: "iOS/Android", // Could get from device
        }
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
      log.info("Sending local notification", {
        component: "NotificationService",
        action: "send_local_notification",
        data: {
          title,
          body,
          data,
        }
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

      log.info("Local notification sent", {
        component: "NotificationService",
        action: "local_notification_sent",
        data: {
          notificationId,
        }
      });

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
      log.error("Failed to send local notification", {
        component: "NotificationService",
        action: "send_local_notification_failed",
        data: {
          title,
          body,
          error: (error as Error)?.message,
        }
      });
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
      log.info("Scheduling local notification", {
        component: "NotificationService",
        action: "schedule_notification",
        data: {
          notificationId,
          title,
          bodyLength: body.length,
          delayInSeconds,
          hasData: !!data,
          soundEnabled: this.shouldPlaySound(),
          vibrationEnabled: this.shouldVibrate(),
        }
      });

      // PRODUCTION-READY: Use real expo-notifications
      const scheduledNotificationId =
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: data || {},
            sound: this.shouldPlaySound() ? "default" : undefined,
            priority: Notifications.AndroidNotificationPriority.DEFAULT,
            sticky: false,
            autoDismiss: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: delayInSeconds,
          },
        });

      log.info("Local notification scheduled successfully", {
        component: "NotificationService",
        action: "notification_scheduled",
        data: {
          notificationId,
          scheduledId: scheduledNotificationId,
          title,
          delayInSeconds,
          triggerTime: new Date(
            Date.now() + delayInSeconds * 1000,
          ).toISOString(),
        }
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
      log.error("Failed to schedule local notification", {
        component: "NotificationService",
        action: "schedule_notification_failed",
        data: {
          notificationId,
          title,
          delayInSeconds,
          error: (error as Error)?.message,
        }
      });

      // Fallback: Create notification in store only (without scheduling)
      log.warn("Using fallback notification (not scheduled)", {
        component: "NotificationService",
        action: "fallback_notification",
        data: {
          notificationId,
          reason: "expo-notifications scheduling failed",
        }
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
      log.info("Cancelling scheduled notification", {
        component: "NotificationService",
        action: "cancel_notification",
        data: {
          notificationId,
          platform: Platform.OS,
        }
      });

      // PRODUCTION-READY: Cancel using expo-notifications
      await Notifications.cancelScheduledNotificationAsync(notificationId);

      log.info("Notification cancelled successfully", {
        component: "NotificationService",
        action: "notification_cancelled",
        data: {
          notificationId,
        }
      });
    } catch (error) {
      log.error("Failed to cancel notification", {
        component: "NotificationService",
        action: "cancel_notification_failed",
        data: {
          notificationId,
          error: (error as Error)?.message,
        }
      });

      // Don't throw - cancellation failures shouldn't break the app
      log.warn("Continuing despite cancellation failure", {
        component: "NotificationService",
        action: "cancellation_failure_handled",
        data: {
          notificationId,
          reason: "Non-critical operation",
        }
      });
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      log.info("Cancelling all scheduled notifications", {
        component: "NotificationService",
        action: "cancel_all_notifications",
        data: {
          platform: Platform.OS,
        }
      });

      // PRODUCTION-READY: Cancel all using expo-notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      log.info("All scheduled notifications cancelled successfully", {
        component: "NotificationService",
        action: "all_notifications_cancelled",
        data: {}
      });
    } catch (error) {
      log.error("Failed to cancel all notifications", {
        component: "NotificationService",
        action: "cancel_all_notifications_failed",
        data: {
          error: (error as Error)?.message,
        }
      });

      // Don't throw - this is a cleanup operation
      log.warn("Continuing despite failure to cancel all notifications", {
        component: "NotificationService",
        action: "cancel_all_failure_handled",
        data: {
          reason: "Cleanup operation - non-critical",
        }
      });
    }
  }

  async getDeviceToken(): Promise<string | null> {
    const tokenRequestId = `device_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      log.info("Requesting FCM device token", {
        component: "NotificationService",
        action: "request_fcm_token",
        data: {
          tokenRequestId,
          platform: Platform.OS,
          hasFirebaseService: !!firebaseService,
        }
      });

      // Use Firebase service to get FCM token
      const token = await firebaseService.getFCMToken();

      if (token) {
        log.info("FCM device token retrieved successfully", {
          component: "NotificationService",
          action: "fcm_token_retrieved",
          data: {
            tokenRequestId,
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 20) + "...",
            platform: Platform.OS,
          }
        });
      } else {
        log.warn("FCM device token retrieval failed", {
          component: "NotificationService",
          action: "fcm_token_retrieval_failed",
          data: {
            tokenRequestId,
            reason: "Token is null or undefined",
          }
        });
      }

      return token;
    } catch (error) {
      log.error("Failed to get device token", {
        component: "NotificationService",
        action: "device_token_error",
        data: {
          tokenRequestId,
          error: (error as Error)?.message,
        }
      });
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
      priority?: "default" | "high" | "low";
      sticky?: boolean;
    },
  ): Promise<string> {
    const notificationId = `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      log.info("Sending push notification", {
        component: "NotificationService",
        action: "send_push_notification",
        data: {
          notificationId,
          title,
          bodyLength: body.length,
          hasData: !!data,
          options: options || {},
        }
      });

      // PRODUCTION-READY: Send immediate push notification
      const pushNotificationId = await Notifications.presentNotificationAsync({
        title,
        body,
        data: data || {},
        ...options,
      });

      log.info("Push notification sent successfully", {
        component: "NotificationService",
        action: "push_notification_sent",
        data: {
          notificationId,
          pushId: pushNotificationId,
          title,
          immediate: true,
        }
      });

      // Also add to notification store
      const notificationData = {
        id: notificationId,
        title,
        message: body,
        data: data || {},
        timestamp: new Date(),
        type: "SYSTEM_UPDATE" as const,
        priority: (options?.priority === "high" ? "high" : "normal") as
          | "high"
          | "normal"
          | "low"
          | "critical",
        isRead: false,
      };

      useNotificationStore.getState().addNotification(notificationData);

      return pushNotificationId;
    } catch (error) {
      log.error("Failed to send push notification", {
        component: "NotificationService",
        action: "push_notification_failed",
        data: {
          notificationId,
          title,
          error: (error as Error)?.message,
        }
      });

      // Fallback: Just add to store without sending push
      log.warn("Using fallback notification (no push sent)", {
        component: "NotificationService",
        action: "fallback_push_notification",
        data: {
          notificationId,
          reason: "expo-notifications present failed",
        }
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

  async setBadgeCount(count: number): Promise<void> {
    try {
      log.info("Setting badge count", {
        component: "NotificationService",
        action: "set_badge_count",
        data: {
          count,
          platform: Platform.OS,
        }
      });

      // PRODUCTION-READY: Set badge count using expo-notifications
      await Notifications.setBadgeCountAsync(count);

      log.info("Badge count set successfully", {
        component: "NotificationService",
        action: "badge_count_set",
        data: {
          count,
          platform: Platform.OS,
        }
      });
    } catch (error) {
      log.error("Failed to set badge count", {
        component: "NotificationService",
        action: "badge_count_failed",
        data: {
          count,
          error: (error as Error)?.message,
        }
      });

      // Don't throw - badge setting failures shouldn't break the app
      log.warn("Continuing despite badge count failure", {
        component: "NotificationService",
        action: "badge_count_failure_handled",
        data: {
          count,
          reason: "Non-critical UI operation",
        }
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
    log.debug("Would trigger haptic feedback for notification", {
      component: "NotificationService",
      action: "triggerHapticFeedback",
      data: {}
    });

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
    

    // // Original implementation (commented until expo-notifications is available)
    // // Mark as read
    // useNotificationStore.getState().markAsRead(response.notification.request.identifier);

    // // Handle navigation based on notification type
    // this.handleNotificationNavigation(data);
  };

  private handleNotificationNavigation = (data: any): void => {
    // This will be implemented when we integrate with navigation
    // For now, just log the navigation intent
    log.info("Navigation requested for", { 
      component: "NotificationService",
      action: "navigation_requested",
      data: { data }
    });
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
    log.info("Simulating notification via service", {
      component: "NotificationService",
      action: "simulate_notification",
      data: {
        timestamp: new Date().toISOString(),
        ...notificationData,
        source: "notification_service_simulation",
      }
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

    log.debug("Mock notification created", {
      component: "NotificationService",
      action: "mock_notification_created",
      data: {
        id: mockResponse.notification.request.identifier,
        type: notificationData.type,
      }
    });

    // Simulate calling the handler based on type
    if (notificationData.type === "background") {
      log.debug("Triggering background tap simulation", {
        component: "NotificationService",
        action: "simulateNotification",
        data: {}
      });
      // In a real scenario, this would trigger the notification response listener
    }

    log.info("Notification simulation completed", {
      component: "NotificationService",
      action: "simulateNotification",
      data: {}
    });
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    try {
      if (this.notificationHandler) {
        this.notificationHandler = null;
      }
      await this.cancelAllNotifications();
      log.info("Cleanup completed", {
        component: "NotificationService",
        action: "cleanup",
        data: {}
      });
    } catch (error) {
      log.error("Cleanup failed", {
        component: "NotificationService",
        action: "cleanup_failed",
        data: {
          error: (error as Error)?.message,
        }
      });
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export helper functions
export const simulateNotificationService = (data: {
  title: string;
  body: string;
  data?: any;
  type?: "foreground" | "background";
}) => notificationService.simulateNotification(data);

export default notificationService;
