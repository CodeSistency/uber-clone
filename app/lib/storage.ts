import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  NotificationPreferences,
  DeviceToken,
  NotificationData,
  ChatMessage,
  EmergencyContact,
  EmergencyAlert,
  ConnectionStatus,
} from "../../types/type";

// Storage keys
export const STORAGE_KEYS = {
  // Existing keys
  USER_SELECTED_MODE: "user_selected_mode",
  USER_MODE: "user_mode",
  DRIVER_REGISTERED: "driver_registered",
  BUSINESS_REGISTERED: "business_registered",
  DRIVER_INFO: "driver_info",
  BUSINESS_INFO: "business_info",

  // Notification keys
  NOTIFICATION_PREFERENCES: "notification_preferences",
  NOTIFICATION_HISTORY: "notification_history",
  DEVICE_TOKEN: "device_token",

  // Chat keys
  CHAT_HISTORY_PREFIX: "chat_history_",
  CHAT_SETTINGS: "chat_settings",

  // Emergency keys
  EMERGENCY_CONTACTS: "emergency_contacts",
  EMERGENCY_HISTORY: "emergency_history",
  EMERGENCY_SETTINGS: "emergency_settings",

  // Real-time keys
  CONNECTION_STATUS: "connection_status",
  WEBSOCKET_SETTINGS: "websocket_settings",

  // Onboarding keys
  ONBOARDING_COMPLETED: "onboarding_completed",
  ONBOARDING_DATA: "onboarding_data",
  ONBOARDING_STEP: "onboarding_step",
} as const;

// Generic storage functions
export const storage = {
  // Set item
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  },

  // Get item
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  // Remove item
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  },

  // Clear all storage
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  },
};

// User mode specific functions
export const userModeStorage = {
  // Check if user has selected a mode
  hasSelectedMode: async (): Promise<boolean> => {
    const mode = await storage.getItem(STORAGE_KEYS.USER_SELECTED_MODE);
    return mode !== null;
  },

  // Get current user mode
  getCurrentMode: async (): Promise<
    "customer" | "driver" | "business" | null
  > => {
    const mode = await storage.getItem(STORAGE_KEYS.USER_MODE);
    return mode as "customer" | "driver" | "business" | null;
  },

  // Set user mode
  setMode: async (mode: "customer" | "driver" | "business"): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.USER_SELECTED_MODE, mode);
    await storage.setItem(STORAGE_KEYS.USER_MODE, mode);
  },

  // Check if user is registered as driver
  isDriverRegistered: async (): Promise<boolean> => {
    const registered = await storage.getItem(STORAGE_KEYS.DRIVER_REGISTERED);
    return registered === "true";
  },

  // Check if user is registered as business
  isBusinessRegistered: async (): Promise<boolean> => {
    const registered = await storage.getItem(STORAGE_KEYS.BUSINESS_REGISTERED);
    return registered === "true";
  },

  // Set driver registration
  setDriverRegistered: async (info: any): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.DRIVER_REGISTERED, "true");
    await storage.setItem(STORAGE_KEYS.USER_MODE, "driver");
    await storage.setItem(STORAGE_KEYS.DRIVER_INFO, JSON.stringify(info));
  },

  // Set business registration
  setBusinessRegistered: async (info: any): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.BUSINESS_REGISTERED, "true");
    await storage.setItem(STORAGE_KEYS.USER_MODE, "business");
    await storage.setItem(STORAGE_KEYS.BUSINESS_INFO, JSON.stringify(info));
  },

  // Get driver info
  getDriverInfo: async (): Promise<any | null> => {
    const info = await storage.getItem(STORAGE_KEYS.DRIVER_INFO);
    return info ? JSON.parse(info) : null;
  },

  // Get business info
  getBusinessInfo: async (): Promise<any | null> => {
    const info = await storage.getItem(STORAGE_KEYS.BUSINESS_INFO);
    return info ? JSON.parse(info) : null;
  },
};

