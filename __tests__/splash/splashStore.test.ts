import { useSplashStore } from '../../store/splash';

// Mock jest timers for testing timeouts
jest.useFakeTimers();

describe('SplashStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useSplashStore.getState();
    store.clearQueue();
    store.hideSplash();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useSplashStore.getState();

      expect(state.activeSplash).toBeNull();
      expect(state.splashQueue).toEqual([]);
      expect(state.isVisible).toBe(false);
      expect(state.globalProgress).toBe(0);
    });
  });

  describe('showSplash', () => {
    it('should show splash and set active splash', () => {
      const store = useSplashStore.getState();
      const testConfig = {
        id: 'test-splash',
        type: 'module_transition' as const,
        title: 'Test Splash',
        progress: 50,
      };

      store.showSplash(testConfig);

      const state = useSplashStore.getState();
      expect(state.activeSplash).toEqual(testConfig);
      expect(state.isVisible).toBe(true);
      expect(state.globalProgress).toBe(50);
    });

    it('should queue splash if another is active', () => {
      const store = useSplashStore.getState();

      // Show first splash
      store.showSplash({
        id: 'first-splash',
        type: 'module_transition' as const,
        title: 'First Splash',
      });

      // Show second splash (should be queued)
      store.showSplash({
        id: 'second-splash',
        type: 'data_loading' as const,
        title: 'Second Splash',
      });

      const state = useSplashStore.getState();
      expect(state.activeSplash?.id).toBe('first-splash');
      expect(state.splashQueue).toHaveLength(1);
      expect(state.splashQueue[0].id).toBe('second-splash');
    });

    it('should auto-hide splash after duration', () => {
      const store = useSplashStore.getState();

      store.showSplash({
        id: 'auto-hide-splash',
        type: 'module_transition' as const,
        title: 'Auto Hide',
        duration: 1000,
      });

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      const state = useSplashStore.getState();
      expect(state.activeSplash).toBeNull();
      expect(state.isVisible).toBe(false);
    });
  });

  describe('hideSplash', () => {
    it('should hide active splash', () => {
      const store = useSplashStore.getState();

      store.showSplash({
        id: 'test-splash',
        type: 'module_transition' as const,
        title: 'Test',
      });

      store.hideSplash('test-splash');

      const state = useSplashStore.getState();
      expect(state.activeSplash).toBeNull();
      expect(state.isVisible).toBe(false);
    });

    it('should show next splash from queue when hiding active one', () => {
      const store = useSplashStore.getState();

      // Show first splash
      store.showSplash({
        id: 'first',
        type: 'module_transition' as const,
        title: 'First',
      });

      // Queue second splash
      store.showSplash({
        id: 'second',
        type: 'data_loading' as const,
        title: 'Second',
      });

      // Hide first splash
      store.hideSplash('first');

      const state = useSplashStore.getState();
      expect(state.activeSplash?.id).toBe('second');
      expect(state.splashQueue).toHaveLength(0);
    });
  });

  describe('updateProgress', () => {
    it('should update progress of active splash', () => {
      const store = useSplashStore.getState();

      store.showSplash({
        id: 'progress-test',
        type: 'module_transition' as const,
        title: 'Progress Test',
        progress: 0,
      });

      store.updateProgress(75, 'progress-test');

      const state = useSplashStore.getState();
      expect(state.activeSplash?.progress).toBe(75);
      expect(state.globalProgress).toBe(75);
    });
  });

  describe('clearQueue', () => {
    it('should clear all queued splashes', () => {
      const store = useSplashStore.getState();

      store.showSplash({
        id: 'first',
        type: 'module_transition' as const,
        title: 'First',
      });

      store.showSplash({
        id: 'second',
        type: 'data_loading' as const,
        title: 'Second',
      });

      store.clearQueue();

      const state = useSplashStore.getState();
      expect(state.splashQueue).toHaveLength(0);
    });
  });

  describe('splashConfigs helper', () => {
    it('should create module transition config', () => {
      // Import the helper functions directly
      const { splashConfigs } = require('../../store/splash');
      const config = splashConfigs.moduleTransition('customer', 'driver');

      expect(config).toEqual({
        type: 'module_transition',
        title: 'Cambiando a driver',
        subtitle: 'Cargando configuración...',
        backgroundColor: '#0286FF',
        showProgress: true,
        moduleSpecific: {
          fromModule: 'customer',
          toModule: 'driver',
        },
      });
    });

    it('should create data loading config', () => {
      // Import the helper functions directly
      const { splashConfigs } = require('../../store/splash');
      const config = splashConfigs.dataLoading(
        'Cargando datos',
        ['perfil', 'configuración']
      );

      expect(config).toEqual({
        type: 'data_loading',
        title: 'Cargando datos',
        subtitle: 'Cargando información...',
        backgroundColor: '#10B981',
        showProgress: true,
        moduleSpecific: {
          dataQueries: ['perfil', 'configuración'],
        },
      });
    });
  });
});
