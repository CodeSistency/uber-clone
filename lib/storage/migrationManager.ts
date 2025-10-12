import AsyncStorage from '@react-native-async-storage/async-storage';
import { mmkvProvider } from './mmkvProvider';
import { log } from '@/lib/logger';

/**
 * Migration Manager - Handles automatic data migration from AsyncStorage to MMKV
 * Ensures zero data loss during the transition
 */
export class MigrationManager {
  private static instance: MigrationManager;
  private readonly MIGRATION_STATUS_KEY = '__mmkv_migration_completed__';
  private readonly MIGRATION_VERSION_KEY = '__mmkv_migration_version__';
  private readonly CURRENT_MIGRATION_VERSION = '1.0.0';

  // Data categorization rules
  private readonly USER_DATA_KEYS = [
    'user_',
    'driver_',
    'business_',
    'profile_',
    'auth_',
    'notification_preferences',
    'chat_',
    'emergency_',
    'onboarding_',
    'theme_',
  ];

  private readonly CACHE_DATA_KEYS = [
    'cache_',
    'tile_',
    'location_',
    'offline_',
    'temp_',
  ];

  private readonly SECURE_DATA_KEYS = [
    'token_',
    'password_',
    'secret_',
    'key_',
    'credential_',
    'payment_',
    'wallet_',
  ];

  private constructor() {}

  static getInstance(): MigrationManager {
    if (!MigrationManager.instance) {
      MigrationManager.instance = new MigrationManager();
    }
    return MigrationManager.instance;
  }

