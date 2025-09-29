import { jest } from '@jest/globals';
import { OfflineQueue, QueuedRequest } from '@/lib/offline/OfflineQueue';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock connectivity manager
jest.mock('@/lib/connectivity', () => ({
  connectivityManager: {
    shouldAttemptNetworkOperation: jest.fn(() => true),
  },
}));

// Mock fetchAPI
jest.mock('@/lib/fetch', () => ({
  fetchAPI: jest.fn(),
}));

describe('OfflineQueue', () => {
  let offlineQueue: OfflineQueue;
  let mockAsyncStorage: any;

  beforeEach(() => {
    jest.clearAllMocks();
    offlineQueue = OfflineQueue.getInstance();

    // Reset singleton instance
    (OfflineQueue as any).instance = null;

    mockAsyncStorage = require('@react-native-async-storage/async-storage');
  });

  afterEach(() => {
    offlineQueue.clear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = OfflineQueue.getInstance();
      const instance2 = OfflineQueue.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const mockQueue = [
        {
          id: 'test_1',
          endpoint: '/api/test',
          method: 'POST' as const,
          priority: 'medium' as const,
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockQueue));

      await offlineQueue.initialize();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@offline_queue');
      expect(offlineQueue.getQueueSize()).toBe(1);
    });

    it('should handle initialization without existing queue', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await offlineQueue.initialize();

      expect(offlineQueue.getQueueSize()).toBe(0);
    });

    it('should handle initialization errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await offlineQueue.initialize();

      expect(offlineQueue.getQueueSize()).toBe(0);
    });
  });

  describe('Request Management', () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await offlineQueue.initialize();
    });

    it('should add requests to queue', async () => {
      const request = {
        endpoint: '/api/test',
        method: 'POST' as const,
        data: { test: 'data' },
        priority: 'high' as const,
        requiresAuth: true,
      };

      const requestId = await offlineQueue.add(request);

      expect(requestId).toBeDefined();
      expect(offlineQueue.getQueueSize()).toBe(1);

      const queue = offlineQueue.getQueue();
      expect(queue[0].endpoint).toBe('/api/test');
      expect(queue[0].priority).toBe('high');
      expect(queue[0].retryCount).toBe(0);
    });

    it('should respect maximum queue size', async () => {
      // Mock a full queue
      const existingQueue = Array.from({ length: 1000 }, (_, i) => ({
        id: `req_${i}`,
        endpoint: `/api/test${i}`,
        method: 'POST' as const,
        priority: 'medium' as const,
        timestamp: Date.now() - i,
        retryCount: 0,
      }));

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingQueue));

      await offlineQueue.initialize();

      // Add one more request (should remove oldest)
      await offlineQueue.add({
        endpoint: '/api/new',
        method: 'POST' as const,
        priority: 'high' as const,
      });

      expect(offlineQueue.getQueueSize()).toBe(1000);
      expect(offlineQueue.getQueue()[999].endpoint).toBe('/api/new');
    });

    it('should remove requests by ID', async () => {
      await offlineQueue.add({
        endpoint: '/api/test',
        method: 'POST' as const,
        priority: 'medium' as const,
      });

      const queue = offlineQueue.getQueue();
      const requestId = queue[0].id;

      const removed = await offlineQueue.remove(requestId);
      expect(removed).toBe(true);
      expect(offlineQueue.getQueueSize()).toBe(0);
    });

    it('should return false when removing non-existent request', async () => {
      const removed = await offlineQueue.remove('non_existent_id');
      expect(removed).toBe(false);
    });

    it('should clear all requests', async () => {
      await offlineQueue.add({
        endpoint: '/api/test1',
        method: 'POST' as const,
        priority: 'high' as const,
      });

      await offlineQueue.add({
        endpoint: '/api/test2',
        method: 'GET' as const,
        priority: 'low' as const,
      });

      expect(offlineQueue.getQueueSize()).toBe(2);

      await offlineQueue.clear();

      expect(offlineQueue.getQueueSize()).toBe(0);
    });
  });

  describe('Priority System', () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await offlineQueue.initialize();
    });

    it('should sort requests by priority', async () => {
      await offlineQueue.add({
        endpoint: '/api/low',
        method: 'GET' as const,
        data: { test: 'data' },
        priority: 'low' as const,
      });

      await offlineQueue.add({
        endpoint: '/api/critical',
        method: 'POST' as const,
        data: { test: 'data' },
        priority: 'critical' as const,
      });

      await offlineQueue.add({
        endpoint: '/api/high',
        method: 'PUT' as const,
        data: { test: 'data' },
        priority: 'high' as const,
      });

      const queue = offlineQueue.getQueue();

      expect(queue[0].priority).toBe('critical');
      expect(queue[1].priority).toBe('high');
      expect(queue[2].priority).toBe('low');
    });

    it('should get requests by priority', async () => {
      await offlineQueue.add({
        endpoint: '/api/test1',
        method: 'POST' as const,
        priority: 'high' as const,
      });

      await offlineQueue.add({
        endpoint: '/api/test2',
        method: 'POST' as const,
        priority: 'low' as const,
      });

      const highPriority = offlineQueue.getRequestsByPriority('high');
      const lowPriority = offlineQueue.getRequestsByPriority('low');

      expect(highPriority).toHaveLength(1);
      expect(lowPriority).toHaveLength(1);
      expect(highPriority[0].endpoint).toBe('/api/test1');
      expect(lowPriority[0].endpoint).toBe('/api/test2');
    });

    it('should filter requests by endpoint', async () => {
      await offlineQueue.add({
        endpoint: '/api/rides/123',
        method: 'GET' as const,
        priority: 'medium' as const,
      });

      await offlineQueue.add({
        endpoint: '/api/users/456',
        method: 'POST' as const,
        priority: 'medium' as const,
      });

      const ridesRequests = offlineQueue.getRequestsByEndpoint('/api/rides');
      const userRequests = offlineQueue.getRequestsByEndpoint('/api/users');

      expect(ridesRequests).toHaveLength(1);
      expect(userRequests).toHaveLength(1);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await offlineQueue.initialize();
    });

    it('should calculate correct statistics', async () => {
      const now = Date.now();

      await offlineQueue.add({
        endpoint: '/api/test1',
        method: 'POST' as const,
        data: { test: 'data' },
        priority: 'critical' as const,
      });

      await offlineQueue.add({
        endpoint: '/api/test2',
        method: 'GET' as const,
        data: { test: 'data' },
        priority: 'low' as const,
      });

      const stats = offlineQueue.getStats();

      expect(stats.total).toBe(2);
      expect(stats.byPriority.critical).toBe(1);
      expect(stats.byPriority.low).toBe(1);
      expect(stats.oldestRequest).toBeLessThan(stats.newestRequest!);
    });

    it('should return empty stats for empty queue', () => {
      const stats = offlineQueue.getStats();

      expect(stats.total).toBe(0);
      expect(stats.oldestRequest).toBeNull();
      expect(stats.newestRequest).toBeNull();
      expect(stats.averageAge).toBe(0);
    });
  });

  describe('Persistence', () => {
    it('should persist queue to storage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await offlineQueue.initialize();

      await offlineQueue.add({
        endpoint: '/api/test',
        method: 'POST' as const,
        priority: 'medium' as const,
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@offline_queue',
        expect.stringContaining('/api/test')
      );
    });

    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      // Should not throw
      await expect(offlineQueue.add({
        endpoint: '/api/test',
        method: 'POST' as const,
        priority: 'medium' as const,
      })).resolves.toBeDefined();
    });
  });

  describe('Queue Processing', () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await offlineQueue.initialize();
    });

    it('should not process when no connectivity', async () => {
      const mockConnectivity = require('@/lib/connectivity').connectivityManager;
      mockConnectivity.shouldAttemptNetworkOperation.mockReturnValue(false);

      await offlineQueue.add({
        endpoint: '/api/test',
        method: 'POST' as const,
        priority: 'high' as const,
      });

      // Mock successful processing
      const mockFetchAPI = require('@/lib/fetch').fetchAPI;
      mockFetchAPI.mockResolvedValue({ success: true });

      await offlineQueue.processQueue();

      // Should not have called fetchAPI due to no connectivity
      expect(mockFetchAPI).not.toHaveBeenCalled();
    });

    it('should process requests in priority order', async () => {
      const mockFetchAPI = require('@/lib/fetch').fetchAPI;
      mockFetchAPI.mockResolvedValue({ success: true });

      // Add requests in reverse priority order
      await offlineQueue.add({
        endpoint: '/api/low',
        method: 'GET' as const,
        priority: 'low' as const,
      });

      await offlineQueue.add({
        endpoint: '/api/critical',
        method: 'POST' as const,
        priority: 'critical' as const,
      });

      await offlineQueue.processQueue();

      // Critical request should be processed first
      expect(mockFetchAPI).toHaveBeenCalledWith('/api/critical', expect.any(Object));
    });

    it('should handle processing errors and retry', async () => {
      const mockFetchAPI = require('@/lib/fetch').fetchAPI;
      mockFetchAPI.mockRejectedValue(new Error('Network error'));

      await offlineQueue.add({
        endpoint: '/api/test',
        method: 'POST' as const,
        priority: 'high' as const,
      });

      await offlineQueue.processQueue();

      // Request should still be in queue for retry
      expect(offlineQueue.getQueueSize()).toBe(1);
      expect(offlineQueue.getQueue()[0].retryCount).toBe(1);
    });

    it('should remove requests after max retries', async () => {
      const mockFetchAPI = require('@/lib/fetch').fetchAPI;
      mockFetchAPI.mockRejectedValue(new Error('Network error'));

      await offlineQueue.add({
        endpoint: '/api/test',
        method: 'POST' as const,
        priority: 'medium' as const,
      });

      // Process multiple times to exceed retry limit
      for (let i = 0; i < 4; i++) {
        await offlineQueue.processQueue();
      }

      // Request should be removed after max retries
      expect(offlineQueue.getQueueSize()).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await offlineQueue.initialize();
    });

    it('should get oldest and newest requests', async () => {
      const now = Date.now();

      await offlineQueue.add({
        endpoint: '/api/old',
        method: 'GET' as const,
        data: { test: 'data' },
        priority: 'low' as const,
      });

      await offlineQueue.add({
        endpoint: '/api/new',
        method: 'POST' as const,
        data: { test: 'data' },
        priority: 'high' as const,
      });

      const oldest = offlineQueue.getOldestRequest();
      const newest = offlineQueue.getNewestRequest();

      expect(oldest?.endpoint).toBe('/api/old');
      expect(newest?.endpoint).toBe('/api/new');
    });

    it('should return null for empty queue', () => {
      expect(offlineQueue.getOldestRequest()).toBeNull();
      expect(offlineQueue.getNewestRequest()).toBeNull();
    });

    it('should cleanup old requests', async () => {
      const now = Date.now();
      const oldTime = now - (25 * 60 * 60 * 1000); // 25 hours ago

      await offlineQueue.add({
        endpoint: '/api/old',
        method: 'GET' as const,
        data: { test: 'data' },
        priority: 'low' as const,
      });

      await offlineQueue.add({
        endpoint: '/api/new',
        method: 'POST' as const,
        data: { test: 'data' },
        priority: 'high' as const,
      });

      const removedCount = await offlineQueue.cleanupOldRequests(24 * 60 * 60 * 1000); // 24 hours

      expect(removedCount).toBe(1);
      expect(offlineQueue.getQueueSize()).toBe(1);
      expect(offlineQueue.getQueue()[0].endpoint).toBe('/api/new');
    });
  });
});
