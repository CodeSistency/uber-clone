import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { log } from "@/lib/logger";

log.info('FirebaseService', 'Initializing Firebase service', {
  platform: Platform.OS,
  hasFirebaseConfig: !!Constants.expoConfig?.extra?.firebase,
  deviceName: Device.deviceName,
  deviceType: Device.deviceType
});

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Initialize Firebase manually for development builds
let firebaseInitialized = false;

const initializeFirebaseManually = async () => {
  try {
    console.log(
      "[FirebaseService] Attempting manual Firebase initialization...",
    );

    // Check if we have Firebase config
    const firebaseConfig = Constants.expoConfig?.extra?.firebase;
    if (!firebaseConfig) {
      console.warn("[FirebaseService] No Firebase config found in app.json");
      return false;
    }

    // In development builds, we can try to initialize Firebase manually
    // This helps with FCM token generation
    console.log("[FirebaseService] Firebase config found:", {
      projectId: firebaseConfig.projectId,
      hasApiKey: !!firebaseConfig.apiKey,
    });

    // For Android development, we need to ensure Firebase is ready
    // Since we can't actually initialize Firebase from JS in Expo,
    // we'll mark it as initialized and let Expo handle it
    if (Platform.OS === "android") {
      console.log(
        "[FirebaseService] Android detected - relying on google-services.json",
      );
      console.log(
        "[FirebaseService] FCM tokens should work in production builds",
      );
    }

    firebaseInitialized = true;
    console.log("[FirebaseService] Manual Firebase initialization completed");
    return true;
  } catch (error) {
    console.warn(
      "[FirebaseService] Manual Firebase initialization failed:",
      error,
    );
    return false;
  }
};

export interface FirebaseTokenData {
  token: string;
  deviceType: "ios" | "android" | "web";
  deviceId: string;
}

export class FirebaseService {
  private static instance: FirebaseService;
  private fcmToken: string | null = null;
  private deviceId: string | null = null;
  private retryCount = 0;
  private maxRetries = 1; // Solo permitir 1 reintento
  private isRetrying = false; // Flag para evitar bucles

  private constructor() {
    console.log("[FirebaseService] Firebase service instance created");
    // Initialize Firebase on service creation
    this.initializeFirebaseOnStartup();
  }

