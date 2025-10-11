/**
 * Tests para useMapFlowSelectors hook
 */

import { renderHook } from '@testing-library/react-native';
import { useUnifiedFlowSelectors, useBasicFlowSelectors } from '@/hooks/useMapFlowSelectors';
import { FLOW_STEPS } from '@/lib/unified-flow/constants';

// Mock del store
jest.mock('@/store', () => ({
  useMapFlowStore: jest.fn(() => ({
    step: FLOW_STEPS.SELECCION_SERVICIO,
    role: 'customer',
    service: undefined,
    isActive: true,
    bottomSheetVisible: true,
    bottomSheetMinHeight: 100,
    bottomSheetMaxHeight: 500,
    bottomSheetInitialHeight: 200,
    bottomSheetAllowDrag: true,
    bottomSheetAllowClose: true,
    bottomSheetManuallyClosed: false,
    showReopenButton: false,
    bottomSheetSnapPoints: [25, 50, 75],
    bottomSheetHandleHeight: 44,
    bottomSheetClassName: 'px-5 pb-5',
    bottomSheetUseGradient: false,
    bottomSheetUseBlur: false,
    bottomSheetBottomBar: null,
    bottomSheetShowHandle: true,
  })),
}));

// Mock del logger
jest.mock('@/lib/logger', () => ({
  log: {
    selectors: {
      debug: jest.fn(),
    },
  },
}));

