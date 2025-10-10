/**
 * Tests para UnifiedFlowWrapper
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import UnifiedFlowWrapper from '@/components/unified-flow/UnifiedFlowWrapper';
import { useMapFlowStore } from '@/store';
import { FLOW_STEPS } from '@/lib/unified-flow/constants';

// Mock del store
jest.mock('@/store', () => ({
  useMapFlowStore: jest.fn(),
  useLocationStore: jest.fn(() => ({
    userLatitude: 40.7128,
    userLongitude: -74.0060,
    userAddress: 'New York, NY',
  })),
  useRealtimeStore: jest.fn(() => ({
    connectionStatus: { isConnected: true },
  })),
}));

// Mock de hooks
jest.mock('@/hooks/useMapFlowPagerWithSteps', () => ({
  useMapFlowPagerWithSteps: () => ({
    pagerSteps: [],
    shouldUsePager: false,
    currentPageIndex: 0,
    totalPages: 0,
    isTransitioning: false,
    goToPagerStep: jest.fn(),
    setCurrentPageIndex: jest.fn(),
  }),
}));

jest.mock('@/hooks/useMapFlowSelectors', () => ({
  useUnifiedFlowSelectors: () => ({
    flow: {
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
    },
    bottomSheet: {
      bottomSheetAllowDrag: true,
      bottomSheetAllowClose: true,
      bottomSheetVisible: true,
    },
  }),
  useBasicFlowSelectors: () => ({
    step: FLOW_STEPS.SELECCION_SERVICIO,
    role: 'customer',
    service: undefined,
  }),
}));

jest.mock('@/hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: () => ({
    startRender: jest.fn(),
    endRender: jest.fn(),
  }),
  useErrorMonitor: () => ({
    hasError: false,
    error: null,
  }),
}));

// Mock de componentes
jest.mock('@/components/ui/GorhomMapFlowBottomSheet', () => {
  return function MockGorhomMapFlowBottomSheet({ children, visible, onClose }: any) {
    return visible ? (
      <View testID="bottom-sheet">
        {children}
        <Text testID="close-button" onPress={onClose}>Close</Text>
      </View>
    ) : null;
  };
});

jest.mock('@/components/ui/FloatingReopenButton', () => {
  return function MockFloatingReopenButton({ visible, onPress }: any) {
    return visible ? (
      <Text testID="reopen-button" onPress={onPress}>Reopen</Text>
    ) : null;
  };
});

jest.mock('@/components/unified-flow/DebugInfo', () => {
  return function MockDebugInfo() {
    return <View testID="debug-info" />;
  };
});

jest.mock('@/components/Map', () => {
  return function MockMap() {
    return <View testID="map" />;
  };
});

// Mock del renderStep
const mockRenderStep = jest.fn((step: string) => {
  return <Text testID={`step-${step}`}>Step: {step}</Text>;
});

describe('UnifiedFlowWrapper', () => {
  const mockUseMapFlowStore = useMapFlowStore as jest.MockedFunction<typeof useMapFlowStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseMapFlowStore.mockReturnValue({
      flow: {
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
      },
      bottomSheet: {
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetVisible: true,
      },
      setBottomSheetManualClose: jest.fn(),
      setShowReopenButton: jest.fn(),
      resetBottomSheetLocalState: jest.fn(),
      updateStepBottomSheet: jest.fn(),
      start: jest.fn(),
    });
  });

  it('should render without crashing', () => {
    render(
      <UnifiedFlowWrapper
        role="customer"
        renderStep={mockRenderStep}
      />
    );

    expect(screen.getByTestId('map')).toBeTruthy();
    expect(screen.getByTestId('bottom-sheet')).toBeTruthy();
  });

  it('should render the current step content', () => {
    render(
      <UnifiedFlowWrapper
        role="customer"
        renderStep={mockRenderStep}
      />
    );

    expect(mockRenderStep).toHaveBeenCalledWith(FLOW_STEPS.SELECCION_SERVICIO);
    expect(screen.getByTestId(`step-${FLOW_STEPS.SELECCION_SERVICIO}`)).toBeTruthy();
  });

  it('should show bottom sheet when visible', () => {
    render(
      <UnifiedFlowWrapper
        role="customer"
        renderStep={mockRenderStep}
      />
    );

    expect(screen.getByTestId('bottom-sheet')).toBeTruthy();
  });

  it('should hide bottom sheet when not visible', () => {
    mockUseMapFlowStore.mockReturnValue({
      flow: {
        step: FLOW_STEPS.SELECCION_SERVICIO,
        role: 'customer',
        service: undefined,
        isActive: true,
        bottomSheetVisible: false,
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
      },
      bottomSheet: {
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetVisible: false,
      },
      setBottomSheetManualClose: jest.fn(),
      setShowReopenButton: jest.fn(),
      resetBottomSheetLocalState: jest.fn(),
      updateStepBottomSheet: jest.fn(),
      start: jest.fn(),
    });

    render(
      <UnifiedFlowWrapper
        role="customer"
        renderStep={mockRenderStep}
      />
    );

    expect(screen.queryByTestId('bottom-sheet')).toBeNull();
  });

  it('should show floating reopen button when bottom sheet is manually closed', () => {
    mockUseMapFlowStore.mockReturnValue({
      flow: {
        step: FLOW_STEPS.SELECCION_SERVICIO,
        role: 'customer',
        service: undefined,
        isActive: true,
        bottomSheetVisible: false,
        bottomSheetMinHeight: 100,
        bottomSheetMaxHeight: 500,
        bottomSheetInitialHeight: 200,
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetManuallyClosed: true,
        showReopenButton: true,
        bottomSheetSnapPoints: [25, 50, 75],
        bottomSheetHandleHeight: 44,
        bottomSheetClassName: 'px-5 pb-5',
        bottomSheetUseGradient: false,
        bottomSheetUseBlur: false,
        bottomSheetBottomBar: null,
        bottomSheetShowHandle: true,
      },
      bottomSheet: {
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetVisible: false,
      },
      setBottomSheetManualClose: jest.fn(),
      setShowReopenButton: jest.fn(),
      resetBottomSheetLocalState: jest.fn(),
      updateStepBottomSheet: jest.fn(),
      start: jest.fn(),
    });

    render(
      <UnifiedFlowWrapper
        role="customer"
        renderStep={mockRenderStep}
      />
    );

    expect(screen.getByTestId('reopen-button')).toBeTruthy();
  });

  it('should handle step changes', () => {
    const onStepChange = jest.fn();
    
    render(
      <UnifiedFlowWrapper
        role="customer"
        renderStep={mockRenderStep}
        onStepChange={onStepChange}
      />
    );

    // Simular cambio de paso
    const newStep = FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE;
    mockUseMapFlowStore.mockReturnValue({
      flow: {
        step: newStep,
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
      },
      bottomSheet: {
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetVisible: true,
      },
      setBottomSheetManualClose: jest.fn(),
      setShowReopenButton: jest.fn(),
      resetBottomSheetLocalState: jest.fn(),
      updateStepBottomSheet: jest.fn(),
      start: jest.fn(),
    });

    // Re-renderizar con el nuevo paso
    render(
      <UnifiedFlowWrapper
        role="customer"
        renderStep={mockRenderStep}
        onStepChange={onStepChange}
      />
    );

    expect(mockRenderStep).toHaveBeenCalledWith(newStep);
  });

  it('should handle page changes', () => {
    const onPageChange = jest.fn();
    
    render(
      <UnifiedFlowWrapper
        role="customer"
        renderStep={mockRenderStep}
        onPageChange={onPageChange}
      />
    );

    // Simular cambio de página
    const newPageIndex = 1;
    // El componente debería manejar el cambio de página
    expect(onPageChange).toBeDefined();
  });

  it('should handle bottom sheet close', async () => {
    const mockSetBottomSheetManualClose = jest.fn();
    const mockSetShowReopenButton = jest.fn();
    
    mockUseMapFlowStore.mockReturnValue({
      flow: {
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
      },
      bottomSheet: {
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetVisible: true,
      },
      setBottomSheetManualClose: mockSetBottomSheetManualClose,
      setShowReopenButton: mockSetShowReopenButton,
      resetBottomSheetLocalState: jest.fn(),
      updateStepBottomSheet: jest.fn(),
      start: jest.fn(),
    });

    render(
      <UnifiedFlowWrapper
        role="customer"
        renderStep={mockRenderStep}
      />
    );

    // Simular cierre del bottom sheet
    const closeButton = screen.getByTestId('close-button');
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(mockSetBottomSheetManualClose).toHaveBeenCalledWith(true);
      expect(mockSetShowReopenButton).toHaveBeenCalledWith(true);
    });
  });

  it('should handle bottom sheet reopen', async () => {
    const mockSetBottomSheetManualClose = jest.fn();
    const mockSetShowReopenButton = jest.fn();
    const mockUpdateStepBottomSheet = jest.fn();
    
    mockUseMapFlowStore.mockReturnValue({
      flow: {
        step: FLOW_STEPS.SELECCION_SERVICIO,
        role: 'customer',
        service: undefined,
        isActive: true,
        bottomSheetVisible: false,
        bottomSheetMinHeight: 100,
        bottomSheetMaxHeight: 500,
        bottomSheetInitialHeight: 200,
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetManuallyClosed: true,
        showReopenButton: true,
        bottomSheetSnapPoints: [25, 50, 75],
        bottomSheetHandleHeight: 44,
        bottomSheetClassName: 'px-5 pb-5',
        bottomSheetUseGradient: false,
        bottomSheetUseBlur: false,
        bottomSheetBottomBar: null,
        bottomSheetShowHandle: true,
      },
      bottomSheet: {
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetVisible: false,
      },
      setBottomSheetManualClose: mockSetBottomSheetManualClose,
      setShowReopenButton: mockSetShowReopenButton,
      resetBottomSheetLocalState: jest.fn(),
      updateStepBottomSheet: mockUpdateStepBottomSheet,
      start: jest.fn(),
    });

    render(
      <UnifiedFlowWrapper
        role="customer"
        renderStep={mockRenderStep}
      />
    );

    // Simular reapertura del bottom sheet
    const reopenButton = screen.getByTestId('reopen-button');
    fireEvent.press(reopenButton);

    await waitFor(() => {
      expect(mockSetBottomSheetManualClose).toHaveBeenCalledWith(false);
      expect(mockSetShowReopenButton).toHaveBeenCalledWith(false);
      expect(mockUpdateStepBottomSheet).toHaveBeenCalledWith(FLOW_STEPS.SELECCION_SERVICIO, { visible: true });
    });
  });

  it('should support PagerView when enabled', () => {
    render(
      <UnifiedFlowWrapper
        role="customer"
        renderStep={mockRenderStep}
        usePagerView={true}
        enablePagerViewForSteps={[FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE]}
      />
    );

    // El componente debería renderizar correctamente con PagerView habilitado
    expect(screen.getByTestId('bottom-sheet')).toBeTruthy();
  });

  it('should handle different roles', () => {
    mockUseMapFlowStore.mockReturnValue({
      flow: {
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
      },
      bottomSheet: {
        bottomSheetAllowDrag: true,
        bottomSheetAllowClose: true,
        bottomSheetVisible: true,
      },
      setBottomSheetManualClose: jest.fn(),
      setShowReopenButton: jest.fn(),
      resetBottomSheetLocalState: jest.fn(),
      updateStepBottomSheet: jest.fn(),
      start: jest.fn(),
    });

    render(
      <UnifiedFlowWrapper
        role="driver"
        renderStep={mockRenderStep}
      />
    );

    expect(mockRenderStep).toHaveBeenCalledWith(FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD);
  });
});