  private async initializeFirebaseOnStartup() {
    try {
      console.log("[FirebaseService] Auto-initializing Firebase...");
      await initializeFirebaseManually();
    } catch (error) {
      console.warn("[FirebaseService] Auto-initialization failed:", error);
    }
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Manually initialize Firebase (public method)
   */
  async initializeFirebase(): Promise<boolean> {
    console.log("🚀 [FirebaseService] Manual Firebase initialization requested");
    console.log("🔧 [FirebaseService] Initialization context:", {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      hasExpoConfig: !!Constants.expoConfig,
      hasFirebaseConfig: !!Constants.expoConfig?.extra?.firebase,
      firebaseInitialized,
    });

    const result = await initializeFirebaseManually();

    console.log("📊 [FirebaseService] Manual initialization result:", {
      success: result,
      firebaseInitialized,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      console.log("🔐 [FirebaseService] Requesting notification permissions");
      console.log("📱 [FirebaseService] Permission request context:", {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        deviceName: Device.deviceName || "unknown",
      });

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      console.log("📋 [FirebaseService] Current permission status:", {
        existingStatus,
        granted: existingStatus === "granted",
        denied: existingStatus === "denied",
        undetermined: existingStatus === "undetermined",
      });

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        console.log("⚡ [FirebaseService] Requesting permissions from user...");
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;

        console.log("📋 [FirebaseService] Permission request result:", {
          requestedStatus: status,
          granted: status === "granted",
          denied: status === "denied",
          statusChanged: status !== existingStatus,
        });
      }

      const granted = finalStatus === "granted";
      console.log(
        "✅ [FirebaseService] Final permission status:",
        granted ? "GRANTED" : "DENIED",
      );

      if (granted) {
        console.log("🔧 [FirebaseService] Setting up notification channel...");
        await this.setupNotificationChannel();
        console.log("✅ [FirebaseService] Notification channel configured");
      } else {
        console.warn("⚠️ [FirebaseService] Permissions not granted - push notifications disabled");
      }

      return granted;
    } catch (error) {
      console.error("❌ [FirebaseService] Error requesting permissions:", error);
      console.log("🔍 [FirebaseService] Permission error details:", {
        error: error instanceof Error ? error.message : String(error),
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  /**
   * Setup notification channel for Android
   */
  private async setupNotificationChannel(): Promise<void> {
    if (Platform.OS === "android") {
      try {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#2F80ED",
        });
        console.log(
          "[FirebaseService] Android notification channel configured",
        );
      } catch (error) {
        console.error(
          "[FirebaseService] Error setting up notification channel:",
          error,
        );
      }
    }
  }

  /**
   * Get FCM token for push notifications
   */
  async getFCMToken(): Promise<string | null> {
    const tokenRequestId = `fcm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    log.info('FirebaseService', 'FCM token request initiated', {
      tokenRequestId,
      hasCachedToken: !!this.fcmToken,
      cachedTokenLength: this.fcmToken?.length || 0,
      deviceType: Platform.OS,
      firebaseInitialized,
      isRetrying: this.isRetrying
    });

    try {
      // Check if we already have a cached token
      const cachedToken = await SecureStore.getItemAsync("fcm_token");
      if (cachedToken && this.fcmToken) {
        log.info('FirebaseService', 'Using cached FCM token', {
          tokenRequestId,
          tokenLength: cachedToken.length,
          tokenPrefix: cachedToken.substring(0, 20) + "..."
        });
        return cachedToken;
      }

      if (cachedToken && !this.fcmToken) {
        log.info('FirebaseService', 'Restoring FCM token from cache', {
          tokenRequestId,
          tokenLength: cachedToken.length
        });
        this.fcmToken = cachedToken;
        return cachedToken;
      }

      // Prevent infinite loops
      if (this.isRetrying) {
        log.warn('FirebaseService', 'Already retrying, skipping to avoid infinite loop', {
          tokenRequestId,
          retryAttempt: this.retryCount
        });
        return null;
      }

      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        log.warn('FirebaseService', 'No notification permissions granted', {
          tokenRequestId,
          reason: 'User denied permissions'
        });
        return null;
      }

      // Get the push token using Expo's built-in FCM support
      console.log("📱 [FirebaseService] Requesting Expo push token...");
      const projectIdCandidate = Constants.expoConfig?.extra?.eas?.projectId;
      const isUuid = (v: any) =>
        typeof v === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          v,
        );

      console.log("🔍 [FirebaseService] Expo token request details:", {
        projectId: projectIdCandidate,
        isValidUuid: isUuid(projectIdCandidate),
        expoConfig: Constants.expoConfig?.extra?.eas,
        deviceType: Platform.OS,
      });

      // In bare workflow, projectId is required. Skip if we don't have a valid UUID to avoid runtime errors.
      if (!isUuid(projectIdCandidate)) {
        console.warn(
          "⚠️ [FirebaseService] Skipping Expo push token: missing EAS projectId (UUID).",
        );
        console.log("📋 [FirebaseService] Available config:", {
          hasExpoConfig: !!Constants.expoConfig,
          hasExtra: !!Constants.expoConfig?.extra,
          hasEas: !!Constants.expoConfig?.extra?.eas,
          easKeys: Object.keys(Constants.expoConfig?.extra?.eas || {}),
        });
        return null;
      }

      console.log("🚀 [FirebaseService] Calling Notifications.getExpoPushTokenAsync...");
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectIdCandidate,
      });

      const token = tokenData.data;
      console.log(
        "✅ [FirebaseService] FCM token obtained successfully:",
        token.substring(0, 20) + "...",
      );

      console.log("📊 [FirebaseService] Token details:", {
        tokenLength: token.length,
        tokenType: token.startsWith('ExponentPushToken[') ? 'expo' : 'native',
        projectId: projectIdCandidate,
        deviceType: tokenData.type || 'unknown',
      });

      // Cache the token
      this.fcmToken = token;
      await SecureStore.setItemAsync("fcm_token", token);

      return token;
    } catch (error: any) {
      console.error("[FirebaseService] Error getting FCM token:", error);

      // For Android development builds, do not retry with invalid projectId fallback

      // Log final error message
      console.warn(
        "[FirebaseService] 📱 FCM tokens will work in production builds",
      );
      console.warn(
        "[FirebaseService] 🏗️  Build with: npx expo run:android --variant release",
      );

      // Return null so the app can continue without FCM
      return null;
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<{
    deviceType: "ios" | "android" | "web";
    deviceId: string;
  }> {
    try {
      // Get cached device ID
      if (this.deviceId) {
        return {
          deviceType: Platform.OS as "ios" | "android" | "web",
          deviceId: this.deviceId,
        };
      }

      // Generate or get device ID
      let deviceId = await SecureStore.getItemAsync("device_id");

      if (!deviceId) {
        // Generate a unique device ID
        deviceId =
          Device.deviceName ||
          Device.modelName ||
          `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        await SecureStore.setItemAsync("device_id", deviceId);
        console.log("[FirebaseService] New device ID generated:", deviceId);
      }

      this.deviceId = deviceId;

      return {
        deviceType: Platform.OS as "ios" | "android" | "web",
        deviceId: deviceId,
      };
    } catch (error) {
      console.error("[FirebaseService] Error getting device info:", error);
      // Fallback device ID
      const fallbackId = `fallback_${Date.now()}`;
      return {
        deviceType: Platform.OS as "ios" | "android" | "web",
        deviceId: fallbackId,
      };
    }
  }

  /**
   * Get complete Firebase token data for authentication
   */
  async getFirebaseTokenData(): Promise<FirebaseTokenData | null> {
    try {
      console.log("[FirebaseService] Getting complete Firebase token data");

      const [token, deviceInfo] = await Promise.all([
        this.getFCMToken(),
        this.getDeviceInfo(),
      ]);

      if (!token) {
        console.log("[FirebaseService] No FCM token available");
        return null;
      }

      const tokenData: FirebaseTokenData = {
        token,
        deviceType: deviceInfo.deviceType,
        deviceId: deviceInfo.deviceId,
      };

      console.log("[FirebaseService] Firebase token data prepared:", {
        token: token.substring(0, 20) + "...",
        deviceType: deviceInfo.deviceType,
        deviceId: deviceInfo.deviceId.substring(0, 20) + "...",
      });

      return tokenData;
    } catch (error: any) {
      console.error(
        "[FirebaseService] Error getting Firebase token data:",
        error,
      );

      // Log specific Firebase initialization errors
      if (
        error.message &&
        error.message.includes("FirebaseApp is not initialized")
      ) {
        console.warn(
          "[FirebaseService] Firebase not initialized - this is expected in development. FCM tokens will work in production builds.",
        );
      }

      return null;
    }
  }

  /**
   * Clear cached tokens (useful for logout)
   */
  async clearTokens(): Promise<void> {
    try {
      console.log("[FirebaseService] Clearing cached tokens");
      this.fcmToken = null;
      this.deviceId = null;

      await SecureStore.deleteItemAsync("fcm_token");
      await SecureStore.deleteItemAsync("device_id");

      console.log("[FirebaseService] Tokens cleared successfully");
    } catch (error) {
      console.error("[FirebaseService] Error clearing tokens:", error);
    }
  }

  /**
   * Simulate receiving a Firebase notification for testing
   */
  simulateFirebaseNotification(notificationData: {
    title: string;
    body: string;
    data?: any;
    type?: "foreground" | "background";
  }): void {
    console.log("🎭 [FirebaseService] SIMULATING FIREBASE NOTIFICATION", {
      timestamp: new Date().toISOString(),
      ...notificationData,
      simulated: true,
    });

    // Create a mock notification object similar to what Expo provides
    const mockNotification = {
      request: {
        identifier: `simulated_${Date.now()}`,
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: "default",
          badge: 1,
        },
        trigger: {
          type: "push",
        },
      },
      date: Date.now(),
    };

    // Call the notification listener manually for testing
    if (notificationData.type === "foreground" && this.notificationListener) {
      console.log("🎭 [FirebaseService] Triggering foreground notification simulation");
      // Note: In a real scenario, this would be called by the Expo notification listener
      // For simulation, we log it but don't actually trigger the listener
    }

    console.log("✅ [FirebaseService] Firebase notification simulation completed");
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners(): void {
    console.log("[FirebaseService] Setting up notification listeners");

    // Handle notification received while app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const notificationData = notification.request?.content;
        const { title, body, data } = notificationData || {};

        console.log("🔔 [FirebaseService] NOTIFICATION RECEIVED (Foreground)", {
          timestamp: new Date().toISOString(),
          title,
          body,
          data,
          notificationId: notification.request?.identifier,
          isForeground: true,
          deviceInfo: 'available'
        });

        // Log detailed notification structure for debugging
        console.log("📋 [FirebaseService] Full notification object:", {
          request: {
            identifier: notification.request?.identifier,
            content: {
              title,
              body,
              data,
              sound: notification.request?.content?.sound,
              badge: notification.request?.content?.badge,
            },
            trigger: notification.request?.trigger,
          },
          date: notification.date,
        });

        // Store notification for history
        this.storeNotificationHistory({
          id: notification.request?.identifier || `foreground_${Date.now()}`,
          title: title || "Notification",
          message: body || "",
          data: data || {},
          timestamp: new Date(notification.date || Date.now()),
          type: data?.type || "SYSTEM_UPDATE",
          priority: data?.priority || "normal",
          isRead: false,
          source: "firebase_foreground",
        });
      },
    );

