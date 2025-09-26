import { useSplashStore } from '../../store';
import { useModuleTransition } from '../../store/module/module';

// Mock the module data service
jest.mock('../../app/services/moduleDataService', () => ({
  loadDriverData: jest.fn().mockResolvedValue({
    success: true,
    data: { profile: 'driver', vehicle: 'ready' },
    errors: [],
    loadedItems: ['driver_profile', 'vehicle_status'],
  }),
  loadBusinessData: jest.fn().mockResolvedValue({
    success: true,
    data: { business: 'ready', products: 'loaded' },
    errors: [],
    loadedItems: ['business_profile', 'active_products'],
  }),
  loadCustomerData: jest.fn().mockResolvedValue({
    success: true,
    data: { customer: 'ready', history: 'loaded' },
    errors: [],
    loadedItems: ['customer_profile', 'ride_history'],
  }),
}));

describe('Module Transition Integration', () => {
  let moduleTransition: ReturnType<typeof useModuleTransition>;
  let splashStore: ReturnType<typeof useSplashStore>;

  beforeEach(() => {
    // Reset stores
    splashStore = useSplashStore.getState() as any;
    moduleTransition = useModuleTransition();

    // Reset splash store
    (splashStore as any).clearQueue();
    (splashStore as any).hideSplash();
  });

  describe('Customer to Driver Transition', () => {
    it('should complete full transition with splash', async () => {
      // Start transition
      await moduleTransition.switchToDriver();

      // Check final state
      const finalSplashState = useSplashStore.getState();

      expect(moduleTransition.currentModule).toBe('driver');
      expect(moduleTransition.isTransitioning).toBe(false);
      expect(moduleTransition.isSplashActive).toBe(false);
      expect(finalSplashState.activeSplash).toBeNull();
      expect(finalSplashState.isVisible).toBe(false);
    });

    it('should show splash during transition', async () => {
      // Start transition (don't await yet)
      const transitionPromise = moduleTransition.switchToDriver();

      // Check that splash is shown
      const splashState = useSplashStore.getState();
      expect(splashState.isVisible).toBe(true);
      expect(splashState.activeSplash?.type).toBe('module_transition');
      expect(splashState.activeSplash?.moduleSpecific?.toModule).toBe('driver');

      // Wait for completion
      await transitionPromise;

      // Check that splash is hidden
      const finalSplashState = useSplashStore.getState();
      expect(finalSplashState.isVisible).toBe(false);
      expect(finalSplashState.activeSplash).toBeNull();
    });

    it('should update progress during data loading', async () => {
      // Mock the data service to call progress callback
      const mockLoadDriverData = require('../../app/services/moduleDataService').loadDriverData;
      mockLoadDriverData.mockImplementation(async (onProgress: (completed: number, total: number, currentTask: string) => void) => {
        // Simulate progress updates
        onProgress(25, 100, 'Verificación de autenticación');
        onProgress(50, 100, 'Cargando perfil');
        onProgress(75, 100, 'Estado del vehículo');
        onProgress(100, 100, 'Completado');

        return {
          success: true,
          data: { profile: 'loaded', vehicle: 'ready' },
          errors: [],
          loadedItems: ['driver_profile', 'vehicle_status'],
        };
      });

      const moduleTransition = useModuleTransition();

      await moduleTransition.switchToDriver();

      // Verify the mock was called
      expect(mockLoadDriverData).toHaveBeenCalled();
    });
  });

  describe('Customer to Business Transition', () => {
    it('should complete business transition', async () => {
      const moduleTransition = useModuleTransition();

      await moduleTransition.switchToBusiness();

      expect(moduleTransition.currentModule).toBe('business');
      expect(moduleTransition.isTransitioning).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle data loading failures gracefully', async () => {
      // Mock failure in data loading
      const mockLoadDriverData = require('../../app/services/moduleDataService').loadDriverData;
      mockLoadDriverData.mockResolvedValue({
        success: false,
        data: {},
        errors: ['Failed to load profile'],
        loadedItems: [],
      });

      const moduleTransition = useModuleTransition();

      // This should still complete but with errors
      await expect(moduleTransition.switchToDriver()).resolves.not.toThrow();

      expect(moduleTransition.currentModule).toBe('driver'); // Should still switch
      expect(moduleTransition.isTransitioning).toBe(false);
    });

    it('should revert on critical failures', async () => {
      // Mock critical failure that should block transition
      const mockLoadDriverData = require('../../app/services/moduleDataService').loadDriverData;
      mockLoadDriverData.mockResolvedValue({
        success: false,
        data: {},
        errors: ['Critical authentication failure'],
        loadedItems: [], // No required items loaded
      });

      await moduleTransition.switchToDriver();

      // Should have reverted to customer
      expect(moduleTransition.currentModule).toBe('customer');
      expect(moduleTransition.isTransitioning).toBe(false);
    });
  });

  describe('Multiple Transitions', () => {
    it('should handle rapid successive transitions', async () => {
      const moduleTransition = useModuleTransition();

      // Start multiple transitions rapidly
      const promises = [
        moduleTransition.switchToDriver(),
        moduleTransition.switchToBusiness(),
        moduleTransition.switchToCustomer(),
      ];

      await Promise.allSettled(promises);

      // Final state should be the last requested transition
      expect(moduleTransition.currentModule).toBe('customer');
      expect(moduleTransition.isTransitioning).toBe(false);
    });
  });

  describe('Splash Queue Management', () => {
    it('should queue multiple splash requests', async () => {
      const splashStore = useSplashStore.getState();

      // Show first splash
      splashStore.showSplash({
        id: 'first',
        type: 'module_transition',
        title: 'First',
      });

      // Queue second splash
      splashStore.showSplash({
        id: 'second',
        type: 'data_loading',
        title: 'Second',
      });

      // Queue third splash
      splashStore.showSplash({
        id: 'third',
        type: 'module_transition',
        title: 'Third',
      });

      let state = useSplashStore.getState();
      expect(state.activeSplash?.id).toBe('first');
      expect(state.splashQueue).toHaveLength(2);

      // Hide first splash
      splashStore.hideSplash('first');

      state = useSplashStore.getState();
      expect(state.activeSplash?.id).toBe('second');
      expect(state.splashQueue).toHaveLength(1);

      // Hide second splash
      splashStore.hideSplash('second');

      state = useSplashStore.getState();
      expect(state.activeSplash?.id).toBe('third');
      expect(state.splashQueue).toHaveLength(0);
    });
  });
});
