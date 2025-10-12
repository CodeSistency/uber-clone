import { StateStorage, StorageValue } from 'zustand/middleware';
import { mmkvProvider } from './mmkvProvider';
import { log } from '@/lib/logger';

/**
 * Zustand MMKV Storage Adapter
 * Provides a StateStorage interface for Zustand's persist middleware using MMKV
 */
export const mmkvStorage: StateStorage = {
  getItem: (name: string) => {
    try {
      const value = mmkvProvider.user.getString(name);
      return value ?? null;
    } catch (error) {
      log.error('MMKV storage getItem failed', {
        component: 'ZustandMMKVAdapter',
        action: 'getItem',
        data: {
          key: name,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return null;
    }
  },

  setItem: (name: string, value: string) => {
    try {
      mmkvProvider.user.set(name, value);
    } catch (error) {
      log.error('MMKV storage setItem failed', {
        component: 'ZustandMMKVAdapter',
        action: 'setItem',
        data: {
          key: name,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  },

  removeItem: (name: string) => {
    try {
      mmkvProvider.user.delete(name);
    } catch (error) {
      log.error('MMKV storage removeItem failed', {
        component: 'ZustandMMKVAdapter',
        action: 'removeItem',
        data: {
          key: name,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  },
};

/**
 * Create a custom storage adapter for specific MMKV instance
 * Useful for storing different types of data in different MMKV instances
 */
export const createMMKVStorage = (category: 'default' | 'user' | 'cache' | 'secure'): StateStorage => {
  const storage = mmkvProvider.getStorage(category);

  return {
    getItem: (name: string): string | null => {
      try {
        const value = storage.getString(name);
        return value ?? null;
      } catch (error) {
        log.error('MMKV storage getItem failed', {
          component: 'ZustandMMKVAdapter',
          action: 'getItem',
          data: {
            category,
            key: name,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        return null;
      }
    },

    setItem: (name: string, value: string): void => {
      try {
        storage.set(name, value);
      } catch (error) {
        log.error('MMKV storage setItem failed', {
          component: 'ZustandMMKVAdapter',
          action: 'setItem',
          data: {
            category,
            key: name,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        throw error;
      }
    },

    removeItem: (name: string): void => {
      try {
        storage.delete(name);
      } catch (error) {
        log.error('MMKV storage removeItem failed', {
          component: 'ZustandMMKVAdapter',
          action: 'removeItem',
          data: {
            category,
            key: name,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        throw error;
      }
    },
  };
};

/**
 * Pre-configured storage adapters for common use cases
 */
export const storageAdapters = {
  // Default storage (general app data)
  default: createMMKVStorage('default'),
  
  // User storage (user-specific data, most common for Zustand stores)
  user: createMMKVStorage('user'),
  
  // Cache storage (temporary data that can be cleared)
  cache: createMMKVStorage('cache'),
  
  // Secure storage (sensitive data, encrypted)
  secure: createMMKVStorage('secure'),
};

/**
 * Helper function to create a storage adapter with error handling
 */
export const createSafeMMKVStorage = (category: 'default' | 'user' | 'cache' | 'secure'): StateStorage => {
  const baseStorage = createMMKVStorage(category);

  return {
    getItem: (name: string): string | null => {
      try {
        return baseStorage.getItem(name);
      } catch (error) {
        log.error('Safe MMKV storage getItem failed', {
          component: 'ZustandMMKVAdapter',
          action: 'getItem',
          data: {
            category,
            key: name,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        return null;
      }
    },

    setItem: (name: string, value: string): void => {
      try {
        baseStorage.setItem(name, value);
      } catch (error) {
        log.error('Safe MMKV storage setItem failed', {
          component: 'ZustandMMKVAdapter',
          action: 'setItem',
          data: {
            category,
            key: name,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        // Don't throw error in safe mode, just log it
      }
    },

    removeItem: (name: string): void => {
      try {
        baseStorage.removeItem(name);
      } catch (error) {
        log.error('Safe MMKV storage removeItem failed', {
          component: 'ZustandMMKVAdapter',
          action: 'removeItem',
          data: {
            category,
            key: name,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        // Don't throw error in safe mode, just log it
      }
    },
  };
};

// Export the default user storage as the main adapter
export default mmkvStorage;