// Notification storage utilities
export const notificationStorage = {
  // Notification preferences
  savePreferences: async (
    preferences: NotificationPreferences,
  ): Promise<void> => {
    try {
      await storage.setItem(
        STORAGE_KEYS.NOTIFICATION_PREFERENCES,
        JSON.stringify(preferences),
      );
      console.log("[NotificationStorage] Preferences saved");
    } catch (error) {
      console.error("[NotificationStorage] Failed to save preferences:", error);
      throw error;
    }
  },

  getPreferences: async (): Promise<NotificationPreferences | null> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("[NotificationStorage] Failed to get preferences:", error);
      return null;
    }
  },

  // Device token
  saveDeviceToken: async (token: DeviceToken): Promise<void> => {
    try {
      await storage.setItem(STORAGE_KEYS.DEVICE_TOKEN, JSON.stringify(token));
      console.log("[NotificationStorage] Device token saved");
    } catch (error) {
      console.error(
        "[NotificationStorage] Failed to save device token:",
        error,
      );
      throw error;
    }
  },

  getDeviceToken: async (): Promise<DeviceToken | null> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.DEVICE_TOKEN);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("[NotificationStorage] Failed to get device token:", error);
      return null;
    }
  },

  // Notification history (limited to last 100)
  saveNotificationHistory: async (
    notifications: NotificationData[],
  ): Promise<void> => {
    try {
      const limitedNotifications = notifications.slice(0, 100);
      await storage.setItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY,
        JSON.stringify(limitedNotifications),
      );
    } catch (error) {
      console.error(
        "[NotificationStorage] Failed to save notification history:",
        error,
      );
      throw error;
    }
  },

  getNotificationHistory: async (): Promise<NotificationData[]> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.NOTIFICATION_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(
        "[NotificationStorage] Failed to get notification history:",
        error,
      );
      return [];
    }
  },

  addNotification: async (notification: NotificationData): Promise<void> => {
    try {
      const existing = await notificationStorage.getNotificationHistory();
      const updated = [notification, ...existing].slice(0, 100);
      await notificationStorage.saveNotificationHistory(updated);
    } catch (error) {
      console.error("[NotificationStorage] Failed to add notification:", error);
      throw error;
    }
  },
};

// Chat storage utilities
export const chatStorage = {
  // Chat history for specific ride
  saveChatHistory: async (
    rideId: number,
    messages: ChatMessage[],
  ): Promise<void> => {
    try {
      const key = `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${rideId}`;
      // Keep only last 100 messages per chat
      const limitedMessages = messages.slice(-100);
      await storage.setItem(key, JSON.stringify(limitedMessages));
    } catch (error) {
      console.error("[ChatStorage] Failed to save chat history:", error);
      throw error;
    }
  },

  getChatHistory: async (rideId: number): Promise<ChatMessage[]> => {
    try {
      const key = `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${rideId}`;
      const data = await storage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("[ChatStorage] Failed to get chat history:", error);
      return [];
    }
  },

  addMessage: async (rideId: number, message: ChatMessage): Promise<void> => {
    try {
      const existing = await chatStorage.getChatHistory(rideId);
      const updated = [...existing, message].slice(-100);
      await chatStorage.saveChatHistory(rideId, updated);
    } catch (error) {
      console.error("[ChatStorage] Failed to add message:", error);
      throw error;
    }
  },

  clearChatHistory: async (rideId: number): Promise<void> => {
    try {
      const key = `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${rideId}`;
      await storage.removeItem(key);
    } catch (error) {
      console.error("[ChatStorage] Failed to clear chat history:", error);
      throw error;
    }
  },
};

// Emergency storage utilities
export const emergencyStorage = {
  // Emergency contacts
  saveEmergencyContacts: async (
    contacts: EmergencyContact[],
  ): Promise<void> => {
    try {
      await storage.setItem(
        STORAGE_KEYS.EMERGENCY_CONTACTS,
        JSON.stringify(contacts),
      );
    } catch (error) {
      console.error(
        "[EmergencyStorage] Failed to save emergency contacts:",
        error,
      );
      throw error;
    }
  },

  getEmergencyContacts: async (): Promise<EmergencyContact[]> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(
        "[EmergencyStorage] Failed to get emergency contacts:",
        error,
      );
      return [];
    }
  },

  // Emergency history
  saveEmergencyHistory: async (history: EmergencyAlert[]): Promise<void> => {
    try {
      // Keep only last 50 emergency records
      const limitedHistory = history.slice(0, 50);
      await storage.setItem(
        STORAGE_KEYS.EMERGENCY_HISTORY,
        JSON.stringify(limitedHistory),
      );
    } catch (error) {
      console.error(
        "[EmergencyStorage] Failed to save emergency history:",
        error,
      );
      throw error;
    }
  },

  getEmergencyHistory: async (): Promise<EmergencyAlert[]> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.EMERGENCY_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(
        "[EmergencyStorage] Failed to get emergency history:",
        error,
      );
      return [];
    }
  },

  addEmergencyAlert: async (alert: EmergencyAlert): Promise<void> => {
    try {
      const existing = await emergencyStorage.getEmergencyHistory();
      const updated = [alert, ...existing].slice(0, 50);
      await emergencyStorage.saveEmergencyHistory(updated);
    } catch (error) {
      console.error("[EmergencyStorage] Failed to add emergency alert:", error);
      throw error;
    }
  },
};