describe('useMapFlowSelectors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useUnifiedFlowSelectors', () => {
    it('should return unified flow selectors', () => {
      const { result } = renderHook(() => useUnifiedFlowSelectors());

      expect(result.current.flow).toBeDefined();
      expect(result.current.bottomSheet).toBeDefined();
    });

    it('should return correct flow properties', () => {
      const { result } = renderHook(() => useUnifiedFlowSelectors());

      expect(result.current.flow.step).toBe(FLOW_STEPS.SELECCION_SERVICIO);
      expect(result.current.flow.role).toBe('customer');
      expect(result.current.flow.service).toBeUndefined();
    });

    it('should return correct bottomSheet properties', () => {
      const { result } = renderHook(() => useUnifiedFlowSelectors());

      expect(result.current.bottomSheet.bottomSheetAllowDrag).toBe(true);
      expect(result.current.bottomSheet.bottomSheetAllowClose).toBe(true);
      expect(result.current.bottomSheet.bottomSheetVisible).toBe(true);
    });

    it('should handle different step values', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue({
        step: FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
        role: 'customer',
        service: 'transport',
        isActive: true,
        bottomSheetVisible: true,
        bottomSheetMinHeight: 100,
        bottomSheetMaxHeight: 500,
        bottomSheetInitialHeight: 200,
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetManuallyClosed: false,
        showReopenButton: false,
        bottomSheetSnapPoints: [25, 50, 75],
        bottomSheetHandleHeight: 44,
        bottomSheetClassName: 'px-5 pb-5',
        bottomSheetUseGradient: false,
        bottomSheetUseBlur: false,
        bottomSheetBottomBar: null,
        bottomSheetShowHandle: true,
      });

      const { result } = renderHook(() => useUnifiedFlowSelectors());

      expect(result.current.flow.step).toBe(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE);
      expect(result.current.flow.service).toBe('transport');
    });

    it('should handle different role values', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue({
        step: FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD,
        role: 'driver',
        service: 'transport',
        isActive: true,
        bottomSheetVisible: true,
        bottomSheetMinHeight: 100,
        bottomSheetMaxHeight: 500,
        bottomSheetInitialHeight: 200,
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetManuallyClosed: false,
        showReopenButton: false,
        bottomSheetSnapPoints: [25, 50, 75],
        bottomSheetHandleHeight: 44,
        bottomSheetClassName: 'px-5 pb-5',
        bottomSheetUseGradient: false,
        bottomSheetUseBlur: false,
        bottomSheetBottomBar: null,
        bottomSheetShowHandle: true,
      });

      const { result } = renderHook(() => useUnifiedFlowSelectors());

      expect(result.current.flow.role).toBe('driver');
      expect(result.current.flow.service).toBe('transport');
    });

    it('should handle different service values', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue({
        step: FLOW_STEPS.CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO,
        role: 'customer',
        service: 'delivery',
        isActive: true,
        bottomSheetVisible: true,
        bottomSheetMinHeight: 100,
        bottomSheetMaxHeight: 500,
        bottomSheetInitialHeight: 200,
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetManuallyClosed: false,
        showReopenButton: false,
        bottomSheetSnapPoints: [25, 50, 75],
        bottomSheetHandleHeight: 44,
        bottomSheetClassName: 'px-5 pb-5',
        bottomSheetUseGradient: false,
        bottomSheetUseBlur: false,
        bottomSheetBottomBar: null,
        bottomSheetShowHandle: true,
      });

      const { result } = renderHook(() => useUnifiedFlowSelectors());

      expect(result.current.flow.service).toBe('delivery');
    });

    it('should handle different bottomSheet states', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue({
        step: FLOW_STEPS.SELECCION_SERVICIO,
        role: 'customer',
        service: undefined,
        isActive: false,
        bottomSheetVisible: false,
        bottomSheetMinHeight: 200,
        bottomSheetMaxHeight: 600,
        bottomSheetInitialHeight: 300,
        bottomSheetAllowDrag: false,
        bottomSheetAllowClose: false,
        bottomSheetManuallyClosed: true,
        showReopenButton: true,
        bottomSheetSnapPoints: [50, 75, 90],
        bottomSheetHandleHeight: 50,
        bottomSheetClassName: 'px-3 pb-3',
        bottomSheetUseGradient: true,
        bottomSheetUseBlur: true,
        bottomSheetBottomBar: <div>Test</div>,
        bottomSheetShowHandle: false,
      });

      const { result } = renderHook(() => useUnifiedFlowSelectors());

      expect(result.current.bottomSheet.bottomSheetVisible).toBe(false);
      expect(result.current.bottomSheet.bottomSheetMinHeight).toBe(200);
      expect(result.current.bottomSheet.bottomSheetMaxHeight).toBe(600);
      expect(result.current.bottomSheet.bottomSheetInitialHeight).toBe(300);
      expect(result.current.bottomSheet.bottomSheetAllowDrag).toBe(false);
      expect(result.current.bottomSheet.bottomSheetAllowClose).toBe(false);
    });
  });

  describe('useBasicFlowSelectors', () => {
    it('should return basic flow selectors', () => {
      const { result } = renderHook(() => useBasicFlowSelectors());

      expect(result.current.step).toBe(FLOW_STEPS.SELECCION_SERVICIO);
      expect(result.current.role).toBe('customer');
      expect(result.current.service).toBeUndefined();
    });

    it('should handle different step values', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue({
        step: FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
        role: 'customer',
        service: 'transport',
      });

      const { result } = renderHook(() => useBasicFlowSelectors());

      expect(result.current.step).toBe(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE);
      expect(result.current.role).toBe('customer');
      expect(result.current.service).toBe('transport');
    });

    it('should handle different role values', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue({
        step: FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD,
        role: 'driver',
        service: 'transport',
      });

      const { result } = renderHook(() => useBasicFlowSelectors());

      expect(result.current.step).toBe(FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD);
      expect(result.current.role).toBe('driver');
      expect(result.current.service).toBe('transport');
    });

    it('should handle different service values', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue({
        step: FLOW_STEPS.CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO,
        role: 'customer',
        service: 'delivery',
      });

      const { result } = renderHook(() => useBasicFlowSelectors());

      expect(result.current.step).toBe(FLOW_STEPS.CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO);
      expect(result.current.role).toBe('customer');
      expect(result.current.service).toBe('delivery');
    });

    it('should handle undefined values', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue({
        step: undefined,
        role: undefined,
        service: undefined,
      });

      const { result } = renderHook(() => useBasicFlowSelectors());

      expect(result.current.step).toBeUndefined();
      expect(result.current.role).toBeUndefined();
      expect(result.current.service).toBeUndefined();
    });

    it('should handle null values', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue({
        step: null,
        role: null,
        service: null,
      });

      const { result } = renderHook(() => useBasicFlowSelectors());

      expect(result.current.step).toBeNull();
      expect(result.current.role).toBeNull();
      expect(result.current.service).toBeNull();
    });

    it('should handle empty string values', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue({
        step: '',
        role: '',
        service: '',
      });

      const { result } = renderHook(() => useBasicFlowSelectors());

      expect(result.current.step).toBe('');
      expect(result.current.role).toBe('');
      expect(result.current.service).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing store properties', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue({});

      const { result: unifiedResult } = renderHook(() => useUnifiedFlowSelectors());
      const { result: basicResult } = renderHook(() => useBasicFlowSelectors());

      expect(unifiedResult.current.flow).toBeDefined();
      expect(unifiedResult.current.bottomSheet).toBeDefined();
      expect(basicResult.current.step).toBeUndefined();
      expect(basicResult.current.role).toBeUndefined();
      expect(basicResult.current.service).toBeUndefined();
    });

    it('should handle store returning null', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue(null);

      const { result: unifiedResult } = renderHook(() => useUnifiedFlowSelectors());
      const { result: basicResult } = renderHook(() => useBasicFlowSelectors());

      expect(unifiedResult.current.flow).toBeDefined();
      expect(unifiedResult.current.bottomSheet).toBeDefined();
      expect(basicResult.current.step).toBeUndefined();
      expect(basicResult.current.role).toBeUndefined();
      expect(basicResult.current.service).toBeUndefined();
    });

    it('should handle store returning undefined', () => {
      const { useMapFlowStore } = require('@/store');
      
      useMapFlowStore.mockReturnValue(undefined);

      const { result: unifiedResult } = renderHook(() => useUnifiedFlowSelectors());
      const { result: basicResult } = renderHook(() => useBasicFlowSelectors());

      expect(unifiedResult.current.flow).toBeDefined();
      expect(unifiedResult.current.bottomSheet).toBeDefined();
      expect(basicResult.current.step).toBeUndefined();
      expect(basicResult.current.role).toBeUndefined();
      expect(basicResult.current.service).toBeUndefined();
    });

    it('should handle rapid re-renders', () => {
      const { result, rerender } = renderHook(() => useUnifiedFlowSelectors());

      // Rapid re-renders
      for (let i = 0; i < 10; i++) {
        rerender({});
      }

      expect(result.current.flow).toBeDefined();
      expect(result.current.bottomSheet).toBeDefined();
    });

    it('should handle hook unmounting', () => {
      const { result, unmount } = renderHook(() => useUnifiedFlowSelectors());

      expect(result.current.flow).toBeDefined();

      unmount();

      // Should not throw any errors
      expect(() => unmount()).not.toThrow();
    });
  });
});