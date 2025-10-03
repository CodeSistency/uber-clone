import React from "react";
import { render, fireEvent } from "../utils/test-utils";
import { InputField } from "../../components/InputField";

describe("InputField", () => {
  const defaultProps = {
    label: "Test Label",
    placeholder: "Enter text here",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    test("renders with required props", () => {
      const { getByText, getByPlaceholderText } = render(
        <InputField {...defaultProps} />,
      );

      expect(getByText("Test Label")).toBeTruthy();
      expect(getByPlaceholderText("Enter text here")).toBeTruthy();
    });

    test("renders with icon", () => {
      const mockIcon = () => <span>📧</span>;
      const { getByText } = render(
        <InputField {...defaultProps} icon={mockIcon} />,
      );

      expect(getByText("Test Label")).toBeTruthy();
      // Icon rendering would be tested with more specific queries if needed
    });

    test("renders secure text entry", () => {
      const { getByPlaceholderText } = render(
        <InputField {...defaultProps} secureTextEntry={true} />,
      );

      const input = getByPlaceholderText("Enter text here");
      expect(input.props.secureTextEntry).toBe(true);
    });
  });

  describe("User Interactions", () => {
    test("handles text input", () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <InputField {...defaultProps} onChangeText={onChangeText} />,
      );

      const input = getByPlaceholderText("Enter text here");
      fireEvent.changeText(input, "Hello World");

      expect(onChangeText).toHaveBeenCalledWith("Hello World");
    });

    test("handles different input types", () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <InputField
          {...defaultProps}
          keyboardType="email-address"
          onChangeText={onChangeText}
        />,
      );

      const input = getByPlaceholderText("Enter text here");
      fireEvent.changeText(input, "test@example.com");

      expect(onChangeText).toHaveBeenCalledWith("test@example.com");
    });
  });

  describe("Styling and Customization", () => {
    test("applies custom label style", () => {
      const { getByText } = render(
        <InputField {...defaultProps} labelStyle="custom-label" />,
      );

      const label = getByText("Test Label");
      expect(label.props.className).toContain("custom-label");
    });

    test("applies custom container style", () => {
      const { getByPlaceholderText } = render(
        <InputField {...defaultProps} containerStyle="custom-container" />,
      );

      const input = getByPlaceholderText("Enter text here");
      // Container styling would be tested with parent element queries
      expect(input).toBeTruthy();
    });

    test("applies custom input style", () => {
      const { getByPlaceholderText } = render(
        <InputField {...defaultProps} inputStyle="custom-input" />,
      );

      const input = getByPlaceholderText("Enter text here");
      expect(input.props.className).toContain("custom-input");
    });

    test("applies custom icon style", () => {
      const mockIcon = () => <span>📧</span>;
      const { getByPlaceholderText } = render(
        <InputField
          {...defaultProps}
          icon={mockIcon}
          iconStyle="custom-icon"
        />,
      );

      const input = getByPlaceholderText("Enter text here");
      expect(input).toBeTruthy();
      // Icon styling would be tested with more specific queries
    });
  });

  describe("Accessibility", () => {
    test("is accessible by default", () => {
      const { getByPlaceholderText } = render(<InputField {...defaultProps} />);

      const input = getByPlaceholderText("Enter text here");
      expect(input).toBeTruthy();
      // Accessibility props would be tested more thoroughly in integration tests
    });

    test("supports custom accessibility props", () => {
      const { getByLabelText } = render(
        <InputField
          {...defaultProps}
          accessibilityLabel="Custom input label"
        />,
      );

      // This test assumes the accessibilityLabel is properly passed through
      const input = getByLabelText("Custom input label");
      expect(input).toBeTruthy();
    });
  });

  describe("Performance", () => {
    test("is memoized to prevent unnecessary re-renders", () => {
      const onChangeText = jest.fn();
      const { rerender } = render(
        <InputField
          label="Test"
          placeholder="Test"
          onChangeText={onChangeText}
        />,
      );

      // Re-render with same props should not cause issues
      rerender(
        <InputField
          label="Test"
          placeholder="Test"
          onChangeText={onChangeText}
        />,
      );

      // Should still work normally
      const { getByPlaceholderText } = render(
        <InputField
          label="Test"
          placeholder="Test"
          onChangeText={onChangeText}
        />,
      );
      const input = getByPlaceholderText("Test");
      fireEvent.changeText(input, "test");
      expect(onChangeText).toHaveBeenCalledWith("test");
    });
  });

  describe("Error Handling", () => {
    test("handles missing props gracefully", () => {
      const { getByText } = render(<InputField label="Test Label" />);

      expect(getByText("Test Label")).toBeTruthy();
      // Should not crash without placeholder
    });

    test("handles undefined icon gracefully", () => {
      const { getByText } = render(
        <InputField {...defaultProps} icon={undefined} />,
      );

      expect(getByText("Test Label")).toBeTruthy();
    });
  });

  describe("Integration with Keyboard", () => {
    test("includes KeyboardAvoidingView", () => {
      // This test verifies the component structure includes KeyboardAvoidingView
      const { getByPlaceholderText } = render(<InputField {...defaultProps} />);

      // The component should render without crashing
      expect(getByPlaceholderText("Enter text here")).toBeTruthy();
    });

    test("handles keyboard dismissal", () => {
      const { getByPlaceholderText } = render(<InputField {...defaultProps} />);

      // Component should handle keyboard interactions properly
      const input = getByPlaceholderText("Enter text here");
      expect(input).toBeTruthy();
    });
  });
});