  /**
   * Check if migration is needed and perform it
   */
  async checkAndMigrate(): Promise<boolean> {
    try {
      log.info('Starting migration check', {
        component: 'MigrationManager',
        action: 'checkAndMigrate'
      });

      // Check if migration is already completed
      const isMigrated = await this.isMigrationCompleted();
      if (isMigrated) {
        log.info('Migration already completed', {
          component: 'MigrationManager',
          action: 'checkAndMigrate'
        });
        return true;
      }

      // Check if MMKV is available
      if (!mmkvProvider.isAvailable()) {
        log.warn('MMKV not available, skipping migration', {
          component: 'MigrationManager',
          action: 'checkAndMigrate'
        });
        return false;
      }

      // Perform migration
      const success = await this.performMigration();
      
      if (success) {
        await this.markMigrationCompleted();
        log.info('Migration completed successfully', {
          component: 'MigrationManager',
          action: 'checkAndMigrate'
        });
      } else {
        log.error('Migration failed', {
          component: 'MigrationManager',
          action: 'checkAndMigrate'
        });
      }

      return success;
    } catch (error) {
      log.error('Migration check failed', {
        component: 'MigrationManager',
        action: 'checkAndMigrate',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return false;
    }
  }

  /**
   * Check if migration has been completed
   */
  private async isMigrationCompleted(): Promise<boolean> {
    try {
      // Check in MMKV first (if available)
      if (mmkvProvider.isAvailable()) {
        const version = mmkvProvider.user.getString(this.MIGRATION_VERSION_KEY);
        if (version === this.CURRENT_MIGRATION_VERSION) {
          return true;
        }
      }

      // Fallback to AsyncStorage check
      const status = await AsyncStorage.getItem(this.MIGRATION_STATUS_KEY);
      return status === 'completed';
    } catch (error) {
      log.error('Failed to check migration status', {
        component: 'MigrationManager',
        action: 'isMigrationCompleted',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return false;
    }
  }

  /**
   * Mark migration as completed
   */
  private async markMigrationCompleted(): Promise<void> {
    try {
      // Mark in MMKV
      mmkvProvider.user.set(this.MIGRATION_VERSION_KEY, this.CURRENT_MIGRATION_VERSION);
      mmkvProvider.user.set(this.MIGRATION_STATUS_KEY, 'completed');

      // Also mark in AsyncStorage for backward compatibility
      await AsyncStorage.setItem(this.MIGRATION_STATUS_KEY, 'completed');
      await AsyncStorage.setItem(this.MIGRATION_VERSION_KEY, this.CURRENT_MIGRATION_VERSION);

      log.info('Migration marked as completed', {
        component: 'MigrationManager',
        action: 'markMigrationCompleted',
        data: { version: this.CURRENT_MIGRATION_VERSION }
      });
    } catch (error) {
      log.error('Failed to mark migration as completed', {
        component: 'MigrationManager',
        action: 'markMigrationCompleted',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  /**
   * Perform the actual migration
   */
  private async performMigration(): Promise<boolean> {
    try {
      log.info('Starting data migration', {
        component: 'MigrationManager',
        action: 'performMigration'
      });

      // Get all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();
      log.info('Found AsyncStorage keys', {
        component: 'MigrationManager',
        action: 'performMigration',
        data: { keyCount: allKeys.length }
      });

      if (allKeys.length === 0) {
        log.info('No data to migrate', {
          component: 'MigrationManager',
          action: 'performMigration'
        });
        return true;
      }

      // Categorize keys
      const categorizedKeys = this.categorizeKeys(allKeys);
      
      // Migrate data by category
      await this.migrateCategory('user', categorizedKeys.user);
      await this.migrateCategory('cache', categorizedKeys.cache);
      await this.migrateCategory('secure', categorizedKeys.secure);
      await this.migrateCategory('default', categorizedKeys.default);

      log.info('Data migration completed', {
        component: 'MigrationManager',
        action: 'performMigration',
        data: {
          userKeys: categorizedKeys.user.length,
          cacheKeys: categorizedKeys.cache.length,
          secureKeys: categorizedKeys.secure.length,
          defaultKeys: categorizedKeys.default.length
        }
      });

      return true;
    } catch (error) {
      log.error('Migration failed', {
        component: 'MigrationManager',
        action: 'performMigration',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return false;
    }
  }

  /**
   * Categorize keys based on their prefixes and patterns
   */
  private categorizeKeys(keys: string[]): {
    user: string[];
    cache: string[];
    secure: string[];
    default: string[];
  } {
    const categorized = {
      user: [] as string[],
      cache: [] as string[],
      secure: [] as string[],
      default: [] as string[],
    };

    for (const key of keys) {
      // Skip migration status keys
      if (key.startsWith('__mmkv_')) {
        continue;
      }

      let categorized = false;

      // Check for user data
      for (const prefix of this.USER_DATA_KEYS) {
        if (key.startsWith(prefix)) {
          categorized.user.push(key);
          categorized = true;
          break;
        }
      }

      if (categorized) continue;

      // Check for cache data
      for (const prefix of this.CACHE_DATA_KEYS) {
        if (key.startsWith(prefix)) {
          categorized.cache.push(key);
          categorized = true;
          break;
        }
      }

      if (categorized) continue;

      // Check for secure data
      for (const prefix of this.SECURE_DATA_KEYS) {
        if (key.startsWith(prefix)) {
          categorized.secure.push(key);
          categorized = true;
          break;
        }
      }

      if (categorized) continue;

      // Everything else goes to default
      categorized.default.push(key);
    }

    return categorized;
  }

  /**
   * Migrate data for a specific category
   */
  private async migrateCategory(
    category: 'user' | 'cache' | 'secure' | 'default',
    keys: string[]
  ): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    try {
      const storage = mmkvProvider.getStorage(category);
      let successCount = 0;
      let errorCount = 0;

      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value !== null) {
            storage.set(key, value);
            successCount++;
          }
        } catch (error) {
          log.warn('Failed to migrate key', {
            component: 'MigrationManager',
            action: 'migrateCategory',
            data: {
              category,
              key,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          });
          errorCount++;
        }
      }

      log.info('Category migration completed', {
        component: 'MigrationManager',
        action: 'migrateCategory',
        data: {
          category,
          totalKeys: keys.length,
          successCount,
          errorCount
        }
      });
    } catch (error) {
      log.error('Category migration failed', {
        component: 'MigrationManager',
        action: 'migrateCategory',
        data: {
          category,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  /**
   * Reset migration status (for testing or manual reset)
   */
  async resetMigrationStatus(): Promise<void> {
    try {
      // Clear from MMKV
      mmkvProvider.user.delete(this.MIGRATION_STATUS_KEY);
      mmkvProvider.user.delete(this.MIGRATION_VERSION_KEY);

      // Clear from AsyncStorage
      await AsyncStorage.removeItem(this.MIGRATION_STATUS_KEY);
      await AsyncStorage.removeItem(this.MIGRATION_VERSION_KEY);

      log.info('Migration status reset', {
        component: 'MigrationManager',
        action: 'resetMigrationStatus'
      });
    } catch (error) {
      log.error('Failed to reset migration status', {
        component: 'MigrationManager',
        action: 'resetMigrationStatus',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  /**
   * Get migration statistics
   */
  async getMigrationStats(): Promise<{
    isCompleted: boolean;
    version: string | null;
    asyncStorageKeys: number;
    mmkvStats: any;
  }> {
    try {
      const isCompleted = await this.isMigrationCompleted();
      const version = mmkvProvider.user.getString(this.MIGRATION_VERSION_KEY);
      const asyncStorageKeys = (await AsyncStorage.getAllKeys()).length;
      const mmkvStats = mmkvProvider.getStats();

      return {
        isCompleted,
        version,
        asyncStorageKeys,
        mmkvStats
      };
    } catch (error) {
      log.error('Failed to get migration stats', {
        component: 'MigrationManager',
        action: 'getMigrationStats',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return {
        isCompleted: false,
        version: null,
        asyncStorageKeys: 0,
        mmkvStats: null
      };
    }
  }
}

// Export singleton instance
export const migrationManager = MigrationManager.getInstance();
