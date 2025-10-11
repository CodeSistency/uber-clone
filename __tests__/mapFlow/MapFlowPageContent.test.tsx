/**
 * Tests para MapFlowPageContent
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { View, Text, ActivityIndicator } from 'react-native';
import MapFlowPageContent from '@/components/mapFlow/MapFlowPageContent';
import { FLOW_STEPS } from '@/lib/unified-flow/constants';

// Mock del store
jest.mock('@/store', () => ({
  useMapFlowStore: jest.fn(() => ({
    role: 'customer',
  })),
}));

// Mock del registry
jest.mock('@/components/unified-flow/registry', () => ({
  componentMapper: {
    createMapper: jest.fn(),
  },
}));

// Mock del logger
jest.mock('@/lib/logger', () => ({
  log: {
    pagerView: {
      debug: jest.fn(),
      error: jest.fn(),
    },
  },
}));

// Mock components
const MockServiceSelection = () => <Text testID="service-selection">Service Selection</Text>;
const MockTransportDefinition = () => <Text testID="transport-definition">Transport Definition</Text>;
const MockDefaultStep = () => <Text testID="default-step">Default Step</Text>;

describe('MapFlowPageContent', () => {
  const defaultProps = {
    step: FLOW_STEPS.SELECCION_SERVICIO,
    isActive: true,
    isReady: false,
    onContentReady: jest.fn(),
    onAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    render(<MapFlowPageContent {...defaultProps} />);

    expect(screen.getByTestId('service-selection')).toBeTruthy();
  });

  it('should show loading state initially', () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    render(<MapFlowPageContent {...defaultProps} />);

    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    expect(screen.getByText('Loading SELECCION_SERVICIO...')).toBeTruthy();
  });

  it('should call onContentReady when component is loaded', async () => {
    const onContentReady = jest.fn();
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    render(<MapFlowPageContent {...defaultProps} onContentReady={onContentReady} />);

    await waitFor(() => {
      expect(onContentReady).toHaveBeenCalled();
    });
  });

  it('should render the correct component for the step', () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    render(<MapFlowPageContent {...defaultProps} />);

    expect(screen.getByTestId('service-selection')).toBeTruthy();
  });

  it('should handle different steps', () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockTransportDefinition />);

    render(
      <MapFlowPageContent 
        {...defaultProps} 
        step={FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE} 
      />
    );

    expect(screen.getByTestId('transport-definition')).toBeTruthy();
  });

  it('should handle mapper creation error', async () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockImplementation(() => {
      throw new Error('Mapper creation failed');
    });

    render(<MapFlowPageContent {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Error: Error loading step: Mapper creation failed')).toBeTruthy();
    });
  });

  it('should handle component not found error', async () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => null);

    render(<MapFlowPageContent {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Error: No component found for this step.')).toBeTruthy();
    });
  });

  it('should handle different roles', () => {
    const { useMapFlowStore } = require('@/store');
    useMapFlowStore.mockReturnValue({ role: 'driver' });

    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    render(<MapFlowPageContent {...defaultProps} />);

    expect(componentMapper.createMapper).toHaveBeenCalledWith({
      role: 'driver',
      fallbackToDefault: true,
      showDebugInfo: false,
    });
  });

  it('should handle isActive prop', () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    render(<MapFlowPageContent {...defaultProps} isActive={false} />);

    expect(screen.getByTestId('service-selection')).toBeTruthy();
  });

  it('should handle isReady prop', () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    render(<MapFlowPageContent {...defaultProps} isReady={true} />);

    expect(screen.getByTestId('service-selection')).toBeTruthy();
  });

  it('should handle onAction callback', () => {
    const onAction = jest.fn();
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    render(<MapFlowPageContent {...defaultProps} onAction={onAction} />);

    expect(screen.getByTestId('service-selection')).toBeTruthy();
  });

  it('should handle development mode', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    render(<MapFlowPageContent {...defaultProps} />);

    expect(componentMapper.createMapper).toHaveBeenCalledWith({
      role: 'customer',
      fallbackToDefault: true,
      showDebugInfo: true,
    });

    (global as any).__DEV__ = originalDev;
  });

  it('should handle production mode', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;

    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    render(<MapFlowPageContent {...defaultProps} />);

    expect(componentMapper.createMapper).toHaveBeenCalledWith({
      role: 'customer',
      fallbackToDefault: true,
      showDebugInfo: false,
    });

    (global as any).__DEV__ = originalDev;
  });

  it('should handle step changes', () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    const { rerender } = render(<MapFlowPageContent {...defaultProps} />);

    expect(screen.getByTestId('service-selection')).toBeTruthy();

    // Change step
    componentMapper.createMapper.mockReturnValue(() => <MockTransportDefinition />);
    rerender(
      <MapFlowPageContent 
        {...defaultProps} 
        step={FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE} 
      />
    );

    expect(screen.getByTestId('transport-definition')).toBeTruthy();
  });

  it('should handle role changes', () => {
    const { useMapFlowStore } = require('@/store');
    const { componentMapper } = require('@/components/unified-flow/registry');
    
    useMapFlowStore.mockReturnValue({ role: 'customer' });
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    const { rerender } = render(<MapFlowPageContent {...defaultProps} />);

    expect(componentMapper.createMapper).toHaveBeenCalledWith({
      role: 'customer',
      fallbackToDefault: true,
      showDebugInfo: false,
    });

    // Change role
    useMapFlowStore.mockReturnValue({ role: 'driver' });
    rerender(<MapFlowPageContent {...defaultProps} />);

    expect(componentMapper.createMapper).toHaveBeenCalledWith({
      role: 'driver',
      fallbackToDefault: true,
      showDebugInfo: false,
    });
  });

  it('should handle multiple re-renders', () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    const { rerender } = render(<MapFlowPageContent {...defaultProps} />);

    expect(screen.getByTestId('service-selection')).toBeTruthy();

    // Multiple re-renders
    rerender(<MapFlowPageContent {...defaultProps} />);
    rerender(<MapFlowPageContent {...defaultProps} />);
    rerender(<MapFlowPageContent {...defaultProps} />);

    expect(screen.getByTestId('service-selection')).toBeTruthy();
  });

  it('should handle edge cases', () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    // Test with undefined step
    render(<MapFlowPageContent {...defaultProps} step={undefined as any} />);

    expect(screen.getByTestId('service-selection')).toBeTruthy();
  });

  it('should handle component unmounting', () => {
    const { componentMapper } = require('@/components/unified-flow/registry');
    componentMapper.createMapper.mockReturnValue(() => <MockServiceSelection />);

    const { unmount } = render(<MapFlowPageContent {...defaultProps} />);

    expect(screen.getByTestId('service-selection')).toBeTruthy();

    unmount();

    // Should not throw any errors
    expect(() => unmount()).not.toThrow();
  });
});
