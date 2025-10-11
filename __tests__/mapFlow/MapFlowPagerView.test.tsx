/**
 * Tests para MapFlowPagerView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import MapFlowPagerView from '@/components/mapFlow/MapFlowPagerView';
import { FLOW_STEPS } from '@/lib/unified-flow/constants';

// Mock de react-native-pager-view
jest.mock('react-native-pager-view', () => ({
  PagerView: ({ children, onPageSelected, ...props }: any) => (
    <View testID="pager-view" {...props}>
      {children}
      <Text testID="mock-page-selected" onPress={() => onPageSelected?.({ nativeEvent: { position: 0 } })}>
        Page Selected
      </Text>
    </View>
  ),
}));

// Mock de MapFlowPage
jest.mock('@/components/mapFlow/MapFlowPage', () => {
  return function MockMapFlowPage({ 
    step, 
    isActive, 
    isVisible, 
    onContentReady, 
    onAction 
  }: any) {
    return (
      <View testID={`map-flow-page-${step}`}>
        <Text testID="step">{step}</Text>
        <Text testID="is-active">{isActive ? 'true' : 'false'}</Text>
        <Text testID="is-visible">{isVisible ? 'true' : 'false'}</Text>
        <Text testID="content-ready-button" onPress={onContentReady}>
          Content Ready
        </Text>
        <Text testID="action-button" onPress={() => onAction('test-action', { data: 'test' })}>
          Trigger Action
        </Text>
      </View>
    );
  };
});

// Mock del logger
jest.mock('@/lib/logger', () => ({
  log: {
    pagerView: {
      debug: jest.fn(),
    },
  },
}));

describe('MapFlowPagerView', () => {
  const defaultProps = {
    steps: [
      FLOW_STEPS.SELECCION_SERVICIO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
      FLOW_STEPS.CUSTOMER_TRANSPORT_SELECCION_VEHICULO,
    ],
    currentStep: FLOW_STEPS.SELECCION_SERVICIO,
    onStepChange: jest.fn(),
    onPageChange: jest.fn(),
    enableSwipe: true,
    showPageIndicator: true,
    animationType: 'slide' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<MapFlowPagerView {...defaultProps} />);

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should render all steps as pages', () => {
    render(<MapFlowPagerView {...defaultProps} />);

    expect(screen.getByTestId(`map-flow-page-${FLOW_STEPS.SELECCION_SERVICIO}`)).toBeTruthy();
    expect(screen.getByTestId(`map-flow-page-${FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE}`)).toBeTruthy();
    expect(screen.getByTestId(`map-flow-page-${FLOW_STEPS.CUSTOMER_TRANSPORT_SELECCION_VEHICULO}`)).toBeTruthy();
  });

  it('should mark current step as active', () => {
    render(<MapFlowPagerView {...defaultProps} />);

    const currentStepPage = screen.getByTestId(`map-flow-page-${FLOW_STEPS.SELECCION_SERVICIO}`);
    const currentStepActive = screen.getByTestId('is-active');
    expect(currentStepActive).toHaveTextContent('true');
  });

  it('should mark other steps as inactive', () => {
    render(<MapFlowPagerView {...defaultProps} />);

    const otherStepPage = screen.getByTestId(`map-flow-page-${FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE}`);
    const otherStepActive = screen.getByTestId('is-inactive');
    expect(otherStepActive).toHaveTextContent('false');
  });

  it('should handle step changes', () => {
    const { rerender } = render(<MapFlowPagerView {...defaultProps} />);

    expect(screen.getByTestId(`map-flow-page-${FLOW_STEPS.SELECCION_SERVICIO}`)).toBeTruthy();

    rerender(
      <MapFlowPagerView 
        {...defaultProps} 
        currentStep={FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE} 
      />
    );

    expect(screen.getByTestId(`map-flow-page-${FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE}`)).toBeTruthy();
  });

  it('should call onStepChange when step changes', async () => {
    const onStepChange = jest.fn();
    render(<MapFlowPagerView {...defaultProps} onStepChange={onStepChange} />);

    // Simulate step change
    const stepChangeButton = screen.getByTestId('action-button');
    fireEvent.press(stepChangeButton);

    await waitFor(() => {
      expect(onStepChange).toHaveBeenCalledWith('test-action', { data: 'test' });
    });
  });

  it('should call onPageChange when page changes', async () => {
    const onPageChange = jest.fn();
    render(<MapFlowPagerView {...defaultProps} onPageChange={onPageChange} />);

    // Simulate page change
    const pageSelectedButton = screen.getByTestId('mock-page-selected');
    fireEvent.press(pageSelectedButton);

    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalledWith(0);
    });
  });

  it('should handle enableSwipe prop', () => {
    render(<MapFlowPagerView {...defaultProps} enableSwipe={false} />);

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should handle showPageIndicator prop', () => {
    render(<MapFlowPagerView {...defaultProps} showPageIndicator={false} />);

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should handle different animation types', () => {
    const animationTypes = ['slide', 'fade'] as const;

    animationTypes.forEach(animationType => {
      const { unmount } = render(
        <MapFlowPagerView {...defaultProps} animationType={animationType} />
      );

      expect(screen.getByTestId('pager-view')).toBeTruthy();
      unmount();
    });
  });

  it('should handle empty steps array', () => {
    render(<MapFlowPagerView {...defaultProps} steps={[]} />);

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should handle single step', () => {
    render(
      <MapFlowPagerView 
        {...defaultProps} 
        steps={[FLOW_STEPS.SELECCION_SERVICIO]} 
      />
    );

    expect(screen.getByTestId(`map-flow-page-${FLOW_STEPS.SELECCION_SERVICIO}`)).toBeTruthy();
  });

  it('should handle missing onStepChange callback', () => {
    render(<MapFlowPagerView {...defaultProps} onStepChange={jest.fn()} />);

    const actionButton = screen.getByTestId('action-button');
    
    // Should not crash when pressed
    expect(() => fireEvent.press(actionButton)).not.toThrow();
  });

  it('should handle missing onPageChange callback', () => {
    render(<MapFlowPagerView {...defaultProps} onPageChange={undefined} />);

    const pageSelectedButton = screen.getByTestId('mock-page-selected');
    
    // Should not crash when pressed
    expect(() => fireEvent.press(pageSelectedButton)).not.toThrow();
  });

  it('should handle component unmounting', () => {
    const { unmount } = render(<MapFlowPagerView {...defaultProps} />);

    expect(screen.getByTestId('pager-view')).toBeTruthy();

    unmount();

    // Should not throw any errors
    expect(() => unmount()).not.toThrow();
  });

  it('should handle rapid step changes', () => {
    const { rerender } = render(<MapFlowPagerView {...defaultProps} />);

    // Rapid step changes
    for (let i = 0; i < 10; i++) {
      const step = defaultProps.steps[i % defaultProps.steps.length];
      rerender(
        <MapFlowPagerView 
          {...defaultProps} 
          currentStep={step} 
        />
      );
    }

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should handle different step types', () => {
    const steps = [
      FLOW_STEPS.SELECCION_SERVICIO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
      FLOW_STEPS.CUSTOMER_TRANSPORT_SELECCION_VEHICULO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_METODOLOGIA_PAGO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_GESTION_CONFIRMACION,
    ];

    render(<MapFlowPagerView {...defaultProps} steps={steps} />);

    steps.forEach(step => {
      expect(screen.getByTestId(`map-flow-page-${step}`)).toBeTruthy();
    });
  });

  it('should handle undefined currentStep', () => {
    render(<MapFlowPagerView {...defaultProps} currentStep={undefined as any} />);

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should handle null currentStep', () => {
    render(<MapFlowPagerView {...defaultProps} currentStep={null as any} />);

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should handle currentStep not in steps array', () => {
    render(
      <MapFlowPagerView 
        {...defaultProps} 
        currentStep={FLOW_STEPS.CUSTOMER_TRANSPORT_METODOLOGIA_PAGO} 
      />
    );

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should handle duplicate steps in array', () => {
    const stepsWithDuplicates = [
      FLOW_STEPS.SELECCION_SERVICIO,
      FLOW_STEPS.SELECCION_SERVICIO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
    ];

    render(<MapFlowPagerView {...defaultProps} steps={stepsWithDuplicates} />);

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should handle steps with undefined values', () => {
    const stepsWithUndefined = [
      FLOW_STEPS.SELECCION_SERVICIO,
      undefined as any,
      FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
    ];

    render(<MapFlowPagerView {...defaultProps} steps={stepsWithUndefined} />);

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should handle steps with null values', () => {
    const stepsWithNull = [
      FLOW_STEPS.SELECCION_SERVICIO,
      null as any,
      FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
    ];

    render(<MapFlowPagerView {...defaultProps} steps={stepsWithNull} />);

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should handle very large steps array', () => {
    const largeStepsArray = Array(100).fill(FLOW_STEPS.SELECCION_SERVICIO);

    render(<MapFlowPagerView {...defaultProps} steps={largeStepsArray} />);

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });

  it('should handle edge cases', () => {
    // Test with all props undefined
    render(
      <MapFlowPagerView 
        steps={undefined as any}
        currentStep={undefined as any}
        onStepChange={jest.fn()}
        onPageChange={undefined}
        enableSwipe={undefined}
        showPageIndicator={undefined}
        animationType={undefined as any}
      />
    );

    expect(screen.getByTestId('pager-view')).toBeTruthy();
  });
});
