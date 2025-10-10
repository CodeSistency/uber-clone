/**
 * Tests para BottomSheetErrorBoundary
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import BottomSheetErrorBoundary from '@/components/unified-flow/BottomSheetErrorBoundary';
import BottomSheetErrorFallback from '@/components/unified-flow/BottomSheetErrorFallback';

// Mock del logger
jest.mock('@/lib/logger', () => ({
  log: {
    bottomSheet: {
      error: jest.fn(),
    },
  },
}));

// Mock de BottomSheetErrorFallback
jest.mock('@/components/unified-flow/BottomSheetErrorFallback', () => {
  return function MockBottomSheetErrorFallback({ error, resetErrorBoundary }: any) {
    return (
      <View testID="error-fallback">
        <Text testID="error-message">{error.message}</Text>
        <Text testID="reset-button" onPress={resetErrorBoundary}>
          Reset
        </Text>
      </View>
    );
  };
});

// Componente que lanza error
const ErrorComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text testID="normal-content">Normal content</Text>;
};

// Componente que lanza error en componentDidMount
class ErrorInMountComponent extends React.Component {
  componentDidMount() {
    throw new Error('Error in componentDidMount');
  }

  render() {
    return <Text testID="error-in-mount">Error in mount</Text>;
  }
}

describe('BottomSheetErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <BottomSheetErrorBoundary>
        <Text testID="normal-content">Normal content</Text>
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('normal-content')).toBeTruthy();
    expect(screen.queryByTestId('error-fallback')).toBeNull();
  });

  it('should catch errors and render fallback', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <BottomSheetErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeTruthy();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Test error');
    expect(screen.queryByTestId('normal-content')).toBeNull();

    console.error = originalError;
  });

  it('should catch errors in componentDidMount', () => {
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <BottomSheetErrorBoundary>
        <ErrorInMountComponent />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeTruthy();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Error in componentDidMount');

    console.error = originalError;
  });

  it('should handle resetErrorBoundary', () => {
    const originalError = console.error;
    console.error = jest.fn();

    const { rerender } = render(
      <BottomSheetErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeTruthy();

    // Reset the error boundary
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.press(resetButton);

    // Re-render with no error
    rerender(
      <BottomSheetErrorBoundary>
        <ErrorComponent shouldThrow={false} />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('normal-content')).toBeTruthy();
    expect(screen.queryByTestId('error-fallback')).toBeNull();

    console.error = originalError;
  });

  it('should call onReset when provided', () => {
    const onReset = jest.fn();
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <BottomSheetErrorBoundary onReset={onReset}>
        <ErrorComponent shouldThrow={true} />
      </BottomSheetErrorBoundary>
    );

    const resetButton = screen.getByTestId('reset-button');
    fireEvent.press(resetButton);

    expect(onReset).toHaveBeenCalled();

    console.error = originalError;
  });

  it('should handle multiple errors', () => {
    const originalError = console.error;
    console.error = jest.fn();

    const { rerender } = render(
      <BottomSheetErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeTruthy();

    // Reset and throw another error
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.press(resetButton);

    rerender(
      <BottomSheetErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeTruthy();

    console.error = originalError;
  });

  it('should handle nested error boundaries', () => {
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <BottomSheetErrorBoundary>
        <BottomSheetErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </BottomSheetErrorBoundary>
      </BottomSheetErrorBoundary>
    );

    // Should catch the error in the inner boundary
    expect(screen.getByTestId('error-fallback')).toBeTruthy();

    console.error = originalError;
  });

  it('should handle errors in different lifecycle methods', () => {
    const originalError = console.error;
    console.error = jest.fn();

    // Test error in render
    render(
      <BottomSheetErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeTruthy();

    console.error = originalError;
  });

  it('should handle null error', () => {
    const originalError = console.error;
    console.error = jest.fn();

    // Mock getDerivedStateFromError to return null error
    const originalGetDerivedStateFromError = BottomSheetErrorBoundary.getDerivedStateFromError;
    BottomSheetErrorBoundary.getDerivedStateFromError = jest.fn(() => ({
      hasError: true,
      error: null,
    }));

    render(
      <BottomSheetErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeTruthy();

    // Restore original method
    BottomSheetErrorBoundary.getDerivedStateFromError = originalGetDerivedStateFromError;
    console.error = originalError;
  });

  it('should handle undefined error', () => {
    const originalError = console.error;
    console.error = jest.fn();

    // Mock getDerivedStateFromError to return undefined error
    const originalGetDerivedStateFromError = BottomSheetErrorBoundary.getDerivedStateFromError;
    BottomSheetErrorBoundary.getDerivedStateFromError = jest.fn(() => ({
      hasError: true,
      error: undefined,
    }));

    render(
      <BottomSheetErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeTruthy();

    // Restore original method
    BottomSheetErrorBoundary.getDerivedStateFromError = originalGetDerivedStateFromError;
    console.error = originalError;
  });

  it('should handle component unmounting', () => {
    const originalError = console.error;
    console.error = jest.fn();

    const { unmount } = render(
      <BottomSheetErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeTruthy();

    unmount();

    // Should not throw any errors
    expect(() => unmount()).not.toThrow();

    console.error = originalError;
  });

  it('should handle rapid error and reset cycles', () => {
    const originalError = console.error;
    console.error = jest.fn();

    const { rerender } = render(
      <BottomSheetErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeTruthy();

    // Reset
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.press(resetButton);

    // Re-render with error again
    rerender(
      <BottomSheetErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </BottomSheetErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeTruthy();

    console.error = originalError;
  });
});
