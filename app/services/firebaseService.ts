import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { config } from "@/lib/config";
import { log } from "@/lib/logger";

log.info("FirebaseService", "Initializing Firebase service", {
  platform: Platform.OS,
  hasFirebaseConfig: !!config.firebase,
  deviceName: Device.deviceName,
  deviceType: Device.deviceType,
});

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Initialize Firebase manually for development builds
let firebaseInitialized = false;

const initializeFirebaseManually = async () => {
  try {
    

    // Check if we have Firebase config
    const firebaseConfig = config.firebase;
    if (!firebaseConfig || !firebaseConfig.apiKey) {
      
      
      return true; // Return true to indicate successful "initialization" (no-op)
    }

    // In development builds, we can try to initialize Firebase manually
    // This helps with FCM token generation
    

    // For Android development, we need to ensure Firebase is ready
    // Since we can't actually initialize Firebase from JS in Expo,
    // we'll mark it as initialized and let Expo handle it
    if (Platform.OS === "android") {
      
      
    }

    firebaseInitialized = true;
    
    return true;
  } catch (error) {
    
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
    
    // Initialize Firebase on service creation
    this.initializeFirebaseOnStartup();
  }

  private async initializeFirebaseOnStartup() {
    try {
      
      await initializeFirebaseManually();
    } catch (error) {
      
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
    
    

    const result = await initializeFirebaseManually();

    

    return result;
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      
      

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;

        
      }

      const granted = finalStatus === "granted";
      

      if (granted) {
        
        await this.setupNotificationChannel();
        
      } else {
        
      }

      return granted;
    } catch (error) {
      
      
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
        
      } catch (error) {
        
      }
    }
  }

  /**
   * Get FCM token for push notifications
   */
  async getFCMToken(): Promise<string | null> {
    const tokenRequestId = `fcm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    log.info("FirebaseService", "FCM token request initiated", {
      tokenRequestId,
      hasCachedToken: !!this.fcmToken,
      cachedTokenLength: this.fcmToken?.length || 0,
      deviceType: Platform.OS,
      firebaseInitialized,
      isRetrying: this.isRetrying,
    });

    try {
      // Check if we already have a cached token
      const cachedToken = await SecureStore.getItemAsync("fcm_token");
      if (cachedToken && this.fcmToken) {
        log.info("FirebaseService", "Using cached FCM token", {
          tokenRequestId,
          tokenLength: cachedToken.length,
          tokenPrefix: cachedToken.substring(0, 20) + "...",
        });
        return cachedToken;
      }

      if (cachedToken && !this.fcmToken) {
        log.info("FirebaseService", "Restoring FCM token from cache", {
          tokenRequestId,
          tokenLength: cachedToken.length,
        });
        this.fcmToken = cachedToken;
        return cachedToken;
      }

      // Prevent infinite loops
      if (this.isRetrying) {
        log.warn(
          "FirebaseService",
          "Already retrying, skipping to avoid infinite loop",
          {
            tokenRequestId,
            retryAttempt: this.retryCount,
          },
        );
        return null;
      }

      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        log.warn("FirebaseService", "No notification permissions granted", {
          tokenRequestId,
          reason: "User denied permissions",
        });
        return null;
      }

      // Check if we have Firebase config for FCM
      const firebaseConfig = config.firebase;
      if (!firebaseConfig || !firebaseConfig.apiKey) {
        log.warn(
          "FirebaseService",
          "No Firebase config - using Expo push tokens only",
          {
            tokenRequestId,
            note: "Push notifications will work but may have limitations in production",
          },
        );
        // Continue anyway - Expo can still provide push tokens
      }

      // Get the push token using Expo's built-in FCM support
      
      const projectIdCandidate = Constants.expoConfig?.extra?.eas?.projectId;
      const isUuid = (v: any) =>
        typeof v === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          v,
        );

      

      // In bare workflow, projectId is required. Skip if we don't have a valid UUID to avoid runtime errors.
      if (!isUuid(projectIdCandidate)) {
        
        
        return null;
      }

      
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectIdCandidate,
      });

      const token = tokenData.data;
      

      

      // Cache the token
      this.fcmToken = token;
      await SecureStore.setItemAsync("fcm_token", token);

      return token;
    } catch (error: any) {
      

      // For Android development builds, do not retry with invalid projectId fallback

      // Log final error message
      
      

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
        
      }

      this.deviceId = deviceId;

      return {
        deviceType: Platform.OS as "ios" | "android" | "web",
        deviceId: deviceId,
      };
    } catch (error) {
      
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
      

      const [token, deviceInfo] = await Promise.all([
        this.getFCMToken(),
        this.getDeviceInfo(),
      ]);

      if (!token) {
        
        return null;
      }

      const tokenData: FirebaseTokenData = {
        token,
        deviceType: deviceInfo.deviceType,
        deviceId: deviceInfo.deviceId,
      };

      

      return tokenData;
    } catch (error: any) {
      

      // Log specific Firebase initialization errors
      if (
        error.message &&
        error.message.includes("FirebaseApp is not initialized")
      ) {
        
      }

      return null;
    }
  }

  /**
   * Clear cached tokens (useful for logout)
   */
  async clearTokens(): Promise<void> {
    try {
      
      this.fcmToken = null;
      this.deviceId = null;

      await SecureStore.deleteItemAsync("fcm_token");
      await SecureStore.deleteItemAsync("device_id");

      
    } catch (error) {
      
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
      
      // Note: In a real scenario, this would be called by the Expo notification listener
      // For simulation, we log it but don't actually trigger the listener
    }

    
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners(): void {
    

    // Handle notification received while app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const notificationData = notification.request?.content;
        const { title, body, data } = notificationData || {};

        

        // Log detailed notification structure for debugging
        

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

        

        // Log detailed response structure
        

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

    
  }

  /**
   * Store notification in history for debugging/analytics
   */
  private storeNotificationHistory(notification: any): void {
    try {
      
      // Here you could store to AsyncStorage or send to analytics service
      // For now, just log it
    } catch (error) {
      
    }
  }

  /**
   * Store notification interaction for analytics
   */
  private storeNotificationInteraction(interaction: any): void {
    try {
      
      // Here you could send to analytics service
    } catch (error) {
      
    }
  }

  /**
   * Handle navigation based on notification data
   */
  private handleNotificationNavigation(data: any): void {
    try {
      

      if (!data) {
        
        return;
      }

      // Navigation logic based on notification type
      switch (data.type) {
        case "RIDE_REQUEST":
          
          // router.push("/driver/ride-requests");
          break;

        case "RIDE_ACCEPTED":
          
          // router.push(`/ride/${data.rideId}`);
          break;

        case "DRIVER_ARRIVED":
          
          // router.push(`/ride/${data.rideId}/pickup`);
          break;

        case "RIDE_STARTED":
          
          // Update ride status in store
          break;

        case "RIDE_COMPLETED":
          
          // router.push(`/ride/${data.rideId}/completed`);
          break;

        case "RIDE_CANCELLED":
          
          // router.push("/home");
          break;

        case "CHAT_MESSAGE":
          
          // Could show in-app chat or navigate to chat screen
          break;

        case "EMERGENCY_ALERT":
          
          // Show emergency screen
          break;

        default:
          
        // router.push("/home");
      }
    } catch (error) {
      
    }
  }

  /**
   * Cleanup notification listeners
   */
  cleanup(): void {
    

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
export const simulateFirebaseNotification = (data: {
  title: string;
  body: string;
  data?: any;
  type?: "foreground" | "background";
}) => firebaseService.simulateFirebaseNotification(data);
