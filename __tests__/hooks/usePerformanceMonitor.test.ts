/**
 * Tests para usePerformanceMonitor hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePerformanceMonitor, useErrorMonitor } from '@/hooks/usePerformanceMonitor';

// Mock de performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Mock de console methods
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock de performance global
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    expect(result.current.startRender).toBeDefined();
    expect(result.current.endRender).toBeDefined();
    expect(typeof result.current.startRender).toBe('function');
    expect(typeof result.current.endRender).toBe('function');
  });

  it('should handle startRender and endRender', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    act(() => {
      result.current.startRender();
    });

    expect(mockPerformance.mark).toHaveBeenCalledWith('test-component-start');

    act(() => {
      result.current.endRender();
    });

    expect(mockPerformance.mark).toHaveBeenCalledWith('test-component-end');
    expect(mockPerformance.measure).toHaveBeenCalledWith(
      'test-component-render',
      'test-component-start',
      'test-component-end'
    );
  });

  it('should handle multiple startRender calls', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    act(() => {
      result.current.startRender();
      result.current.startRender();
      result.current.startRender();
    });

    expect(mockPerformance.mark).toHaveBeenCalledTimes(3);
    expect(mockPerformance.mark).toHaveBeenCalledWith('component1-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('component2-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('component3-start');
  });

  it('should handle multiple endRender calls', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    act(() => {
      result.current.endRender();
      result.current.endRender();
      result.current.endRender();
    });

    expect(mockPerformance.mark).toHaveBeenCalledTimes(3);
    expect(mockPerformance.measure).toHaveBeenCalledTimes(3);
  });

  it('should handle rapid startRender and endRender calls', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    // Rapid calls
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.startRender();
        result.current.endRender();
      });
    }

    expect(mockPerformance.mark).toHaveBeenCalledTimes(20);
    expect(mockPerformance.measure).toHaveBeenCalledTimes(10);
  });

  it('should handle undefined component name', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    act(() => {
      result.current.startRender();
      result.current.endRender();
    });

    expect(mockPerformance.mark).toHaveBeenCalledWith('undefined-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('undefined-end');
  });

  it('should handle null component name', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    act(() => {
      result.current.startRender();
      result.current.endRender();
    });

    expect(mockPerformance.mark).toHaveBeenCalledWith('null-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('null-end');
  });

  it('should handle empty string component name', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    act(() => {
      result.current.startRender();
      result.current.endRender();
    });

    expect(mockPerformance.mark).toHaveBeenCalledWith('-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('-end');
  });

  it('should handle special characters in component name', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    const specialNames = [
      'component-with-dashes',
      'component_with_underscores',
      'component.with.dots',
      'component with spaces',
      'component@with#special$chars',
    ];

    specialNames.forEach(name => {
      act(() => {
        result.current.startRender();
        result.current.endRender();
      });
    });

    expect(mockPerformance.mark).toHaveBeenCalledTimes(specialNames.length * 2);
  });

  it('should handle very long component names', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    const longName = 'a'.repeat(1000);

    act(() => {
      result.current.startRender();
      result.current.endRender();
    });

    expect(mockPerformance.mark).toHaveBeenCalledWith(`${longName}-start`);
    expect(mockPerformance.mark).toHaveBeenCalledWith(`${longName}-end`);
  });

  it('should handle hook unmounting', () => {
    const { result, unmount } = renderHook(() => usePerformanceMonitor('TestComponent'));

    act(() => {
      result.current.startRender();
    });

    unmount();

    // Should not throw any errors
    expect(() => unmount()).not.toThrow();
  });

  it('should handle multiple hook instances', () => {
    const { result: result1 } = renderHook(() => usePerformanceMonitor('Component1'));
    const { result: result2 } = renderHook(() => usePerformanceMonitor('Component2'));

    act(() => {
      result1.current.startRender();
      result2.current.startRender();
    });

    expect(mockPerformance.mark).toHaveBeenCalledWith('component1-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('component2-start');
  });

  it('should handle rapid hook re-renders', () => {
    const { result, rerender } = renderHook(() => usePerformanceMonitor('TestComponent'));

    // Rapid re-renders
    for (let i = 0; i < 10; i++) {
      rerender({});
    }

    expect(result.current.startRender).toBeDefined();
    expect(result.current.endRender).toBeDefined();
  });
});

describe('useErrorMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useErrorMonitor('TestComponent'));

    expect(result.current.reportError).toBeDefined();
    expect(result.current.reportWarning).toBeDefined();
  });

  it('should handle error state', () => {
    const { result } = renderHook(() => useErrorMonitor('TestComponent'));

    expect(result.current.reportError).toBeDefined();
    expect(result.current.reportWarning).toBeDefined();
  });

  it('should handle hook unmounting', () => {
    const { result, unmount } = renderHook(() => useErrorMonitor('TestComponent'));

    expect(result.current.reportError).toBeDefined();

    unmount();

    // Should not throw any errors
    expect(() => unmount()).not.toThrow();
  });

  it('should handle multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useErrorMonitor('Component1'));
    const { result: result2 } = renderHook(() => useErrorMonitor('Component2'));

    expect(result1.current.reportError).toBeDefined();
    expect(result2.current.reportWarning).toBeDefined();
  });

  it('should handle rapid hook re-renders', () => {
    const { result, rerender } = renderHook(() => useErrorMonitor('TestComponent'));

    // Rapid re-renders
    for (let i = 0; i < 10; i++) {
      rerender({});
    }

    expect(result.current.reportError).toBeDefined();
    expect(result.current.reportWarning).toBeDefined();
  });
});

describe('Performance Monitor Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle missing performance API', () => {
    // Mock missing performance API
    Object.defineProperty(global, 'performance', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    act(() => {
      result.current.startRender();
      result.current.endRender();
    });

    // Should not throw any errors
    expect(result.current.startRender).toBeDefined();
    expect(result.current.endRender).toBeDefined();
  });

  it('should handle performance API with missing methods', () => {
    // Mock performance API with missing methods
    const incompletePerformance = {
      now: jest.fn(() => Date.now()),
      // Missing mark, measure, etc.
    };

    Object.defineProperty(global, 'performance', {
      value: incompletePerformance,
      writable: true,
    });

    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    act(() => {
      result.current.startRender();
      result.current.endRender();
    });

    // Should not throw any errors
    expect(result.current.startRender).toBeDefined();
    expect(result.current.endRender).toBeDefined();
  });

  it('should handle performance API throwing errors', () => {
    // Mock performance API that throws errors
    const errorPerformance = {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(() => {
        throw new Error('Performance mark failed');
      }),
      measure: jest.fn(() => {
        throw new Error('Performance measure failed');
      }),
    };

    Object.defineProperty(global, 'performance', {
      value: errorPerformance,
      writable: true,
    });

    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    act(() => {
      result.current.startRender();
      result.current.endRender();
    });

    // Should not throw any errors
    expect(result.current.startRender).toBeDefined();
    expect(result.current.endRender).toBeDefined();
  });

  it('should handle performance API returning invalid values', () => {
    // Mock performance API with invalid return values
    const invalidPerformance = {
      now: jest.fn(() => 'invalid'),
      mark: jest.fn(() => 'invalid'),
      measure: jest.fn(() => 'invalid'),
    };

    Object.defineProperty(global, 'performance', {
      value: invalidPerformance,
      writable: true,
    });

    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

    act(() => {
      result.current.startRender();
      result.current.endRender();
    });

    // Should not throw any errors
    expect(result.current.startRender).toBeDefined();
    expect(result.current.endRender).toBeDefined();
  });
});
