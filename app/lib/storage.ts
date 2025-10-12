import AsyncStorage from "@react-native-async-storage/async-storage";
import { MMKVStorageAdapter } from "@/lib/storage/storageAdapter";
import { mmkvProvider } from "@/lib/storage/mmkvProvider";
import { migrationManager } from "@/lib/storage/migrationManager";

import { log } from "@/lib/logger";

import {
  NotificationPreferences,
  DeviceToken,
  NotificationData,
  ChatMessage,
  EmergencyContact,
  EmergencyAlert,
  ConnectionStatus,
} from "../../types/type";

// Chat storage utilities

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

  // Theme keys
  APP_THEME: "app_theme",
} as const;

// Initialize storage adapter
let storageAdapter: MMKVStorageAdapter;

// Initialize storage with MMKV and fallback to AsyncStorage
const initializeStorage = async () => {
  try {
    // Check if migration is needed and perform it
    await migrationManager.checkAndMigrate();
    
    // Initialize MMKV storage adapter
    storageAdapter = new MMKVStorageAdapter(mmkvProvider.user, true);
    
    log.info('Storage initialized with MMKV', {
      component: 'Storage',
      action: 'initializeStorage'
    });
  } catch (error) {
    log.error('Failed to initialize MMKV storage, falling back to AsyncStorage', {
      component: 'Storage',
      action: 'initializeStorage',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    // Fallback to AsyncStorage adapter
    storageAdapter = new MMKVStorageAdapter(mmkvProvider.user, true);
  }
};

// Initialize storage immediately
initializeStorage();

// Generic storage functions
export const storage = {
  // Set item
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (storageAdapter) {
        await storageAdapter.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      log.error('Storage setItem failed', {
        component: 'Storage',
        action: 'setItem',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  },

  // Get item
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (storageAdapter) {
        return await storageAdapter.getItem(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      log.error('Storage getItem failed', {
        component: 'Storage',
        action: 'getItem',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return null;
    }
  },

  // Remove item
  removeItem: async (key: string): Promise<void> => {
    try {
      if (storageAdapter) {
        await storageAdapter.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      log.error('Storage removeItem failed', {
        component: 'Storage',
        action: 'removeItem',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  },

  // Clear all storage
  clear: async (): Promise<void> => {
    try {
      if (storageAdapter) {
        await storageAdapter.clear();
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      log.error('Storage clear failed', {
        component: 'Storage',
        action: 'clear',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  },

  // Synchronous methods (MMKV only)
  getString: (key: string): string | undefined => {
    try {
      if (storageAdapter) {
        return storageAdapter.getString(key);
      }
      return undefined;
    } catch (error) {
      log.error('Storage getString failed', {
        component: 'Storage',
        action: 'getString',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return undefined;
    }
  },

  setString: (key: string, value: string): void => {
    try {
      if (storageAdapter) {
        storageAdapter.setString(key, value);
      }
    } catch (error) {
      log.error('Storage setString failed', {
        component: 'Storage',
        action: 'setString',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  },

  getBoolean: (key: string): boolean | undefined => {
    try {
      if (storageAdapter) {
        return storageAdapter.getBoolean(key);
      }
      return undefined;
    } catch (error) {
      log.error('Storage getBoolean failed', {
        component: 'Storage',
        action: 'getBoolean',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return undefined;
    }
  },

  setBoolean: (key: string, value: boolean): void => {
    try {
      if (storageAdapter) {
        storageAdapter.setBoolean(key, value);
      }
    } catch (error) {
      log.error('Storage setBoolean failed', {
        component: 'Storage',
        action: 'setBoolean',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  },

  getNumber: (key: string): number | undefined => {
    try {
      if (storageAdapter) {
        return storageAdapter.getNumber(key);
      }
      return undefined;
    } catch (error) {
      log.error('Storage getNumber failed', {
        component: 'Storage',
        action: 'getNumber',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return undefined;
    }
  },

  setNumber: (key: string, value: number): void => {
    try {
      if (storageAdapter) {
        storageAdapter.setNumber(key, value);
      }
    } catch (error) {
      log.error('Storage setNumber failed', {
        component: 'Storage',
        action: 'setNumber',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  },

  delete: (key: string): void => {
    try {
      if (storageAdapter) {
        storageAdapter.delete(key);
      }
    } catch (error) {
      log.error('Storage delete failed', {
        component: 'Storage',
        action: 'delete',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  },

  contains: (key: string): boolean => {
    try {
      if (storageAdapter) {
        return storageAdapter.contains(key);
      }
      return false;
    } catch (error) {
      log.error('Storage contains failed', {
        component: 'Storage',
        action: 'contains',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return false;
    }
  },

  getAllKeys: (): string[] => {
    try {
      if (storageAdapter) {
        return storageAdapter.getAllKeys();
      }
      return [];
    } catch (error) {
      log.error('Storage getAllKeys failed', {
        component: 'Storage',
        action: 'getAllKeys',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  },

  clearAll: (): void => {
    try {
      if (storageAdapter) {
        storageAdapter.clearAll();
      }
    } catch (error) {
      log.error('Storage clearAll failed', {
        component: 'Storage',
        action: 'clearAll',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
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
      
    } catch (error) {
      
      throw error;
    }
  },

  getPreferences: async (): Promise<NotificationPreferences | null> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      
      return null;
    }
  },

  // Device token
  saveDeviceToken: async (token: DeviceToken): Promise<void> => {
    try {
      await storage.setItem(STORAGE_KEYS.DEVICE_TOKEN, JSON.stringify(token));
      
    } catch (error) {
      
      throw error;
    }
  },

  getDeviceToken: async (): Promise<DeviceToken | null> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.DEVICE_TOKEN);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      
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
      
      throw error;
    }
  },

  getNotificationHistory: async (): Promise<NotificationData[]> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.NOTIFICATION_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      
      return [];
    }
  },

  addNotification: async (notification: NotificationData): Promise<void> => {
    try {
      const existing = await notificationStorage.getNotificationHistory();
      const updated = [notification, ...existing].slice(0, 100);
      await notificationStorage.saveNotificationHistory(updated);
    } catch (error) {
      
      throw error;
    }
  },
};

export const chatStorage = {
  // Chat history for specific ride or order
  saveChatHistory: async (
    chatId: number,
    messages: ChatMessage[],
    chatType: "ride" | "order" = "ride",
  ): Promise<void> => {
    try {
      const key = `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${chatType}_${chatId}`;
      // Keep only last 100 messages per chat
      const limitedMessages = messages.slice(-100);
      await storage.setItem(key, JSON.stringify(limitedMessages));

      log.debug("Chat history saved", {
        component: "ChatStorage",
        action: "saveChatHistory",
        data: {
          chatId,
          chatType,
          messageCount: limitedMessages.length,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      log.error(
        "Failed to save chat history",
        {
          component: "ChatStorage",
          action: "saveChatHistory",
          data: {
            chatId,
            chatType,
            error: errorMessage,
          },
        }
      );
      throw error;
    }
  },

  getChatHistory: async (
    chatId: number,
    chatType: "ride" | "order" = "ride",
  ): Promise<ChatMessage[]> => {
    try {
      const key = `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${chatType}_${chatId}`;
      const data = await storage.getItem(key);

      if (data) {
        const messages = JSON.parse(data);
      log.debug("Chat history loaded", {
        component: "ChatStorage",
        action: "getChatHistory",
        data: {
          chatId,
          chatType,
          messageCount: messages.length,
        },
      });
        return messages;
      }

      return [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      log.error(
        "Failed to get chat history",
        {
          component: "ChatStorage",
          action: "getChatHistory",
          data: {
            chatId,
            chatType,
            error: errorMessage,
          },
        }
      );
      return [];
    }
  },

  // Legacy method for backward compatibility
  getChatHistoryByRideId: async (rideId: number): Promise<ChatMessage[]> => {
    // Try new format first, then fall back to old format
    let messages = await chatStorage.getChatHistory(rideId, "ride");
    if (messages.length === 0) {
      // Try old format for backward compatibility
      try {
        const oldKey = `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${rideId}`;
        const data = await storage.getItem(oldKey);
        messages = data ? JSON.parse(data) : [];
      } catch (error) {
        log.warn("Old chat history format not found", {
          component: "ChatStorage",
          action: "getChatHistory",
          data: {
            rideId,
          },
        });
      }
    }
    return messages;
  },

  addMessage: async (
    chatId: number,
    message: ChatMessage,
    chatType: "ride" | "order" = "ride",
  ): Promise<void> => {
    try {
      const existing = await chatStorage.getChatHistory(chatId, chatType);
      const updated = [...existing, message].slice(-100);
      await chatStorage.saveChatHistory(chatId, updated, chatType);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      log.error(
        "Failed to add message",
        {
          component: "ChatStorage",
          action: "addMessage",
          data: {
            chatId,
            chatType,
            error: errorMessage,
          },
        }
      );
      throw error;
    }
  },

  clearChatHistory: async (
    chatId: number,
    chatType: "ride" | "order" = "ride",
  ): Promise<void> => {
    try {
      const key = `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${chatType}_${chatId}`;
      await storage.removeItem(key);

      log.info("Chat history cleared", {
        component: "ChatStorage",
        action: "clearChatHistory",
        data: {
          chatId,
          chatType,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      log.error(
        "Failed to clear chat history",
        {
          component: "ChatStorage",
          action: "clearChatHistory",
          data: {
            chatId,
            chatType,
            error: errorMessage,
          },
        }
      );
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
      
      throw error;
    }
  },

  getEmergencyContacts: async (): Promise<EmergencyContact[]> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      
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
      
      throw error;
    }
  },

  getEmergencyHistory: async (): Promise<EmergencyAlert[]> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.EMERGENCY_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      
      return [];
    }
  },

  addEmergencyAlert: async (alert: EmergencyAlert): Promise<void> => {
    try {
      const existing = await emergencyStorage.getEmergencyHistory();
      const updated = [alert, ...existing].slice(0, 50);
      await emergencyStorage.saveEmergencyHistory(updated);
    } catch (error) {
      
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
      
      throw error;
    }
  },

  getConnectionStatus: async (): Promise<ConnectionStatus | null> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.CONNECTION_STATUS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      
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
      
      throw error;
    }
  },

  getWebSocketSettings: async (): Promise<any | null> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.WEBSOCKET_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      
      return null;
    }
  },
};

// Onboarding storage utilities
export const onboardingStorage = {
  // Check if onboarding is completed
  isCompleted: async (): Promise<boolean> => {
    try {
      const completed = await storage.getItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
      );
      return completed === "true";
    } catch (error) {
      
      return false;
    }
  },

  // Set onboarding as completed
  setCompleted: async (completed: boolean = true): Promise<void> => {
    try {
      await storage.setItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        completed.toString(),
      );
      
    } catch (error) {
      
      throw error;
    }
  },

  // Save onboarding data
  saveData: async (data: any): Promise<void> => {
    try {
      await storage.setItem(STORAGE_KEYS.ONBOARDING_DATA, JSON.stringify(data));
      
    } catch (error) {
      
      throw error;
    }
  },

  // Get onboarding data
  getData: async (): Promise<any | null> => {
    try {
      const data = await storage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      
      return null;
    }
  },

  // Save current step
  saveStep: async (step: number): Promise<void> => {
    try {
      await storage.setItem(STORAGE_KEYS.ONBOARDING_STEP, step.toString());
    } catch (error) {
      
      throw error;
    }
  },

  // Get current step
  getStep: async (): Promise<number> => {
    try {
      const step = await storage.getItem(STORAGE_KEYS.ONBOARDING_STEP);
      // Some legacy values may be string ids, normalize here
      const map: Record<string, number> = {
        location: 0,
        "travel-preferences": 1,
        "phone-verification": 2,
        "profile-completion": 3,
      };
      if (!step) return 0;
      if (/^\d+$/.test(step)) {
        const n = parseInt(step, 10);
        return Number.isFinite(n) ? Math.max(0, Math.min(3, n)) : 0;
      }
      return map[step] ?? 0;
    } catch (error) {
      
      return 0;
    }
  },

  // Clear all onboarding data
  clear: async (): Promise<void> => {
    try {
      await storage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      await storage.removeItem(STORAGE_KEYS.ONBOARDING_DATA);
      await storage.removeItem(STORAGE_KEYS.ONBOARDING_STEP);
      
    } catch (error) {
      
      throw error;
    }
  },
};

// Theme storage utilities
export const themeStorage = {
  // Save theme ('light' | 'dark' | 'system')
  saveTheme: async (theme: "light" | "dark" | "system"): Promise<void> => {
    try {
      await storage.setItem(STORAGE_KEYS.APP_THEME, theme);
    } catch (error) {
      
      throw error;
    }
  },

  // Get theme
  getTheme: async (): Promise<"light" | "dark" | "system" | null> => {
    try {
      const t = await storage.getItem(STORAGE_KEYS.APP_THEME);
      return (t as any) || null;
    } catch (error) {
      
      return null;
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
  themeStorage,
  STORAGE_KEYS,
};
