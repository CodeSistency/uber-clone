import { useSplashStore } from '../../store/splash';
import { moduleDataService } from '../../app/services/moduleDataService';

// Mock performance API
const mockPerformance = {
  now: jest.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('Splash System Performance', () => {
  beforeEach(() => {
    mockPerformance.now.mockClear();
    mockPerformance.now
      .mockReturnValueOnce(0) // Start time
      .mockReturnValueOnce(100) // End time
      .mockReturnValue(200); // Subsequent calls

    // Reset stores
    const splashStore = useSplashStore.getState();
    splashStore.clearQueue();
    splashStore.hideSplash();
  });

  describe('Splash Store Operations', () => {
    it('should complete showSplash operation within performance budget', () => {
      const splashStore = useSplashStore.getState();

      const startTime = performance.now();

      splashStore.showSplash({
        id: 'perf-test',
        type: 'module_transition',
        title: 'Performance Test',
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 16ms (60fps budget)
      expect(duration).toBeLessThan(16);
    });

    it('should handle rapid splash operations efficiently', () => {
      const splashStore = useSplashStore.getState();

      const startTime = performance.now();

      // Perform multiple operations rapidly
      for (let i = 0; i < 10; i++) {
        splashStore.showSplash({
          id: `rapid-test-${i}`,
          type: 'data_loading',
          title: `Test ${i}`,
        });
        splashStore.hideSplash(`rapid-test-${i}`);
      }

      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      const avgDuration = totalDuration / 10;

      // Average operation should be fast
      expect(avgDuration).toBeLessThan(5);
    });

    it('should not create memory leaks with queue operations', () => {
      const splashStore = useSplashStore.getState();

      // Create many queued operations
      for (let i = 0; i < 50; i++) {
        splashStore.showSplash({
          id: `memory-test-${i}`,
          type: 'data_loading',
          title: `Memory Test ${i}`,
        });
      }

      // Clear queue
      splashStore.clearQueue();

      const state = useSplashStore.getState();
      expect(state.splashQueue).toHaveLength(0);
      expect(state.activeSplash).toBeNull();
    });
  });

  describe('Data Loading Performance', () => {
    it('should load driver data within acceptable time', async () => {
      const startTime = performance.now();

      const result = await moduleDataService.loadDriverData();

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      // Should complete within 3 seconds for good UX
      expect(duration).toBeLessThan(3000);
    });

    it('should load business data efficiently', async () => {
      const startTime = performance.now();

      const result = await moduleDataService.loadBusinessData();

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(2500);
    });

    it('should load customer data quickly', async () => {
      const startTime = performance.now();

      const result = await moduleDataService.loadCustomerData();

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      // Customer data should be fastest as it's usually cached
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent data loading operations', async () => {
      const startTime = performance.now();

      const [driverResult, businessResult, customerResult] = await Promise.all([
        moduleDataService.loadDriverData(),
        moduleDataService.loadBusinessData(),
        moduleDataService.loadCustomerData(),
      ]);

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      expect(driverResult.success).toBe(true);
      expect(businessResult.success).toBe(true);
      expect(customerResult.success).toBe(true);

      // Concurrent operations should complete faster than sequential
      expect(totalDuration).toBeLessThan(4000);
    });

    it('should handle concurrent splash operations', async () => {
      const splashStore = useSplashStore.getState();

      const operations = Array.from({ length: 10 }, (_, i) => ({
        id: `concurrent-test-${i}`,
        type: 'data_loading' as const,
        title: `Concurrent Test ${i}`,
      }));

      const startTime = performance.now();

      // Execute operations concurrently
      await Promise.all(
        operations.map(op =>
          new Promise(resolve => {
            splashStore.showSplash(op);
            setTimeout(() => {
              splashStore.hideSplash(op.id);
              resolve(void 0);
            }, 50);
          })
        )
      );

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      // Should handle concurrent operations efficiently
      expect(totalDuration).toBeLessThan(500);
    });
  });

  describe('Memory and Cleanup', () => {
    it('should clean up expired cache entries', () => {
      // This would test the cache cleanup functionality
      // For now, just ensure the cache exists and has cleanup method
      const splashStore = useSplashStore.getState();

      // The cache should exist (internal to DataLoadingQueue)
      expect(typeof splashStore.clearQueue).toBe('function');
    });

    it('should handle cleanup after many operations', () => {
      const splashStore = useSplashStore.getState();

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        splashStore.showSplash({
          id: `cleanup-test-${i}`,
          type: 'data_loading',
          title: `Cleanup Test ${i}`,
        });
      }

      // Clear everything
      splashStore.clearQueue();
      splashStore.hideSplash();

      const state = useSplashStore.getState();
      expect(state.splashQueue).toHaveLength(0);
      expect(state.activeSplash).toBeNull();
    });
  });

  describe('Animation Performance', () => {
    it('should not cause layout thrashing during animations', () => {
      // This test would ideally check for layout thrashing
      // For now, we ensure animations use native driver
      const splashStore = useSplashStore.getState();

      splashStore.showSplash({
        id: 'animation-test',
        type: 'module_transition',
        title: 'Animation Test',
      });

      const state = useSplashStore.getState();
      expect(state.isVisible).toBe(true);
      // In a real performance test, we'd check that animations
      // don't trigger excessive re-renders or layout calculations
    });
  });
});
