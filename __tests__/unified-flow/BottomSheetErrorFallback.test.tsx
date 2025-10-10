/**
 * Tests para BottomSheetErrorFallback
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import BottomSheetErrorFallback from '@/components/unified-flow/BottomSheetErrorFallback';

describe('BottomSheetErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockResetErrorBoundary = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <BottomSheetErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Oops! Something went wrong.')).toBeTruthy();
    expect(screen.getByText('Test error message')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  it('should display the error message', () => {
    const customError = new Error('Custom error message');
    
    render(
      <BottomSheetErrorFallback
        error={customError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Custom error message')).toBeTruthy();
  });

  it('should call resetErrorBoundary when button is pressed', () => {
    render(
      <BottomSheetErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    const resetButton = screen.getByText('Try again');
    fireEvent.press(resetButton);

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple button presses', () => {
    render(
      <BottomSheetErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    const resetButton = screen.getByText('Try again');
    
    fireEvent.press(resetButton);
    fireEvent.press(resetButton);
    fireEvent.press(resetButton);

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(3);
  });

  it('should handle different error types', () => {
    const errors = [
      new Error('Simple error'),
      new Error('Error with special characters: !@#$%^&*()'),
      new Error('Error with newlines:\nLine 1\nLine 2'),
      new Error('Error with unicode: 🚀🔥💯'),
      new Error(''),
    ];

    errors.forEach((error, index) => {
      const { unmount } = render(
        <BottomSheetErrorFallback
          error={error}
          resetErrorBoundary={mockResetErrorBoundary}
        />
      );

      expect(screen.getByText(error.message || '')).toBeTruthy();
      unmount();
    });
  });

  it('should handle undefined error message', () => {
    const errorWithUndefinedMessage = new Error();
    errorWithUndefinedMessage.message = undefined as any;

    render(
      <BottomSheetErrorFallback
        error={errorWithUndefinedMessage}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('undefined')).toBeTruthy();
  });

  it('should handle null error message', () => {
    const errorWithNullMessage = new Error();
    errorWithNullMessage.message = null as any;

    render(
      <BottomSheetErrorFallback
        error={errorWithNullMessage}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('null')).toBeTruthy();
  });

  it('should handle very long error messages', () => {
    const longErrorMessage = 'A'.repeat(1000);
    const longError = new Error(longErrorMessage);

    render(
      <BottomSheetErrorFallback
        error={longError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText(longErrorMessage)).toBeTruthy();
  });

  it('should handle error with stack trace', () => {
    const errorWithStack = new Error('Error with stack');
    errorWithStack.stack = 'Error: Error with stack\n    at test.js:1:1\n    at test.js:2:2';

    render(
      <BottomSheetErrorFallback
        error={errorWithStack}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Error with stack')).toBeTruthy();
  });

  it('should handle missing resetErrorBoundary prop', () => {
    render(
      <BottomSheetErrorFallback
        error={mockError}
        resetErrorBoundary={undefined as any}
      />
    );

    const resetButton = screen.getByText('Try again');
    
    // Should not crash when pressed
    expect(() => fireEvent.press(resetButton)).not.toThrow();
  });

  it('should handle null resetErrorBoundary prop', () => {
    render(
      <BottomSheetErrorFallback
        error={mockError}
        resetErrorBoundary={null as any}
      />
    );

    const resetButton = screen.getByText('Try again');
    
    // Should not crash when pressed
    expect(() => fireEvent.press(resetButton)).not.toThrow();
  });

  it('should handle component unmounting', () => {
    const { unmount } = render(
      <BottomSheetErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Oops! Something went wrong.')).toBeTruthy();

    unmount();

    // Should not throw any errors
    expect(() => unmount()).not.toThrow();
  });

  it('should handle rapid button presses', () => {
    render(
      <BottomSheetErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    const resetButton = screen.getByText('Try again');
    
    // Rapid button presses
    for (let i = 0; i < 10; i++) {
      fireEvent.press(resetButton);
    }

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(10);
  });

  it('should handle different error objects', () => {
    const errorObjects = [
      new Error('Standard Error'),
      new TypeError('Type Error'),
      new ReferenceError('Reference Error'),
      new SyntaxError('Syntax Error'),
      new RangeError('Range Error'),
    ];

    errorObjects.forEach((error, index) => {
      const { unmount } = render(
        <BottomSheetErrorFallback
          error={error}
          resetErrorBoundary={mockResetErrorBoundary}
        />
      );

      expect(screen.getByText(error.message)).toBeTruthy();
      unmount();
    });
  });

  it('should handle error with custom properties', () => {
    const customError = new Error('Custom error');
    (customError as any).customProperty = 'custom value';
    (customError as any).code = 'CUSTOM_CODE';

    render(
      <BottomSheetErrorFallback
        error={customError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Custom error')).toBeTruthy();
  });

  it('should handle error with circular references', () => {
    const circularError = new Error('Circular error');
    (circularError as any).self = circularError;

    render(
      <BottomSheetErrorFallback
        error={circularError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Circular error')).toBeTruthy();
  });

  it('should handle error with functions', () => {
    const errorWithFunction = new Error('Error with function');
    (errorWithFunction as any).callback = () => {};

    render(
      <BottomSheetErrorFallback
        error={errorWithFunction}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Error with function')).toBeTruthy();
  });

  it('should handle error with dates', () => {
    const errorWithDate = new Error('Error with date');
    (errorWithDate as any).timestamp = new Date();

    render(
      <BottomSheetErrorFallback
        error={errorWithDate}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Error with date')).toBeTruthy();
  });

  it('should handle error with arrays', () => {
    const errorWithArray = new Error('Error with array');
    (errorWithArray as any).items = [1, 2, 3, 'test'];

    render(
      <BottomSheetErrorFallback
        error={errorWithArray}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Error with array')).toBeTruthy();
  });

  it('should handle error with objects', () => {
    const errorWithObject = new Error('Error with object');
    (errorWithObject as any).metadata = { key: 'value', nested: { deep: true } };

    render(
      <BottomSheetErrorFallback
        error={errorWithObject}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Error with object')).toBeTruthy();
  });
});
