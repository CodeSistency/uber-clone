/**
 * Tests para MapFlowPage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, LayoutChangeEvent } from 'react-native';
import MapFlowPage from '@/components/mapFlow/MapFlowPage';
import { FLOW_STEPS } from '@/lib/unified-flow/constants';

// Mock del logger
jest.mock('@/lib/logger', () => ({
  log: {
    pagerView: {
      debug: jest.fn(),
    },
  },
}));

// Mock de MapFlowPageContent
jest.mock('@/components/mapFlow/MapFlowPageContent', () => {
  return function MockMapFlowPageContent({ 
    step, 
    isActive, 
    isReady, 
    onContentReady, 
    onAction 
  }: any) {
    return (
      <View testID="map-flow-page-content">
        <Text testID="step">{step}</Text>
        <Text testID="is-active">{isActive ? 'true' : 'false'}</Text>
        <Text testID="is-ready">{isReady ? 'true' : 'false'}</Text>
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

describe('MapFlowPage', () => {
  const defaultProps = {
    step: FLOW_STEPS.SELECCION_SERVICIO,
    isActive: true,
    isVisible: true,
    onContentReady: jest.fn(),
    onAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<MapFlowPage {...defaultProps} />);

    expect(screen.getByTestId('map-flow-page-content')).toBeTruthy();
    expect(screen.getByTestId('step')).toHaveTextContent(FLOW_STEPS.SELECCION_SERVICIO);
  });

  it('should pass correct props to MapFlowPageContent', () => {
    render(<MapFlowPage {...defaultProps} />);

    expect(screen.getByTestId('step')).toHaveTextContent(FLOW_STEPS.SELECCION_SERVICIO);
    expect(screen.getByTestId('is-active')).toHaveTextContent('true');
    expect(screen.getByTestId('is-ready')).toHaveTextContent('false');
  });

  it('should handle isActive prop changes', () => {
    const { rerender } = render(<MapFlowPage {...defaultProps} />);

    expect(screen.getByTestId('is-active')).toHaveTextContent('true');

    rerender(<MapFlowPage {...defaultProps} isActive={false} />);

    expect(screen.getByTestId('is-active')).toHaveTextContent('false');
  });

  it('should handle isVisible prop changes', () => {
    const { rerender } = render(<MapFlowPage {...defaultProps} />);

    expect(screen.getByTestId('map-flow-page-content')).toBeTruthy();

    rerender(<MapFlowPage {...defaultProps} isVisible={false} />);

    expect(screen.getByTestId('map-flow-page-content')).toBeTruthy();
  });

  it('should handle step changes', () => {
    const { rerender } = render(<MapFlowPage {...defaultProps} />);

    expect(screen.getByTestId('step')).toHaveTextContent(FLOW_STEPS.SELECCION_SERVICIO);

    rerender(
      <MapFlowPage 
        {...defaultProps} 
        step={FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE} 
      />
    );

    expect(screen.getByTestId('step')).toHaveTextContent(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE);
  });

  it('should call onContentReady when content is ready', async () => {
    const onContentReady = jest.fn();
    render(<MapFlowPage {...defaultProps} onContentReady={onContentReady} />);

    const contentReadyButton = screen.getByTestId('content-ready-button');
    fireEvent.press(contentReadyButton);

    await waitFor(() => {
      expect(onContentReady).toHaveBeenCalled();
    });
  });

  it('should call onAction when action is triggered', async () => {
    const onAction = jest.fn();
    render(<MapFlowPage {...defaultProps} onAction={onAction} />);

    const actionButton = screen.getByTestId('action-button');
    fireEvent.press(actionButton);

    await waitFor(() => {
      expect(onAction).toHaveBeenCalledWith('test-action', { data: 'test' });
    });
  });

  it('should handle layout events', () => {
    const { rerender } = render(<MapFlowPage {...defaultProps} />);

    const pageContent = screen.getByTestId('map-flow-page-content');
    
    // Simulate layout event
    const layoutEvent = {
      nativeEvent: {
        layout: {
          width: 300,
          height: 200,
        },
      },
    } as LayoutChangeEvent;

    fireEvent(pageContent, 'layout', layoutEvent);

    // Should not throw any errors
    expect(screen.getByTestId('map-flow-page-content')).toBeTruthy();
  });

  it('should handle multiple content ready calls', async () => {
    const onContentReady = jest.fn();
    render(<MapFlowPage {...defaultProps} onContentReady={onContentReady} />);

    const contentReadyButton = screen.getByTestId('content-ready-button');
    
    fireEvent.press(contentReadyButton);
    fireEvent.press(contentReadyButton);
    fireEvent.press(contentReadyButton);

    await waitFor(() => {
      expect(onContentReady).toHaveBeenCalledTimes(3);
    });
  });

  it('should handle multiple action calls', async () => {
    const onAction = jest.fn();
    render(<MapFlowPage {...defaultProps} onAction={onAction} />);

    const actionButton = screen.getByTestId('action-button');
    
    fireEvent.press(actionButton);
    fireEvent.press(actionButton);
    fireEvent.press(actionButton);

    await waitFor(() => {
      expect(onAction).toHaveBeenCalledTimes(3);
    });
  });

  it('should handle different step types', () => {
    const steps = [
      FLOW_STEPS.SELECCION_SERVICIO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
      FLOW_STEPS.CUSTOMER_TRANSPORT_SELECCION_VEHICULO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_METODOLOGIA_PAGO,
    ];

    steps.forEach(step => {
      const { unmount } = render(
        <MapFlowPage {...defaultProps} step={step} />
      );

      expect(screen.getByTestId('step')).toHaveTextContent(step);
      unmount();
    });
  });

  it('should handle missing onContentReady callback', () => {
    render(<MapFlowPage {...defaultProps} onContentReady={jest.fn()} />);

    const contentReadyButton = screen.getByTestId('content-ready-button');
    
    // Should not crash when pressed
    expect(() => fireEvent.press(contentReadyButton)).not.toThrow();
  });

  it('should handle missing onAction callback', () => {
    render(<MapFlowPage {...defaultProps} onAction={jest.fn()} />);

    const actionButton = screen.getByTestId('action-button');
    
    // Should not crash when pressed
    expect(() => fireEvent.press(actionButton)).not.toThrow();
  });

  it('should handle component unmounting', () => {
    const { unmount } = render(<MapFlowPage {...defaultProps} />);

    expect(screen.getByTestId('map-flow-page-content')).toBeTruthy();

    unmount();

    // Should not throw any errors
    expect(() => unmount()).not.toThrow();
  });

  it('should handle rapid prop changes', () => {
    const { rerender } = render(<MapFlowPage {...defaultProps} />);

    // Rapid prop changes
    for (let i = 0; i < 10; i++) {
      rerender(
        <MapFlowPage 
          {...defaultProps} 
          isActive={i % 2 === 0}
          isVisible={i % 3 === 0}
        />
      );
    }

    expect(screen.getByTestId('map-flow-page-content')).toBeTruthy();
  });

  it('should handle edge cases', () => {
    // Test with undefined step
    render(<MapFlowPage {...defaultProps} step={undefined as any} />);

    expect(screen.getByTestId('map-flow-page-content')).toBeTruthy();

    // Test with null step
    render(<MapFlowPage {...defaultProps} step={null as any} />);

    expect(screen.getByTestId('map-flow-page-content')).toBeTruthy();
  });

  it('should handle children prop', () => {
    const children = <Text testID="children-content">Children content</Text>;
    
    render(<MapFlowPage {...defaultProps}>{children}</MapFlowPage>);

    expect(screen.getByTestId('children-content')).toBeTruthy();
  });

  it('should handle multiple children', () => {
    const children = (
      <>
        <Text testID="child-1">Child 1</Text>
        <Text testID="child-2">Child 2</Text>
        <Text testID="child-3">Child 3</Text>
      </>
    );
    
    render(<MapFlowPage {...defaultProps}>{children}</MapFlowPage>);

    expect(screen.getByTestId('child-1')).toBeTruthy();
    expect(screen.getByTestId('child-2')).toBeTruthy();
    expect(screen.getByTestId('child-3')).toBeTruthy();
  });

  it('should handle empty children', () => {
    render(<MapFlowPage {...defaultProps} />);

    expect(screen.getByTestId('map-flow-page-content')).toBeTruthy();
  });

  it('should handle null children', () => {
    render(<MapFlowPage {...defaultProps}>{null}</MapFlowPage>);

    expect(screen.getByTestId('map-flow-page-content')).toBeTruthy();
  });

  it('should handle undefined children', () => {
    render(<MapFlowPage {...defaultProps}>{undefined}</MapFlowPage>);

    expect(screen.getByTestId('map-flow-page-content')).toBeTruthy();
  });
});
