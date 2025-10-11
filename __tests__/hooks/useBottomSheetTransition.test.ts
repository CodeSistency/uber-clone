/**
 * Tests para useBottomSheetTransition hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { useBottomSheetTransition } from '@/hooks/useBottomSheetTransition';

// Mock de react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Mock de useSharedValue
  Reanimated.useSharedValue = jest.fn((initialValue) => ({
    value: initialValue,
  }));
  
  // Mock de useAnimatedStyle
  Reanimated.useAnimatedStyle = jest.fn((fn) => {
    const result = fn();
    return result;
  });
  
  // Mock de withTiming
  Reanimated.withTiming = jest.fn((value, config) => {
    return value;
  });
  
  // Mock de Easing
  Reanimated.Easing = {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    inOut: (easing: any) => `in-out-${easing}`,
  };
  
  return Reanimated;
});

describe('useBottomSheetTransition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBottomSheetTransition());

    expect(result.current.showBottomSheet).toBeDefined();
    expect(result.current.hideBottomSheet).toBeDefined();
    expect(result.current.animatedContainerStyle).toBeDefined();
  });

  it('should initialize with custom config', () => {
    const config = {
      duration: 500,
      easing: 'ease-in' as const,
      springConfig: { damping: 20, stiffness: 200, mass: 1.5 },
    };

    const { result } = renderHook(() => useBottomSheetTransition(config));

    expect(result.current.showBottomSheet).toBeDefined();
    expect(result.current.hideBottomSheet).toBeDefined();
    expect(result.current.animatedContainerStyle).toBeDefined();
  });

  it('should handle showBottomSheet with initial height', () => {
    const { result } = renderHook(() => useBottomSheetTransition());

    act(() => {
      result.current.showBottomSheet(300);
    });

    // El hook debería manejar la animación de mostrar
    expect(result.current.showBottomSheet).toBeDefined();
  });

  it('should handle hideBottomSheet', () => {
    const { result } = renderHook(() => useBottomSheetTransition());

    act(() => {
      result.current.hideBottomSheet();
    });

    // El hook debería manejar la animación de ocultar
    expect(result.current.hideBottomSheet).toBeDefined();
  });

  it('should provide animated container style', () => {
    const { result } = renderHook(() => useBottomSheetTransition());

    const style = result.current.animatedContainerStyle;
    expect(style).toBeDefined();
    expect(typeof style).toBe('object');
  });

  it('should handle different easing types', () => {
    const easingTypes = ['linear', 'ease-in', 'ease-out', 'ease-in-out'] as const;

    easingTypes.forEach(easing => {
      const { result } = renderHook(() => 
        useBottomSheetTransition({ easing })
      );

      expect(result.current.showBottomSheet).toBeDefined();
      expect(result.current.hideBottomSheet).toBeDefined();
    });
  });

  it('should handle different durations', () => {
    const durations = [100, 300, 500, 1000];

    durations.forEach(duration => {
      const { result } = renderHook(() => 
        useBottomSheetTransition({ duration })
      );

      expect(result.current.showBottomSheet).toBeDefined();
      expect(result.current.hideBottomSheet).toBeDefined();
    });
  });

  it('should handle spring config', () => {
    const springConfig = {
      damping: 15,
      stiffness: 150,
      mass: 1,
    };

    const { result } = renderHook(() => 
      useBottomSheetTransition({ springConfig })
    );

    expect(result.current.showBottomSheet).toBeDefined();
    expect(result.current.hideBottomSheet).toBeDefined();
  });

  it('should handle multiple show/hide cycles', () => {
    const { result } = renderHook(() => useBottomSheetTransition());

    // Multiple show/hide cycles
    act(() => {
      result.current.showBottomSheet(200);
    });

    act(() => {
      result.current.hideBottomSheet();
    });

    act(() => {
      result.current.showBottomSheet(400);
    });

    act(() => {
      result.current.hideBottomSheet();
    });

    expect(result.current.showBottomSheet).toBeDefined();
    expect(result.current.hideBottomSheet).toBeDefined();
  });

  it('should handle rapid successive calls', () => {
    const { result } = renderHook(() => useBottomSheetTransition());

    // Rapid successive calls
    act(() => {
      result.current.showBottomSheet(200);
      result.current.hideBottomSheet();
      result.current.showBottomSheet(300);
      result.current.hideBottomSheet();
    });

    expect(result.current.showBottomSheet).toBeDefined();
    expect(result.current.hideBottomSheet).toBeDefined();
  });

  it('should handle undefined config', () => {
    const { result } = renderHook(() => useBottomSheetTransition(undefined));

    expect(result.current.showBottomSheet).toBeDefined();
    expect(result.current.hideBottomSheet).toBeDefined();
    expect(result.current.animatedContainerStyle).toBeDefined();
  });

  it('should handle partial config', () => {
    const { result } = renderHook(() => 
      useBottomSheetTransition({ duration: 400 })
    );

    expect(result.current.showBottomSheet).toBeDefined();
    expect(result.current.hideBottomSheet).toBeDefined();
  });

  it('should handle extreme values', () => {
    const extremeConfig = {
      duration: 0,
      easing: 'linear' as const,
      springConfig: { damping: 0, stiffness: 0, mass: 0 },
    };

    const { result } = renderHook(() => 
      useBottomSheetTransition(extremeConfig)
    );

    expect(result.current.showBottomSheet).toBeDefined();
    expect(result.current.hideBottomSheet).toBeDefined();
  });

  it('should maintain function references across renders', () => {
    const { result, rerender } = renderHook(() => useBottomSheetTransition());

    const initialShowBottomSheet = result.current.showBottomSheet;
    const initialHideBottomSheet = result.current.hideBottomSheet;

    rerender({});

    expect(result.current.showBottomSheet).toBe(initialShowBottomSheet);
    expect(result.current.hideBottomSheet).toBe(initialHideBottomSheet);
  });

  it('should handle different initial heights', () => {
    const { result } = renderHook(() => useBottomSheetTransition());

    const heights = [100, 200, 300, 400, 500];

    heights.forEach(height => {
      act(() => {
        result.current.showBottomSheet(height);
      });

      expect(result.current.showBottomSheet).toBeDefined();
    });
  });

  it('should work with different component lifecycles', () => {
    const { result, unmount } = renderHook(() => useBottomSheetTransition());

    act(() => {
      result.current.showBottomSheet(250);
    });

    // Unmount and remount
    unmount();

    const { result: newResult } = renderHook(() => useBottomSheetTransition());

    act(() => {
      newResult.current.showBottomSheet(350);
    });

    expect(newResult.current.showBottomSheet).toBeDefined();
    expect(newResult.current.hideBottomSheet).toBeDefined();
  });
});
