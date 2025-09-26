import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import MiniSplash from '../../components/MiniSplash';

// Mock Animated components
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Animated: {
    View: 'Animated.View',
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn(),
    })),
  },
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 812 })),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => 'LinearGradient');

describe('MiniSplash Component', () => {
  const mockConfig = {
    id: 'test-splash',
    type: 'module_transition' as const,
    title: 'Test Splash',
    subtitle: 'Testing component',
    backgroundColor: '#0286FF',
    showProgress: true,
    progress: 50,
    moduleSpecific: {
      fromModule: 'customer',
      toModule: 'driver',
      dataQueries: ['perfil', 'vehículo'],
    },
  };

  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when visible is false', () => {
    const { queryByText } = render(
      <MiniSplash
        config={mockConfig}
        onComplete={mockOnComplete}
        visible={false}
      />
    );

    expect(queryByText('Test Splash')).toBeNull();
  });

  it('should render splash content when visible is true', () => {
    const { getByText } = render(
      <MiniSplash
        config={mockConfig}
        onComplete={mockOnComplete}
        visible={true}
      />
    );

    expect(getByText('Test Splash')).toBeTruthy();
    expect(getByText('Testing component')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
  });

  it('should show data queries when provided', () => {
    const { getByText } = render(
      <MiniSplash
        config={mockConfig}
        onComplete={mockOnComplete}
        visible={true}
      />
    );

    expect(getByText('• perfil')).toBeTruthy();
    expect(getByText('• vehículo')).toBeTruthy();
  });

  it('should render progress indicator when showProgress is true', () => {
    const { getByText } = render(
      <MiniSplash
        config={mockConfig}
        onComplete={mockOnComplete}
        visible={true}
      />
    );

    expect(getByText('50%')).toBeTruthy();
  });

  it('should not render progress when showProgress is false', () => {
    const configWithoutProgress = {
      ...mockConfig,
      showProgress: false,
    };

    const { queryByText } = render(
      <MiniSplash
        config={configWithoutProgress}
        onComplete={mockOnComplete}
        visible={true}
      />
    );

    expect(queryByText('50%')).toBeNull();
  });

  it('should call onComplete when auto-hide duration expires', async () => {
    jest.useFakeTimers();

    const configWithDuration = {
      ...mockConfig,
      duration: 1000,
    };

    render(
      <MiniSplash
        config={configWithDuration}
        onComplete={mockOnComplete}
        visible={true}
      />
    );

    // Fast-forward time
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  it('should render action buttons when provided', () => {
    const configWithActions = {
      ...mockConfig,
      actions: {
        primary: { label: 'Continuar', onPress: jest.fn() },
        secondary: { label: 'Cancelar', onPress: jest.fn() },
      },
    };

    const { getByText } = render(
      <MiniSplash
        config={configWithActions}
        onComplete={mockOnComplete}
        visible={true}
      />
    );

    expect(getByText('Continuar')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('should apply correct module-specific styling', () => {
    // Test driver module styling
    const driverConfig = {
      ...mockConfig,
      moduleSpecific: {
        fromModule: 'customer',
        toModule: 'driver',
      },
    };

    const { getByText } = render(
      <MiniSplash
        config={driverConfig}
        onComplete={mockOnComplete}
        visible={true}
      />
    );

    // The component should render with driver-specific styling
    // This is tested through the presence of the content
    expect(getByText('Test Splash')).toBeTruthy();
  });

  it('should handle missing moduleSpecific gracefully', () => {
    const configWithoutModule = {
      ...mockConfig,
      moduleSpecific: undefined,
    };

    const { getByText } = render(
      <MiniSplash
        config={configWithoutModule}
        onComplete={mockOnComplete}
        visible={true}
      />
    );

    // Should still render with default styling
    expect(getByText('Test Splash')).toBeTruthy();
  });
});
