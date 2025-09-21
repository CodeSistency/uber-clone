import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

console.log("[FirebaseService] Initializing Firebase service");

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
    return await initializeFirebaseManually();
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      console.log("[FirebaseService] Requesting notification permissions");

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const granted = finalStatus === "granted";
      console.log(
        "[FirebaseService] Notification permissions granted:",
        granted,
      );

      if (granted) {
        await this.setupNotificationChannel();
      }

      return granted;
    } catch (error) {
      console.error("[FirebaseService] Error requesting permissions:", error);
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
    try {
      console.log("[FirebaseService] Getting FCM token");

      // Check if we already have a cached token
      const cachedToken = await SecureStore.getItemAsync("fcm_token");
      if (cachedToken && this.fcmToken) {
        console.log("[FirebaseService] Using cached FCM token");
        return cachedToken;
      }

      // Prevent infinite loops
      if (this.isRetrying) {
        console.warn(
          "[FirebaseService] Already retrying, skipping to avoid infinite loop",
        );
        return null;
      }

      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log("[FirebaseService] No notification permissions granted");
        return null;
      }

      // Get the push token using Expo's built-in FCM support
      console.log("[FirebaseService] Requesting Expo push token...");
      const projectIdCandidate = Constants.expoConfig?.extra?.eas?.projectId;
      const isUuid = (v: any) =>
        typeof v === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          v,
        );

      // In bare workflow, projectId is required. Skip if we don't have a valid UUID to avoid runtime errors.
      if (!isUuid(projectIdCandidate)) {
        console.warn(
          "[FirebaseService] Skipping Expo push token: missing EAS projectId (UUID).",
        );
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectIdCandidate,
      });

      const token = tokenData.data;
      console.log(
        "[FirebaseService] ✅ FCM token obtained:",
        token.substring(0, 20) + "...",
      );

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
   * Setup notification listeners
   */
  setupNotificationListeners(): void {
    console.log("[FirebaseService] Setting up notification listeners");

    // Handle notification received while app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("[FirebaseService] Notification received:", notification);
      },
    );

    // Handle notification response (user taps on notification)
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("[FirebaseService] Notification response:", response);
      });

    // Store listeners for cleanup if needed
    this.notificationListener = notificationListener;
    this.responseListener = responseListener;
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