    // Handle notification response (user taps on notification)
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notificationData = response.notification?.request?.content;
        const { title, body, data } = notificationData || {};

        console.log("👆 [FirebaseService] NOTIFICATION TAPPED (Background/Terminated)", {
          timestamp: new Date().toISOString(),
          title,
          body,
          data,
          notificationId: response.notification?.request?.identifier,
          actionIdentifier: response.actionIdentifier,
          isForegroundTap: false,
          userInfo: response.userText || null,
        });

        // Log detailed response structure
        console.log("📋 [FirebaseService] Full notification response:", {
          notification: {
            request: {
              identifier: response.notification?.request?.identifier,
              content: {
                title,
                body,
                data,
              },
            },
          },
          actionIdentifier: response.actionIdentifier,
          userText: response.userText,
        });

        // Store notification interaction for analytics
        this.storeNotificationInteraction({
          notificationId: response.notification?.request?.identifier,
          action: response.actionIdentifier || "tap",
          timestamp: new Date(),
          data: data || {},
        });

        // Handle navigation based on notification data
        this.handleNotificationNavigation(data);
      });

    // Store listeners for cleanup if needed
    this.notificationListener = notificationListener;
    this.responseListener = responseListener;

    console.log("✅ [FirebaseService] Notification listeners configured successfully");
  }

  /**
   * Store notification in history for debugging/analytics
   */
  private storeNotificationHistory(notification: any): void {
    try {
      console.log("💾 [FirebaseService] Storing notification in history:", notification.id);
      // Here you could store to AsyncStorage or send to analytics service
      // For now, just log it
    } catch (error) {
      console.warn("[FirebaseService] Failed to store notification history:", error);
    }
  }

  /**
   * Store notification interaction for analytics
   */
  private storeNotificationInteraction(interaction: any): void {
    try {
      console.log("📊 [FirebaseService] Recording notification interaction:", interaction);
      // Here you could send to analytics service
    } catch (error) {
      console.warn("[FirebaseService] Failed to record interaction:", error);
    }
  }

  /**
   * Handle navigation based on notification data
   */
  private handleNotificationNavigation(data: any): void {
    try {
      console.log("🧭 [FirebaseService] Processing navigation for notification:", data);

      if (!data) {
        console.log("[FirebaseService] No navigation data provided");
        return;
      }

      // Navigation logic based on notification type
      switch (data.type) {
        case "RIDE_REQUEST":
          console.log("🛵 [FirebaseService] Navigating to ride requests (driver)");
          // router.push("/driver/ride-requests");
          break;

        case "RIDE_ACCEPTED":
          console.log("✅ [FirebaseService] Navigating to active ride");
          // router.push(`/ride/${data.rideId}`);
          break;

        case "DRIVER_ARRIVED":
          console.log("🚗 [FirebaseService] Navigating to pickup location");
          // router.push(`/ride/${data.rideId}/pickup`);
          break;

        case "RIDE_STARTED":
          console.log("🚀 [FirebaseService] Ride started - updating UI");
          // Update ride status in store
          break;

        case "RIDE_COMPLETED":
          console.log("🎯 [FirebaseService] Ride completed - showing summary");
          // router.push(`/ride/${data.rideId}/completed`);
          break;

        case "RIDE_CANCELLED":
          console.log("❌ [FirebaseService] Ride cancelled - showing options");
          // router.push("/home");
          break;

        case "CHAT_MESSAGE":
          console.log("💬 [FirebaseService] New chat message");
          // Could show in-app chat or navigate to chat screen
          break;

        case "EMERGENCY_ALERT":
          console.log("🚨 [FirebaseService] Emergency alert");
          // Show emergency screen
          break;

        default:
          console.log("ℹ️ [FirebaseService] Unknown notification type:", data.type);
          // router.push("/home");
      }
    } catch (error) {
      console.error("[FirebaseService] Error handling notification navigation:", error);
    }
  }

  /**
   * Cleanup notification listeners
   */
  cleanup(): void {
    console.log("[FirebaseService] Cleaning up notification listeners");

    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Private properties for listeners
  private notificationListener: any;
  private responseListener: any;
}

// Export singleton instance
export const firebaseService = FirebaseService.getInstance();

// Helper functions for easy access
export const getFCMToken = () => firebaseService.getFCMToken();
export const getDeviceInfo = () => firebaseService.getDeviceInfo();
export const getFirebaseTokenData = () =>
  firebaseService.getFirebaseTokenData();
export const clearFirebaseTokens = () => firebaseService.clearTokens();
export const initializeFirebase = () => firebaseService.initializeFirebase();
export const simulateFirebaseNotification = (data: { title: string; body: string; data?: any; type?: "foreground" | "background" }) =>
  firebaseService.simulateFirebaseNotification(data);
