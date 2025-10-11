/**
 * Tests para el sistema de logging condicional
 */

import { log, logger, isDev } from '@/lib/logger';

// Mock de console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock de __DEV__
const originalDev = (global as any).__DEV__;

describe('Logger System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__DEV__ = true; // Enable logging for tests
  });

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
  });

  describe('Development Environment (__DEV__ = true)', () => {
    beforeEach(() => {
      (global as any).__DEV__ = true;
    });

    it('should log debug messages', () => {
      log.debug('Debug message', { component: 'TestComponent' });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Debug message')
      );
    });

    it('should log info messages', () => {
      log.info('Info message', { component: 'TestComponent' });
      expect(mockConsoleInfo).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.stringContaining('Info message')
      );
    });

    it('should log warn messages', () => {
      log.warn('Warning message', { component: 'TestComponent' });
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('WARN'),
        expect.stringContaining('Warning message')
      );
    });

    it('should log error messages', () => {
      log.error('Error message', { component: 'TestComponent' });
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        expect.stringContaining('Error message')
      );
    });

    it('should handle context data', () => {
      const context = {
        component: 'TestComponent',
        action: 'testAction',
        data: { key: 'value' }
      };

      log.debug('Test message', context);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '  Data:',
        { key: 'value' }
      );
    });

    it('should handle all logger categories', () => {
      // Test all categories exist and work
      log.unifiedFlow.debug('test');
      log.registry.info('test');
      log.bottomSheet.warn('test');
      log.bottomSheetClose.error('test');
      log.bottomSheetReopen.debug('test');
      log.pagerView.info('test');
      log.stepChange.warn('test');
      log.pageChange.error('test');

      expect(mockConsoleLog).toHaveBeenCalledTimes(3); // debug calls
      expect(mockConsoleInfo).toHaveBeenCalledTimes(2); // info calls
      expect(mockConsoleWarn).toHaveBeenCalledTimes(2); // warn calls
      expect(mockConsoleError).toHaveBeenCalledTimes(2); // error calls
    });
  });

  describe('Production Environment (__DEV__ = false)', () => {
    beforeEach(() => {
      (global as any).__DEV__ = false;
    });

    it('should not log any messages in production', () => {
      log.debug('Debug message', { component: 'TestComponent' });
      log.info('Info message', { component: 'TestComponent' });
      log.warn('Warning message', { component: 'TestComponent' });
      log.error('Error message', { component: 'TestComponent' });

      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleInfo).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should log when force is true', () => {
      logger.debug('Force message', { component: 'TestComponent' }, true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Force message')
      );
    });
  });

  describe('Logger Categories', () => {
    beforeEach(() => {
      (global as any).__DEV__ = true;
    });

    it('should have correct prefixes for each category', () => {
      log.unifiedFlow.debug('test');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[UnifiedFlowWrapper]'),
        expect.stringContaining('test')
      );

      log.registry.info('test');
      expect(mockConsoleInfo).toHaveBeenCalledWith(
        expect.stringContaining('[StepRegistry]'),
        expect.stringContaining('test')
      );

      log.bottomSheet.warn('test');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('[GorhomMapFlowBottomSheet]'),
        expect.stringContaining('test')
      );

      log.bottomSheetClose.error('test');
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('[bottomSheetClose]'),
        expect.stringContaining('test')
      );

      log.bottomSheetReopen.debug('test');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[bottomSheetReopen]'),
        expect.stringContaining('test')
      );

      log.pagerView.info('test');
      expect(mockConsoleInfo).toHaveBeenCalledWith(
        expect.stringContaining('[MapFlowPagerView]'),
        expect.stringContaining('test')
      );

      log.stepChange.warn('test');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('[stepChange]'),
        expect.stringContaining('test')
      );

      log.pageChange.error('test');
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('[pageChange]'),
        expect.stringContaining('test')
      );
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      (global as any).__DEV__ = true;
    });

    it('should log performance metrics', () => {
      log.performance('testOperation', 100, { component: 'TestComponent' });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Performance: testOperation took 100.00ms')
      );
    });

    it('should log state changes', () => {
      const oldState = { count: 0 };
      const newState = { count: 1 };
      
      log.state('TestComponent', 'count', oldState, newState);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('State change: count')
      );
    });

    it('should log component renders', () => {
      const props = { title: 'Test' };
      
      log.render('TestComponent', props);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Component rendered')
      );
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      (global as any).__DEV__ = true;
    });

    it('should handle undefined context', () => {
      log.debug('test');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[App]'),
        expect.stringContaining('test')
      );
    });

    it('should handle empty string messages', () => {
      log.info('');
      expect(mockConsoleInfo).toHaveBeenCalledWith(
        expect.stringContaining('[App]'),
        expect.stringContaining('')
      );
    });

    it('should handle complex objects in context data', () => {
      const complexObject = {
        nested: {
          array: [1, 2, 3],
          function: () => {},
          date: new Date(),
        },
      };

      log.debug('Complex object', { component: 'TestComponent', data: complexObject });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Complex object')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '  Data:',
        complexObject
      );
    });

    it('should handle circular references gracefully', () => {
      const circularObject: any = { name: 'test' };
      circularObject.self = circularObject;

      // This should not throw an error
      expect(() => {
        log.debug('Circular object', { component: 'TestComponent', data: circularObject });
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      (global as any).__DEV__ = true;
    });

    it('should not create unnecessary objects when logging is disabled', () => {
      (global as any).__DEV__ = false;
      
      const startTime = performance.now();
      
      // Call many log functions
      for (let i = 0; i < 1000; i++) {
        log.debug(`Message ${i}`, { component: 'TestComponent' });
        log.info(`Info ${i}`, { component: 'TestComponent' });
        log.warn(`Warning ${i}`, { component: 'TestComponent' });
        log.error(`Error ${i}`, { component: 'TestComponent' });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should be very fast since no actual logging occurs
      expect(duration).toBeLessThan(100); // Less than 100ms for 4000 calls
    });
  });

  describe('Logger Instance', () => {
    beforeEach(() => {
      (global as any).__DEV__ = true;
    });

    it('should have all required methods', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.performance).toBe('function');
      expect(typeof logger.state).toBe('function');
      expect(typeof logger.render).toBe('function');
    });

    it('should format messages correctly', () => {
      const context = { component: 'TestComponent', action: 'testAction' };
      
      log.debug('Test message', context);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{2}:\d{2}:\d{2} \[TestComponent:testAction\] Test message$/)
      );
    });

    it('should handle timestamp formatting', () => {
      const originalDate = Date;
      const mockDate = jest.fn(() => new Date('2023-01-01T12:30:45.123Z'));
      global.Date = mockDate as any;

      log.debug('Test message');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('12:30:45')
      );

      global.Date = originalDate;
    });
  });

  describe('isDev Export', () => {
    it('should export isDev correctly', () => {
      expect(typeof isDev).toBe('boolean');
    });
  });
});