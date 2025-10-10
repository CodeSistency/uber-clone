import { TileCache } from '@/lib/map/tileCache';
import type { DownloadableRegion, Coordinates } from '@/types/map';

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  exists: jest.fn(),
  mkdir: jest.fn(),
  readDir: jest.fn(),
  unlink: jest.fn(),
  downloadFile: jest.fn(() => ({
    promise: Promise.resolve(),
  })),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('TileCache', () => {
  let tileCache: TileCache;

  beforeEach(() => {
    tileCache = new TileCache();
  });

  const mockRegion: DownloadableRegion = {
    id: 'test-region',
    name: 'Test Region',
    bounds: {
      northEast: { latitude: 40.8, longitude: -73.9 },
      southWest: { latitude: 40.6, longitude: -74.1 },
    },
    minZoom: 10,
    maxZoom: 12,
    tileCount: 0,
    downloadedTiles: 0,
    isComplete: false,
  };

  describe('initialize', () => {
    it('should initialize without throwing', async () => {
      await expect(tileCache.initialize()).resolves.not.toThrow();
    });
  });

  describe('calculateTiles', () => {
    it('should calculate tiles for a region', () => {
      const tiles = tileCache.calculateTiles(mockRegion);
      
      expect(Array.isArray(tiles)).toBe(true);
      expect(tiles.length).toBeGreaterThan(0);
      
      // Check tile structure
      if (tiles.length > 0) {
        const tile = tiles[0];
        expect(tile).toHaveProperty('x');
        expect(tile).toHaveProperty('y');
        expect(tile).toHaveProperty('z');
        expect(tile).toHaveProperty('url');
        expect(tile).toHaveProperty('localPath');
      }
    });
  });

  describe('getCacheSize', () => {
    it('should return cache size in MB', async () => {
      const size = await tileCache.getCacheSize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('clearCache', () => {
    it('should clear cache without throwing', async () => {
      await expect(tileCache.clearCache()).resolves.not.toThrow();
    });
  });

  describe('getSavedRegions', () => {
    it('should return saved regions', async () => {
      const regions = await tileCache.getSavedRegions();
      expect(Array.isArray(regions)).toBe(true);
    });
  });
});
