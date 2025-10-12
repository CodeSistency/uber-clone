import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '@/lib/logger';

/**
 * Storage adapter interface that provides a unified API for both MMKV and AsyncStorage
 * This allows for gradual migration and fallback support
 */
export interface IStorageAdapter {
  getString(key: string): string | undefined;
  setString(key: string, value: string): void;
  getNumber(key: string): number | undefined;
  setNumber(key: string, value: number): void;
  getBoolean(key: string): boolean | undefined;
  setBoolean(key: string, value: boolean): void;
  delete(key: string): void;
  contains(key: string): boolean;
  getAllKeys(): string[];
  clearAll(): void;
  
  // Async methods for backward compatibility
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * MMKV Storage Adapter
 * Provides high-performance synchronous storage with fallback to AsyncStorage
 */
export class MMKVStorageAdapter implements IStorageAdapter {
  private mmkv: MMKV;
  private fallbackToAsyncStorage: boolean = false;

  constructor(mmkv: MMKV, fallbackToAsyncStorage: boolean = true) {
    this.mmkv = mmkv;
    this.fallbackToAsyncStorage = fallbackToAsyncStorage;
  }

  // Synchronous methods (MMKV native)
  getString(key: string): string | undefined {
    try {
      return this.mmkv.getString(key);
    } catch (error) {
      log.error('MMKV getString failed', {
        component: 'MMKVStorageAdapter',
        action: 'getString',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      if (this.fallbackToAsyncStorage) {
        // Fallback to AsyncStorage (async, but we can't make this method async)
        return undefined;
      }
      throw error;
    }
  }

  setString(key: string, value: string): void {
    try {
      this.mmkv.set(key, value);
    } catch (error) {
      log.error('MMKV setString failed', {
        component: 'MMKVStorageAdapter',
        action: 'setString',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      if (this.fallbackToAsyncStorage) {
        // Fallback to AsyncStorage (async, but we can't make this method async)
        this.setItem(key, value).catch(err => {
          log.error('AsyncStorage fallback failed', {
            component: 'MMKVStorageAdapter',
            action: 'setString',
            data: { key, error: err instanceof Error ? err.message : 'Unknown error' }
          });
        });
      } else {
        throw error;
      }
    }
  }

  getNumber(key: string): number | undefined {
    try {
      return this.mmkv.getNumber(key);
    } catch (error) {
      log.error('MMKV getNumber failed', {
        component: 'MMKVStorageAdapter',
        action: 'getNumber',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return undefined;
    }
  }

  setNumber(key: string, value: number): void {
    try {
      this.mmkv.set(key, value);
    } catch (error) {
      log.error('MMKV setNumber failed', {
        component: 'MMKVStorageAdapter',
        action: 'setNumber',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  getBoolean(key: string): boolean | undefined {
    try {
      return this.mmkv.getBoolean(key);
    } catch (error) {
      log.error('MMKV getBoolean failed', {
        component: 'MMKVStorageAdapter',
        action: 'getBoolean',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return undefined;
    }
  }

  setBoolean(key: string, value: boolean): void {
    try {
      this.mmkv.set(key, value);
    } catch (error) {
      log.error('MMKV setBoolean failed', {
        component: 'MMKVStorageAdapter',
        action: 'setBoolean',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  delete(key: string): void {
    try {
      this.mmkv.delete(key);
    } catch (error) {
      log.error('MMKV delete failed', {
        component: 'MMKVStorageAdapter',
        action: 'delete',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      if (this.fallbackToAsyncStorage) {
        this.removeItem(key).catch(err => {
          log.error('AsyncStorage fallback failed', {
            component: 'MMKVStorageAdapter',
            action: 'delete',
            data: { key, error: err instanceof Error ? err.message : 'Unknown error' }
          });
        });
      } else {
        throw error;
      }
    }
  }

  contains(key: string): boolean {
    try {
      return this.mmkv.contains(key);
    } catch (error) {
      log.error('MMKV contains failed', {
        component: 'MMKVStorageAdapter',
        action: 'contains',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return false;
    }
  }

  getAllKeys(): string[] {
    try {
      return this.mmkv.getAllKeys();
    } catch (error) {
      log.error('MMKV getAllKeys failed', {
        component: 'MMKVStorageAdapter',
        action: 'getAllKeys',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  clearAll(): void {
    try {
      this.mmkv.clearAll();
    } catch (error) {
      log.error('MMKV clearAll failed', {
        component: 'MMKVStorageAdapter',
        action: 'clearAll',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  // Async methods for backward compatibility
  async getItem(key: string): Promise<string | null> {
    try {
      const value = this.getString(key);
      return value ?? null;
    } catch (error) {
      if (this.fallbackToAsyncStorage) {
        try {
          return await AsyncStorage.getItem(key);
        } catch (asyncError) {
          log.error('AsyncStorage fallback failed', {
            component: 'MMKVStorageAdapter',
            action: 'getItem',
            data: { key, error: asyncError instanceof Error ? asyncError.message : 'Unknown error' }
          });
          return null;
        }
      }
      throw error;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.setString(key, value);
    } catch (error) {
      if (this.fallbackToAsyncStorage) {
        try {
          await AsyncStorage.setItem(key, value);
        } catch (asyncError) {
          log.error('AsyncStorage fallback failed', {
            component: 'MMKVStorageAdapter',
            action: 'setItem',
            data: { key, error: asyncError instanceof Error ? asyncError.message : 'Unknown error' }
          });
          throw asyncError;
        }
      } else {
        throw error;
      }
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.delete(key);
    } catch (error) {
      if (this.fallbackToAsyncStorage) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (asyncError) {
          log.error('AsyncStorage fallback failed', {
            component: 'MMKVStorageAdapter',
            action: 'removeItem',
            data: { key, error: asyncError instanceof Error ? asyncError.message : 'Unknown error' }
          });
          throw asyncError;
        }
      } else {
        throw error;
      }
    }
  }

  async clear(): Promise<void> {
    try {
      this.clearAll();
    } catch (error) {
      if (this.fallbackToAsyncStorage) {
        try {
          await AsyncStorage.clear();
        } catch (asyncError) {
          log.error('AsyncStorage fallback failed', {
            component: 'MMKVStorageAdapter',
            action: 'clear',
            data: { error: asyncError instanceof Error ? asyncError.message : 'Unknown error' }
          });
          throw asyncError;
        }
      } else {
        throw error;
      }
    }
  }
}

/**
 * AsyncStorage Adapter (for fallback or testing)
 */
export class AsyncStorageAdapter implements IStorageAdapter {
  // Synchronous methods (not supported by AsyncStorage, return undefined)
  getString(key: string): string | undefined {
    return undefined;
  }

  setString(key: string, value: string): void {
    // Not supported synchronously
  }

  getNumber(key: string): number | undefined {
    return undefined;
  }

  setNumber(key: string, value: number): void {
    // Not supported synchronously
  }

  getBoolean(key: string): boolean | undefined {
    return undefined;
  }

  setBoolean(key: string, value: boolean): void {
    // Not supported synchronously
  }

  delete(key: string): void {
    // Not supported synchronously
  }

  contains(key: string): boolean {
    return false;
  }

  getAllKeys(): string[] {
    return [];
  }

  clearAll(): void {
    // Not supported synchronously
  }

  // Async methods
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      log.error('AsyncStorage getItem failed', {
        component: 'AsyncStorageAdapter',
        action: 'getItem',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      log.error('AsyncStorage setItem failed', {
        component: 'AsyncStorageAdapter',
        action: 'setItem',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      log.error('AsyncStorage removeItem failed', {
        component: 'AsyncStorageAdapter',
        action: 'removeItem',
        data: { key, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      log.error('AsyncStorage clear failed', {
        component: 'AsyncStorageAdapter',
        action: 'clear',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }
}
