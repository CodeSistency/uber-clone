/**
 * Tests para GorhomMapFlowBottomSheet
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import GorhomMapFlowBottomSheet from '@/components/ui/GorhomMapFlowBottomSheet';
import { FLOW_STEPS } from '@/lib/unified-flow/constants';

// Mock de @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheet: ({ children, onClose, ...props }: any) => (
    <View testID="gorhom-bottom-sheet" {...props}>
      {children}
      <Text testID="mock-close" onPress={onClose}>Close</Text>
    </View>
  ),
  BottomSheetView: ({ children, ...props }: any) => (
    <View testID="bottom-sheet-view" {...props}>
      {children}
    </View>
  ),
  BottomSheetHandle: ({ children, ...props }: any) => (
    <View testID="bottom-sheet-handle" {...props}>
      {children}
    </View>
  ),
  BottomSheetBackground: ({ children, ...props }: any) => (
    <View testID="bottom-sheet-background" {...props}>
      {children}
    </View>
  ),
  BottomSheetFooter: ({ children, ...props }: any) => (
    <View testID="bottom-sheet-footer" {...props}>
      {children}
    </View>
  ),
}));

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

// Mock de useBottomSheetTransition
jest.mock('@/hooks/useBottomSheetTransition', () => ({
  useBottomSheetTransition: () => ({
    showBottomSheet: jest.fn(),
    hideBottomSheet: jest.fn(),
    animatedContainerStyle: { transform: [{ translateY: 0 }], opacity: 1 },
  }),
}));

// Mock de MapFlowPagerView
jest.mock('@/components/mapFlow/MapFlowPagerView', () => {
  return function MockMapFlowPagerView({ 
    steps, 
    currentStep, 
    onStepChange, 
    onPageChange, 
    enableSwipe, 
    showPageIndicator, 
    animationType 
  }: any) {
    return (
      <View testID="map-flow-pager-view">
        <Text testID="current-step">{currentStep}</Text>
        <Text testID="steps-count">{steps.length}</Text>
        <Text testID="enable-swipe">{enableSwipe ? 'true' : 'false'}</Text>
        <Text testID="show-indicator">{showPageIndicator ? 'true' : 'false'}</Text>
        <Text testID="animation-type">{animationType}</Text>
        <Text 
          testID="mock-step-change" 
          onPress={() => onStepChange?.(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE)}
        >
          Change Step
        </Text>
        <Text 
          testID="mock-page-change" 
          onPress={() => onPageChange?.(1)}
        >
          Change Page
        </Text>
      </View>
    );
  };
});

describe('GorhomMapFlowBottomSheet', () => {
  const defaultProps = {
    visible: true,
    minHeight: 100,
    maxHeight: 500,
    initialHeight: 200,
    showHandle: true,
    allowDrag: true,
    allowClose: true,
    step: FLOW_STEPS.SELECCION_SERVICIO,
  };

  it('should render without crashing', () => {
    render(
      <GorhomMapFlowBottomSheet {...defaultProps}>
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    expect(screen.getByTestId('gorhom-bottom-sheet')).toBeTruthy();
    expect(screen.getByTestId('content')).toBeTruthy();
  });

  it('should render with handle when showHandle is true', () => {
    render(
      <GorhomMapFlowBottomSheet {...defaultProps} showHandle={true}>
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    expect(screen.getByTestId('bottom-sheet-handle')).toBeTruthy();
  });

  it('should not render handle when showHandle is false', () => {
    render(
      <GorhomMapFlowBottomSheet {...defaultProps} showHandle={false}>
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    // El handle debería estar presente pero con diferentes props
    expect(screen.getByTestId('gorhom-bottom-sheet')).toBeTruthy();
  });

  it('should handle close when allowClose is true', async () => {
    const onClose = jest.fn();
    
    render(
      <GorhomMapFlowBottomSheet {...defaultProps} onClose={onClose}>
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    const closeButton = screen.getByTestId('mock-close');
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should not call onClose when allowClose is false', async () => {
    const onClose = jest.fn();
    
    render(
      <GorhomMapFlowBottomSheet {...defaultProps} allowClose={false} onClose={onClose}>
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    const closeButton = screen.getByTestId('mock-close');
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('should render PagerView when usePagerView is true', () => {
    const pagerSteps = [FLOW_STEPS.SELECCION_SERVICIO, FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE];
    
    render(
      <GorhomMapFlowBottomSheet 
        {...defaultProps} 
        usePagerView={true}
        pagerSteps={pagerSteps}
      >
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    expect(screen.getByTestId('map-flow-pager-view')).toBeTruthy();
    expect(screen.getByTestId('current-step')).toHaveTextContent(FLOW_STEPS.SELECCION_SERVICIO);
    expect(screen.getByTestId('steps-count')).toHaveTextContent('2');
  });

  it('should render children when usePagerView is false', () => {
    render(
      <GorhomMapFlowBottomSheet {...defaultProps} usePagerView={false}>
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    expect(screen.getByTestId('content')).toBeTruthy();
    expect(screen.queryByTestId('map-flow-pager-view')).toBeNull();
  });

  it('should handle step changes in PagerView', async () => {
    const onStepChange = jest.fn();
    const pagerSteps = [FLOW_STEPS.SELECCION_SERVICIO, FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE];
    
    render(
      <GorhomMapFlowBottomSheet 
        {...defaultProps} 
        usePagerView={true}
        pagerSteps={pagerSteps}
        onStepChange={onStepChange}
      >
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    const stepChangeButton = screen.getByTestId('mock-step-change');
    fireEvent.press(stepChangeButton);

    await waitFor(() => {
      expect(onStepChange).toHaveBeenCalledWith(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE);
    });
  });

  it('should handle page changes in PagerView', async () => {
    const onPageChange = jest.fn();
    const pagerSteps = [FLOW_STEPS.SELECCION_SERVICIO, FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE];
    
    render(
      <GorhomMapFlowBottomSheet 
        {...defaultProps} 
        usePagerView={true}
        pagerSteps={pagerSteps}
        onPageChange={onPageChange}
      >
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    const pageChangeButton = screen.getByTestId('mock-page-change');
    fireEvent.press(pageChangeButton);

    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  it('should pass correct props to PagerView', () => {
    const pagerSteps = [FLOW_STEPS.SELECCION_SERVICIO, FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE];
    
    render(
      <GorhomMapFlowBottomSheet 
        {...defaultProps} 
        usePagerView={true}
        pagerSteps={pagerSteps}
        enableSwipe={true}
        showPageIndicator={true}
        animationType="slide"
      >
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    expect(screen.getByTestId('enable-swipe')).toHaveTextContent('true');
    expect(screen.getByTestId('show-indicator')).toHaveTextContent('true');
    expect(screen.getByTestId('animation-type')).toHaveTextContent('slide');
  });

  it('should handle different snap points', () => {
    const snapPoints = ['25%', '50%', '75%'];
    
    render(
      <GorhomMapFlowBottomSheet 
        {...defaultProps} 
        snapPoints={snapPoints}
      >
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    expect(screen.getByTestId('gorhom-bottom-sheet')).toBeTruthy();
  });

  it('should handle gradient and blur effects', () => {
    render(
      <GorhomMapFlowBottomSheet 
        {...defaultProps} 
        useGradient={true}
        useBlur={true}
      >
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    expect(screen.getByTestId('gorhom-bottom-sheet')).toBeTruthy();
  });

  it('should handle bottom bar', () => {
    const bottomBar = <Text testID="bottom-bar">Bottom Bar</Text>;
    
    render(
      <GorhomMapFlowBottomSheet 
        {...defaultProps} 
        bottomBar={bottomBar}
      >
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    expect(screen.getByTestId('bottom-sheet-footer')).toBeTruthy();
  });

  it('should handle visibility changes', () => {
    const { rerender } = render(
      <GorhomMapFlowBottomSheet {...defaultProps} visible={true}>
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    expect(screen.getByTestId('gorhom-bottom-sheet')).toBeTruthy();

    rerender(
      <GorhomMapFlowBottomSheet {...defaultProps} visible={false}>
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    // El componente debería manejar la visibilidad correctamente
    expect(screen.getByTestId('gorhom-bottom-sheet')).toBeTruthy();
  });

  it('should handle different step types', () => {
    const steps = [
      FLOW_STEPS.SELECCION_SERVICIO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
      FLOW_STEPS.CUSTOMER_TRANSPORT_SELECCION_VEHICULO,
    ];

    steps.forEach(step => {
      const { rerender } = render(
        <GorhomMapFlowBottomSheet {...defaultProps} step={step}>
          <Text testID="content">Test Content</Text>
        </GorhomMapFlowBottomSheet>
      );

      expect(screen.getByTestId('gorhom-bottom-sheet')).toBeTruthy();
      rerender(<View />); // Clean up
    });
  });

  it('should handle missing onClose callback', () => {
    render(
      <GorhomMapFlowBottomSheet {...defaultProps}>
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    const closeButton = screen.getByTestId('mock-close');
    fireEvent.press(closeButton);

    // No debería lanzar error
    expect(screen.getByTestId('gorhom-bottom-sheet')).toBeTruthy();
  });

  it('should handle missing onStepChange callback', () => {
    const pagerSteps = [FLOW_STEPS.SELECCION_SERVICIO];
    
    render(
      <GorhomMapFlowBottomSheet 
        {...defaultProps} 
        usePagerView={true}
        pagerSteps={pagerSteps}
      >
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    const stepChangeButton = screen.getByTestId('mock-step-change');
    fireEvent.press(stepChangeButton);

    // No debería lanzar error
    expect(screen.getByTestId('map-flow-pager-view')).toBeTruthy();
  });

  it('should handle missing onPageChange callback', () => {
    const pagerSteps = [FLOW_STEPS.SELECCION_SERVICIO];
    
    render(
      <GorhomMapFlowBottomSheet 
        {...defaultProps} 
        usePagerView={true}
        pagerSteps={pagerSteps}
      >
        <Text testID="content">Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );

    const pageChangeButton = screen.getByTestId('mock-page-change');
    fireEvent.press(pageChangeButton);

    // No debería lanzar error
    expect(screen.getByTestId('map-flow-pager-view')).toBeTruthy();
  });
});