// Real-time storage utilities
export const realtimeStorage = {
  // Connection status
  saveConnectionStatus: async (status: ConnectionStatus): Promise<void> => {
    try {
      await storage.setItem(
        STORAGE_KEYS.CONNECTION_STATUS,
        JSON.stringify(status),
      );
    } catch (error) {
      console.error(
        "[RealtimeStorage] Failed to save connection status:",
        error,
      );
      throw error;
    }
  },

  getConnectionStatus: async (): Promise<ConnectionStatus | null> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.CONNECTION_STATUS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(
        "[RealtimeStorage] Failed to get connection status:",
        error,
      );
      return null;
    }
  },

  // WebSocket settings
  saveWebSocketSettings: async (settings: any): Promise<void> => {
    try {
      await storage.setItem(
        STORAGE_KEYS.WEBSOCKET_SETTINGS,
        JSON.stringify(settings),
      );
    } catch (error) {
      console.error(
        "[RealtimeStorage] Failed to save WebSocket settings:",
        error,
      );
      throw error;
    }
  },

  getWebSocketSettings: async (): Promise<any | null> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.WEBSOCKET_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(
        "[RealtimeStorage] Failed to get WebSocket settings:",
        error,
      );
      return null;
    }
  },
};

// Onboarding storage utilities
export const onboardingStorage = {
  // Check if onboarding is completed
  isCompleted: async (): Promise<boolean> => {
    try {
      const completed = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return completed === "true";
    } catch (error) {
      console.error("[OnboardingStorage] Error checking completion status:", error);
      return false;
    }
  },

  // Set onboarding as completed
  setCompleted: async (completed: boolean = true): Promise<void> => {
    try {
      await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed.toString());
      console.log("[OnboardingStorage] Onboarding completion status saved:", completed);
    } catch (error) {
      console.error("[OnboardingStorage] Error saving completion status:", error);
      throw error;
    }
  },

  // Save onboarding data
  saveData: async (data: any): Promise<void> => {
    try {
      await storage.setItem(STORAGE_KEYS.ONBOARDING_DATA, JSON.stringify(data));
      console.log("[OnboardingStorage] Onboarding data saved");
    } catch (error) {
      console.error("[OnboardingStorage] Error saving onboarding data:", error);
      throw error;
    }
  },

  // Get onboarding data
  getData: async (): Promise<any | null> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("[OnboardingStorage] Error getting onboarding data:", error);
      return null;
    }
  },

  // Save current step
  saveStep: async (step: number): Promise<void> => {
    try {
      await storage.setItem(STORAGE_KEYS.ONBOARDING_STEP, step.toString());
    } catch (error) {
      console.error("[OnboardingStorage] Error saving step:", error);
      throw error;
    }
  },

  // Get current step
  getStep: async (): Promise<number> => {
    try {
      const step = await storage.getItem(STORAGE_KEYS.ONBOARDING_STEP);
      return step ? parseInt(step, 10) : 0;
    } catch (error) {
      console.error("[OnboardingStorage] Error getting step:", error);
      return 0;
    }
  },

  // Clear all onboarding data
  clear: async (): Promise<void> => {
    try {
      await storage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      await storage.removeItem(STORAGE_KEYS.ONBOARDING_DATA);
      await storage.removeItem(STORAGE_KEYS.ONBOARDING_STEP);
      console.log("[OnboardingStorage] All onboarding data cleared");
    } catch (error) {
      console.error("[OnboardingStorage] Error clearing onboarding data:", error);
      throw error;
    }
  },
};

export default {
  storage,
  userModeStorage,
  notificationStorage,
  chatStorage,
  emergencyStorage,
  realtimeStorage,
  onboardingStorage,
  STORAGE_KEYS,
};