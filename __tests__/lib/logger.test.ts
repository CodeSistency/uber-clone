/**
 * Tests para el sistema de logging condicional
 */

import { log } from '@/lib/logger';

// Usar (global as any) para evitar errores de tipo

// Mock de console methods
const mockConsoleDebug = jest.spyOn(console, 'debug').mockImplementation(() => {});
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
      log.unifiedFlow.debug('Debug message', { data: 'test' });
      expect(mockConsoleDebug).toHaveBeenCalledWith(
        '[UNIFIEDFLOW] [DEBUG]',
        'Debug message',
        { data: 'test' }
      );
    });

    it('should log info messages', () => {
      log.registry.info('Info message', { data: 'test' });
      expect(mockConsoleInfo).toHaveBeenCalledWith(
        '[REGISTRY] [INFO]',
        'Info message',
        { data: 'test' }
      );
    });

    it('should log warn messages', () => {
      log.bottomSheet.warn('Warning message', { data: 'test' });
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[BOTTOMSHEET] [WARN]',
        'Warning message',
        { data: 'test' }
      );
    });

    it('should log error messages', () => {
      log.pagerView.error('Error message', { data: 'test' });
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[PAGERVIEW] [ERROR]',
        'Error message',
        { data: 'test' }
      );
    });

    it('should handle multiple arguments', () => {
      log.stepChange.debug('Multiple args', { data: 'test' });
      expect(mockConsoleDebug).toHaveBeenCalledWith(
        '[STEPCHANGE] [DEBUG]',
        'Multiple args',
        { data: 'test' }
      );
    });

    it('should handle no arguments', () => {
      log.pageChange.info('No args');
      expect(mockConsoleInfo).toHaveBeenCalledWith(
        '[PAGECHANGE] [INFO]',
        'No args'
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

      expect(mockConsoleDebug).toHaveBeenCalledTimes(3); // debug calls
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
      log.unifiedFlow.debug('Debug message', { data: 'test' });
      log.registry.info('Info message', { data: 'test' });
      log.bottomSheet.warn('Warning message', { data: 'test' });
      log.pagerView.error('Error message', { data: 'test' });

      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleInfo).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should not log even with multiple arguments', () => {
      log.stepChange.debug('Multiple args', { data: 'test' });
      expect(mockConsoleDebug).not.toHaveBeenCalled();
    });
  });

  describe('Logger Categories', () => {
    beforeEach(() => {
      (global as any).__DEV__ = true;
    });

    it('should have correct prefixes for each category', () => {
      log.unifiedFlow.debug('test');
      expect(mockConsoleDebug).toHaveBeenCalledWith('[UNIFIEDFLOW] [DEBUG]', 'test');

      log.registry.info('test');
      expect(mockConsoleInfo).toHaveBeenCalledWith('[REGISTRY] [INFO]', 'test');

      log.bottomSheet.warn('test');
      expect(mockConsoleWarn).toHaveBeenCalledWith('[BOTTOMSHEET] [WARN]', 'test');

      log.bottomSheetClose.error('test');
      expect(mockConsoleError).toHaveBeenCalledWith('[BOTTOMSHEETCLOSE] [ERROR]', 'test');

      log.bottomSheetReopen.debug('test');
      expect(mockConsoleDebug).toHaveBeenCalledWith('[BOTTOMSHEETREOPEN] [DEBUG]', 'test');

      log.pagerView.info('test');
      expect(mockConsoleInfo).toHaveBeenCalledWith('[PAGERVIEW] [INFO]', 'test');

      log.stepChange.warn('test');
      expect(mockConsoleWarn).toHaveBeenCalledWith('[STEPCHANGE] [WARN]', 'test');

      log.pageChange.error('test');
      expect(mockConsoleError).toHaveBeenCalledWith('[PAGECHANGE] [ERROR]', 'test');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      (global as any).__DEV__ = true;
    });

    it('should handle undefined arguments', () => {
      log.unifiedFlow.debug('test', { data: null });
      expect(mockConsoleDebug).toHaveBeenCalledWith(
        '[UNIFIEDFLOW] [DEBUG]',
        'test',
        { data: null }
      );
    });

    it('should handle empty string messages', () => {
      log.registry.info('');
      expect(mockConsoleInfo).toHaveBeenCalledWith('[REGISTRY] [INFO]', '');
    });

    it('should handle complex objects', () => {
      const complexObject = {
        nested: {
          array: [1, 2, 3],
          function: () => {},
          date: new Date(),
        },
      };

      log.bottomSheet.debug('Complex object', complexObject);
      expect(mockConsoleDebug).toHaveBeenCalledWith(
        '[BOTTOMSHEET] [DEBUG]',
        'Complex object',
        complexObject
      );
    });

    it('should handle circular references gracefully', () => {
      const circularObject: any = { name: 'test' };
      circularObject.self = circularObject;

      // This should not throw an error
      expect(() => {
        log.pagerView.debug('Circular object', circularObject);
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
        log.unifiedFlow.debug(`Message ${i}`, { data: i });
        log.registry.info(`Info ${i}`, { data: i });
        log.bottomSheet.warn(`Warning ${i}`, { data: i });
        log.pagerView.error(`Error ${i}`, { data: i });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should be very fast since no actual logging occurs
      expect(duration).toBeLessThan(100); // Less than 100ms for 4000 calls
    });
  });
});
