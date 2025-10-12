import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';
import { log } from '@/lib/logger';

/**
 * MMKV Provider - Manages multiple MMKV instances for different data types
 * Provides organized storage with encryption support for sensitive data
 */
export class MMKVProvider {
  private static instance: MMKVProvider;
  
  // Different MMKV instances for different data categories
  public readonly default: MMKV;
  public readonly user: MMKV;
  public readonly cache: MMKV;
  public readonly secure: MMKV;

  private constructor() {
    try {
      // General app data (unencrypted, fast access)
      this.default = new MMKV({
        id: 'uber-app-default',
        encryptionKey: undefined, // No encryption for general data
      });

      // User-specific data (unencrypted, but isolated)
      this.user = new MMKV({
        id: 'uber-app-user',
        encryptionKey: undefined, // No encryption for user data (can be added later)
      });

      // Cache data (unencrypted, can be cleared frequently)
      this.cache = new MMKV({
        id: 'uber-app-cache',
        encryptionKey: undefined, // No encryption for cache
      });

      // Sensitive data (encrypted)
      this.secure = new MMKV({
        id: 'uber-app-secure',
        encryptionKey: this.generateEncryptionKey(),
      });

      log.info('MMKV instances initialized successfully', {
        component: 'MMKVProvider',
        action: 'constructor',
        data: {
          platform: Platform.OS,
          instances: ['default', 'user', 'cache', 'secure']
        }
      });

    } catch (error) {
      log.error('Failed to initialize MMKV instances', {
        component: 'MMKVProvider',
        action: 'constructor',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
          platform: Platform.OS
        }
      });
      throw error;
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MMKVProvider {
    if (!MMKVProvider.instance) {
      MMKVProvider.instance = new MMKVProvider();
    }
    return MMKVProvider.instance;
  }

  /**
   * Generate encryption key for secure storage
   * In production, this should be derived from device-specific data
   */
  private generateEncryptionKey(): string {
    // For development, use a fixed key
    // In production, generate a unique key per device/user
    const baseKey = 'uber-app-secure-key-2024';
    
    // Add some device-specific variation
    const deviceId = Platform.OS === 'ios' ? 'ios' : 'android';
    const timestamp = Date.now().toString().slice(-6);
    
    return `${baseKey}-${deviceId}-${timestamp}`;
  }

  /**
   * Get storage instance by category
   */
  getStorage(category: 'default' | 'user' | 'cache' | 'secure'): MMKV {
    switch (category) {
      case 'default':
        return this.default;
      case 'user':
        return this.user;
      case 'cache':
        return this.cache;
      case 'secure':
        return this.secure;
      default:
        throw new Error(`Unknown storage category: ${category}`);
    }
  }

  /**
   * Clear all data from a specific category
   */
  clearCategory(category: 'default' | 'user' | 'cache' | 'secure'): void {
    try {
      const storage = this.getStorage(category);
      storage.clearAll();
      
      log.info('Storage category cleared', {
        component: 'MMKVProvider',
        action: 'clearCategory',
        data: { category }
      });
    } catch (error) {
      log.error('Failed to clear storage category', {
        component: 'MMKVProvider',
        action: 'clearCategory',
        data: {
          category,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  /**
   * Clear all data from all categories
   */
  clearAll(): void {
    try {
      this.default.clearAll();
      this.user.clearAll();
      this.cache.clearAll();
      this.secure.clearAll();
      
      log.info('All storage categories cleared', {
        component: 'MMKVProvider',
        action: 'clearAll'
      });
    } catch (error) {
      log.error('Failed to clear all storage', {
        component: 'MMKVProvider',
        action: 'clearAll',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): {
    default: { keys: number; size: number };
    user: { keys: number; size: number };
    cache: { keys: number; size: number };
    secure: { keys: number; size: number };
  } {
    try {
      return {
        default: {
          keys: this.default.getAllKeys().length,
          size: this.estimateSize(this.default)
        },
        user: {
          keys: this.user.getAllKeys().length,
          size: this.estimateSize(this.user)
        },
        cache: {
          keys: this.cache.getAllKeys().length,
          size: this.estimateSize(this.cache)
        },
        secure: {
          keys: this.secure.getAllKeys().length,
          size: this.estimateSize(this.secure)
        }
      };
    } catch (error) {
      log.error('Failed to get storage stats', {
        component: 'MMKVProvider',
        action: 'getStats',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return {
        default: { keys: 0, size: 0 },
        user: { keys: 0, size: 0 },
        cache: { keys: 0, size: 0 },
        secure: { keys: 0, size: 0 }
      };
    }
  }

  /**
   * Estimate storage size (rough calculation)
   */
  private estimateSize(storage: MMKV): number {
    try {
      const keys = storage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = storage.getString(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if MMKV is available and working
   */
  isAvailable(): boolean {
    try {
      // Test basic operations
      const testKey = '__mmkv_test__';
      const testValue = 'test';
      
      this.default.set(testKey, testValue);
      const retrieved = this.default.getString(testKey);
      this.default.delete(testKey);
      
      return retrieved === testValue;
    } catch (error) {
      log.error('MMKV availability check failed', {
        component: 'MMKVProvider',
        action: 'isAvailable',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return false;
    }
  }
}

// Export singleton instance
export const mmkvProvider = MMKVProvider.getInstance();

// Export individual storage instances for convenience
export const storage = {
  default: mmkvProvider.default,
  user: mmkvProvider.user,
  cache: mmkvProvider.cache,
  secure: mmkvProvider.secure,
};
