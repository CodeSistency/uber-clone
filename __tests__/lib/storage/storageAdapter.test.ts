import { MMKVStorageAdapter } from '@/lib/storage/storageAdapter';
import { mmkvProvider } from '@/lib/storage/mmkvProvider';

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(),
    getAllKeys: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('MMKVStorageAdapter', () => {
  let adapter: MMKVStorageAdapter;
  let mockMMKV: any;

  beforeEach(() => {
    mockMMKV = {
      getString: jest.fn(),
      set: jest.fn(),
      getNumber: jest.fn(),
      getBoolean: jest.fn(),
      delete: jest.fn(),
      contains: jest.fn(),
      getAllKeys: jest.fn(),
      clearAll: jest.fn(),
    };
    
    adapter = new MMKVStorageAdapter(mockMMKV, true); // Enable fallback
  });

  describe('String operations', () => {
    it('should get string value', () => {
      mockMMKV.getString.mockReturnValue('test value');
      
      const result = adapter.getString('test-key');
      
      expect(result).toBe('test value');
      expect(mockMMKV.getString).toHaveBeenCalledWith('test-key');
    });

    it('should set string value', () => {
      adapter.setString('test-key', 'test value');
      
      expect(mockMMKV.set).toHaveBeenCalledWith('test-key', 'test value');
    });

    it('should return undefined when getString fails', () => {
      mockMMKV.getString.mockImplementation(() => {
        throw new Error('MMKV error');
      });
      
      const result = adapter.getString('test-key');
      
      expect(result).toBeUndefined();
    });
  });

  describe('Number operations', () => {
    it('should get number value', () => {
      mockMMKV.getNumber.mockReturnValue(42);
      
      const result = adapter.getNumber('test-key');
      
      expect(result).toBe(42);
      expect(mockMMKV.getNumber).toHaveBeenCalledWith('test-key');
    });

    it('should set number value', () => {
      adapter.setNumber('test-key', 42);
      
      expect(mockMMKV.set).toHaveBeenCalledWith('test-key', 42);
    });
  });

  describe('Boolean operations', () => {
    it('should get boolean value', () => {
      mockMMKV.getBoolean.mockReturnValue(true);
      
      const result = adapter.getBoolean('test-key');
      
      expect(result).toBe(true);
      expect(mockMMKV.getBoolean).toHaveBeenCalledWith('test-key');
    });

    it('should set boolean value', () => {
      adapter.setBoolean('test-key', true);
      
      expect(mockMMKV.set).toHaveBeenCalledWith('test-key', true);
    });
  });

  describe('Async operations', () => {
    it('should get item asynchronously', async () => {
      mockMMKV.getString.mockReturnValue('test value');
      
      const result = await adapter.getItem('test-key');
      
      expect(result).toBe('test value');
    });

    it('should set item asynchronously', async () => {
      await adapter.setItem('test-key', 'test value');
      
      expect(mockMMKV.set).toHaveBeenCalledWith('test-key', 'test value');
    });

    it('should remove item asynchronously', async () => {
      await adapter.removeItem('test-key');
      
      expect(mockMMKV.delete).toHaveBeenCalledWith('test-key');
    });
  });

  describe('Utility operations', () => {
    it('should check if key exists', () => {
      mockMMKV.contains.mockReturnValue(true);
      
      const result = adapter.contains('test-key');
      
      expect(result).toBe(true);
      expect(mockMMKV.contains).toHaveBeenCalledWith('test-key');
    });

    it('should get all keys', () => {
      mockMMKV.getAllKeys.mockReturnValue(['key1', 'key2']);
      
      const result = adapter.getAllKeys();
      
      expect(result).toEqual(['key1', 'key2']);
      expect(mockMMKV.getAllKeys).toHaveBeenCalled();
    });

    it('should clear all data', () => {
      adapter.clearAll();
      
      expect(mockMMKV.clearAll).toHaveBeenCalled();
    });
  });
});

describe('MMKVProvider', () => {
  it('should be available', () => {
    expect(mmkvProvider).toBeDefined();
    expect(mmkvProvider.default).toBeDefined();
    expect(mmkvProvider.user).toBeDefined();
    expect(mmkvProvider.cache).toBeDefined();
    expect(mmkvProvider.secure).toBeDefined();
  });

  it('should provide storage instances', () => {
    const defaultStorage = mmkvProvider.getStorage('default');
    const userStorage = mmkvProvider.getStorage('user');
    const cacheStorage = mmkvProvider.getStorage('cache');
    const secureStorage = mmkvProvider.getStorage('secure');

    expect(defaultStorage).toBeDefined();
    expect(userStorage).toBeDefined();
    expect(cacheStorage).toBeDefined();
    expect(secureStorage).toBeDefined();
  });
});
