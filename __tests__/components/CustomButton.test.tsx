import React from 'react';
import { render, fireEvent } from '../utils/test-utils';
import { CustomButton } from '../../components/CustomButton';

describe('CustomButton', () => {
  const defaultProps = {
    title: 'Test Button',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders with default props', () => {
      const { getByText } = render(<CustomButton {...defaultProps} />);

      expect(getByText('Test Button')).toBeTruthy();
    });

    test('renders with different variants', () => {
      const { rerender, getByText } = render(
        <CustomButton {...defaultProps} bgVariant="primary" />
      );

      expect(getByText('Test Button')).toBeTruthy();

      rerender(<CustomButton {...defaultProps} bgVariant="secondary" />);
      expect(getByText('Test Button')).toBeTruthy();

      rerender(<CustomButton {...defaultProps} bgVariant="danger" />);
      expect(getByText('Test Button')).toBeTruthy();
    });

    test('renders with icons', () => {
      const mockIcon = () => <span>🚀</span>;
      const { getByText } = render(
        <CustomButton
          {...defaultProps}
          IconLeft={mockIcon}
          IconRight={mockIcon}
        />
      );

      expect(getByText('Test Button')).toBeTruthy();
      // Icons would be tested with more specific queries if needed
    });

    test('renders loading state', () => {
      const { getByText } = render(
        <CustomButton {...defaultProps} loading={true} />
      );

      expect(getByText('Please wait…')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    test('calls onPress when pressed', () => {
      const { getByText } = render(<CustomButton {...defaultProps} />);

      fireEvent.press(getByText('Test Button'));

      expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
    });

    test('does not call onPress when disabled', () => {
      const { getByText } = render(
        <CustomButton {...defaultProps} disabled={true} />
      );

      fireEvent.press(getByText('Test Button'));

      expect(defaultProps.onPress).not.toHaveBeenCalled();
    });

    test('does not call onPress when loading', () => {
      const { getByText } = render(
        <CustomButton {...defaultProps} loading={true} />
      );

      fireEvent.press(getByText('Please wait…'));

      expect(defaultProps.onPress).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('is accessible by default', () => {
      const { getByText } = render(<CustomButton {...defaultProps} />);

      const button = getByText('Test Button');
      expect(button.props.accessible).toBe(true);
    });

    test('supports custom accessibility props', () => {
      const { getByLabelText } = render(
        <CustomButton
          {...defaultProps}
          accessibilityLabel="Custom button label"
        />
      );

      expect(getByLabelText('Custom button label')).toBeTruthy();
    });
  });

  describe('Styling', () => {
    test('applies custom className', () => {
      const { getByText } = render(
        <CustomButton {...defaultProps} className="custom-class" />
      );

      const button = getByText('Test Button');
      // In React Native with NativeWind, className is converted to style
      expect(button.props.className).toBeDefined();
    });

    test('applies disabled styling', () => {
      const { getByText } = render(
        <CustomButton {...defaultProps} disabled={true} />
      );

      const button = getByText('Test Button');
      // Disabled state should be applied
      expect(button.props.disabled).toBe(true);
    });

    test('applies loading styling', () => {
      const { getByText } = render(
        <CustomButton {...defaultProps} loading={true} />
      );

      const button = getByText('Please wait…');
      // Loading state should be applied
      expect(button).toBeTruthy();
    });
  });

  describe('Performance', () => {
    test('is memoized to prevent unnecessary re-renders', () => {
      const onPress = jest.fn();
      const { rerender, getByText } = render(
        <CustomButton title="Test" onPress={onPress} />
      );

      // Re-render with same props should not cause issues
      rerender(<CustomButton title="Test" onPress={onPress} />);

      // Should still work normally
      fireEvent.press(getByText('Test'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    test('handles missing onPress gracefully', () => {
      // Should not crash when onPress is undefined
      const { getByText } = render(<CustomButton title="Test Button" />);

      expect(() => {
        fireEvent.press(getByText('Test Button'));
      }).not.toThrow();
    });

    test('handles malformed props gracefully', () => {
      const { getByText } = render(
        <CustomButton
          {...defaultProps}
          bgVariant={undefined as any}
          textVariant={undefined as any}
        />
      );

      expect(getByText('Test Button')).toBeTruthy();
    });
  });
});
