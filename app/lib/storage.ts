import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER_SELECTED_MODE: 'user_selected_mode',
  USER_MODE: 'user_mode',
  DRIVER_REGISTERED: 'driver_registered',
  BUSINESS_REGISTERED: 'business_registered',
  DRIVER_INFO: 'driver_info',
  BUSINESS_INFO: 'business_info',
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
      console.error('Error clearing storage:', error);
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
  getCurrentMode: async (): Promise<'customer' | 'driver' | 'business' | null> => {
    const mode = await storage.getItem(STORAGE_KEYS.USER_MODE);
    return mode as 'customer' | 'driver' | 'business' | null;
  },

  // Set user mode
  setMode: async (mode: 'customer' | 'driver' | 'business'): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.USER_SELECTED_MODE, mode);
    await storage.setItem(STORAGE_KEYS.USER_MODE, mode);
  },

  // Check if user is registered as driver
  isDriverRegistered: async (): Promise<boolean> => {
    const registered = await storage.getItem(STORAGE_KEYS.DRIVER_REGISTERED);
    return registered === 'true';
  },

  // Check if user is registered as business
  isBusinessRegistered: async (): Promise<boolean> => {
    const registered = await storage.getItem(STORAGE_KEYS.BUSINESS_REGISTERED);
    return registered === 'true';
  },

  // Set driver registration
  setDriverRegistered: async (info: any): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.DRIVER_REGISTERED, 'true');
    await storage.setItem(STORAGE_KEYS.USER_MODE, 'driver');
    await storage.setItem(STORAGE_KEYS.DRIVER_INFO, JSON.stringify(info));
  },

  // Set business registration
  setBusinessRegistered: async (info: any): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.BUSINESS_REGISTERED, 'true');
    await storage.setItem(STORAGE_KEYS.USER_MODE, 'business');
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
