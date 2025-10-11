/**
 * Tests para useMapFlowPagerWithSteps hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { useMapFlowPagerWithSteps } from '@/hooks/useMapFlowPagerWithSteps';
import { FLOW_STEPS } from '@/lib/unified-flow/constants';

// Mock del store
jest.mock('@/store', () => ({
  useMapFlowStore: jest.fn(() => ({
    step: FLOW_STEPS.SELECCION_SERVICIO,
    role: 'customer',
    service: undefined,
  })),
}));

// Mock del logger
jest.mock('@/lib/logger', () => ({
  log: {
    pagerView: {
      debug: jest.fn(),
    },
  },
}));

describe('useMapFlowPagerWithSteps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    expect(result.current.pagerSteps).toEqual([]);
    expect(result.current.shouldUsePager).toBe(false);
    expect(result.current.currentPageIndex).toBe(0);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.isTransitioning).toBe(false);
    expect(typeof result.current.goToPagerStep).toBe('function');
    expect(typeof result.current.setCurrentPageIndex).toBe('function');
  });

  it('should handle step changes', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    expect(result.current.pagerSteps).toEqual([]);

    // Simulate step change
    act(() => {
      result.current.goToPagerStep(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE);
    });

    expect(result.current.currentPageIndex).toBe(0);
  });

  it('should handle page index changes', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      result.current.setCurrentPageIndex(2);
    });

    expect(result.current.currentPageIndex).toBe(2);
  });

  it('should handle multiple step changes', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    const steps = [
      FLOW_STEPS.SELECCION_SERVICIO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
      FLOW_STEPS.CUSTOMER_TRANSPORT_SELECCION_VEHICULO,
    ];

    steps.forEach((step, index) => {
      act(() => {
        result.current.goToPagerStep(step);
      });

      expect(result.current.currentPageIndex).toBe(0);
    });
  });

  it('should handle multiple page index changes', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    const pageIndices = [0, 1, 2, 3, 4, 5];

    pageIndices.forEach(index => {
      act(() => {
        result.current.setCurrentPageIndex(index);
      });

      expect(result.current.currentPageIndex).toBe(index);
    });
  });

  it('should handle rapid step changes', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    // Rapid step changes
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.goToPagerStep(FLOW_STEPS.SELECCION_SERVICIO);
      });
    }

    expect(result.current.currentPageIndex).toBe(0);
  });

  it('should handle rapid page index changes', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    // Rapid page index changes
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.setCurrentPageIndex(i);
      });
    }

    expect(result.current.currentPageIndex).toBe(9);
  });

  it('should handle negative page index', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      result.current.setCurrentPageIndex(-1);
    });

    expect(result.current.currentPageIndex).toBe(-1);
  });

  it('should handle very large page index', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      result.current.setCurrentPageIndex(1000);
    });

    expect(result.current.currentPageIndex).toBe(1000);
  });

  it('should handle undefined step', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      result.current.goToPagerStep(undefined as any);
    });

    expect(result.current.currentPageIndex).toBe(0);
  });

  it('should handle null step', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      result.current.goToPagerStep(null as any);
    });

    expect(result.current.currentPageIndex).toBe(0);
  });

  it('should handle empty string step', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      result.current.goToPagerStep('' as any);
    });

    expect(result.current.currentPageIndex).toBe(0);
  });

  it('should handle different step types', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    const steps = [
      FLOW_STEPS.SELECCION_SERVICIO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
      FLOW_STEPS.CUSTOMER_TRANSPORT_SELECCION_VEHICULO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_METODOLOGIA_PAGO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_GESTION_CONFIRMACION,
    ];

    steps.forEach(step => {
      act(() => {
        result.current.goToPagerStep(step);
      });

      expect(result.current.currentPageIndex).toBe(0);
    });
  });

  it('should handle step changes with different roles', () => {
    const { useMapFlowStore } = require('@/store');
    
    // Test with customer role
    useMapFlowStore.mockReturnValue({
      step: FLOW_STEPS.SELECCION_SERVICIO,
      role: 'customer',
      service: undefined,
    });

    const { result: customerResult } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      customerResult.current.goToPagerStep(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE);
    });

    expect(customerResult.current.currentPageIndex).toBe(0);

    // Test with driver role
    useMapFlowStore.mockReturnValue({
      step: FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD,
      role: 'driver',
      service: 'transport',
    });

    const { result: driverResult } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      driverResult.current.goToPagerStep(FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD);
    });

    expect(driverResult.current.currentPageIndex).toBe(0);
  });

  it('should handle step changes with different services', () => {
    const { useMapFlowStore } = require('@/store');
    
    // Test with transport service
    useMapFlowStore.mockReturnValue({
      step: FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
      role: 'customer',
      service: 'transport',
    });

    const { result: transportResult } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      transportResult.current.goToPagerStep(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE);
    });

    expect(transportResult.current.currentPageIndex).toBe(0);

    // Test with delivery service
    useMapFlowStore.mockReturnValue({
      step: FLOW_STEPS.CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO,
      role: 'customer',
      service: 'delivery',
    });

    const { result: deliveryResult } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      deliveryResult.current.goToPagerStep(FLOW_STEPS.CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO);
    });

    expect(deliveryResult.current.currentPageIndex).toBe(0);
  });

  it('should handle hook unmounting', () => {
    const { result, unmount } = renderHook(() => useMapFlowPagerWithSteps());

    expect(result.current.currentPageIndex).toBe(0);

    unmount();

    // Should not throw any errors
    expect(() => unmount()).not.toThrow();
  });

  it('should handle multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useMapFlowPagerWithSteps());
    const { result: result2 } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      result1.current.setCurrentPageIndex(1);
      result2.current.setCurrentPageIndex(2);
    });

    expect(result1.current.currentPageIndex).toBe(1);
    expect(result2.current.currentPageIndex).toBe(2);
  });

  it('should handle rapid hook re-renders', () => {
    const { result, rerender } = renderHook(() => useMapFlowPagerWithSteps());

    // Rapid re-renders
    for (let i = 0; i < 10; i++) {
      rerender({});
    }

    expect(result.current.currentPageIndex).toBe(0);
  });

  it('should handle edge cases', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    // Test with extreme values
    act(() => {
      result.current.setCurrentPageIndex(Number.MAX_SAFE_INTEGER);
    });

    expect(result.current.currentPageIndex).toBe(Number.MAX_SAFE_INTEGER);

    act(() => {
      result.current.setCurrentPageIndex(Number.MIN_SAFE_INTEGER);
    });

    expect(result.current.currentPageIndex).toBe(Number.MIN_SAFE_INTEGER);
  });

  it('should handle NaN page index', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      result.current.setCurrentPageIndex(NaN);
    });

    expect(result.current.currentPageIndex).toBe(NaN);
  });

  it('should handle Infinity page index', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      result.current.setCurrentPageIndex(Infinity);
    });

    expect(result.current.currentPageIndex).toBe(Infinity);
  });

  it('should handle -Infinity page index', () => {
    const { result } = renderHook(() => useMapFlowPagerWithSteps());

    act(() => {
      result.current.setCurrentPageIndex(-Infinity);
    });

    expect(result.current.currentPageIndex).toBe(-Infinity);
  });
});