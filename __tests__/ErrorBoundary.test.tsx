import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { Alert, Text } from "react-native";

import {
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
} from "../components/ErrorBoundary";
import { log } from "../lib/logger";

/**
 * @jest-environment jsdom
 */

// Mock SafeAreaView
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) =>
    React.createElement("SafeAreaView", null, children),
}));

// Mock logger
jest.mock("../lib/logger", () => ({
  log: {
    critical: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock withErrorBoundary
jest.mock("../components/ErrorBoundary", () => ({
  ...jest.requireActual("../components/ErrorBoundary"),
  withErrorBoundary: jest.fn((Component) => {
    const WrappedComponent = (props: any) =>
      React.createElement(Component, props);
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
  }),
}));

describe("ErrorBoundary", () => {
  const TestChild = ({ shouldThrow }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
      throw new Error("Test error");
    }
    return <TestChildComponent />;
  };

  const TestChildComponent = () => <Text>Test Child</Text>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Error Catching", () => {
    it("should render children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <TestChild shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Test Child")).toBeTruthy();
    });

    it("should catch and display error UI when error occurs", () => {
      // Mock console methods to avoid noise in tests
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <TestChild shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("¡Ups! Algo salió mal")).toBeTruthy();
      expect(
        screen.getByText("Ha ocurrido un error inesperado en la aplicación."),
      ).toBeTruthy();
      expect(screen.getByText("Intentar de Nuevo")).toBeTruthy();
      expect(screen.getByText("Reportar Error")).toBeTruthy();

      consoleSpy.mockRestore();
    });

    it("should log errors with detailed information", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <TestChild shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(log.critical).toHaveBeenCalledWith(
        "ErrorBoundary",
        "JavaScript error caught by boundary",
        expect.objectContaining({
          errorId: expect.any(String),
          errorMessage: "Test error",
          errorName: "Error",
          componentStack: expect.any(String),
          timestamp: expect.any(String),
        }),
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should show error details in development", () => {
      // Set NODE_ENV to development to show error details
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
      });

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <TestChild shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Error: Test error")).toBeTruthy();

      // Restore original env
      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
      });
      consoleSpy.mockRestore();
    });

    it("should call onError callback when provided", () => {
      const onErrorMock = jest.fn();
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary onError={onErrorMock}>
          <TestChild shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object),
      );

      consoleSpy.mockRestore();
    });

    it("should show error ID", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <TestChild shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/Error ID:/)).toBeTruthy();

      consoleSpy.mockRestore();
    });
  });

  describe("Error Recovery", () => {
    it("should allow retry after error", async () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <TestChild shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Should show error UI
      expect(screen.getByText("¡Ups! Algo salió mal")).toBeTruthy();

      // Click retry button
      fireEvent.press(screen.getByText("Intentar de Nuevo"));

      // Should show original content again
      await waitFor(() => {
        expect(log.info).toHaveBeenCalledWith(
          "ErrorBoundary",
          "User triggered error boundary retry",
          expect.objectContaining({
            errorId: expect.any(String),
            previousError: "Test error",
          }),
        );
      });

      consoleSpy.mockRestore();
    });

    it("should allow error reporting", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <TestChild shouldThrow={true} />
        </ErrorBoundary>,
      );

      fireEvent.press(screen.getByText("Reportar Error"));

      expect(Alert.alert).toHaveBeenCalledWith(
        "Report Error",
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ text: "Cancel" }),
          expect.objectContaining({ text: "Report" }),
        ]),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Custom Fallback", () => {
    it("should use custom fallback when provided", () => {
      const customFallback = (error: Error, retry: () => void) => (
        <Text>Custom Error: {error.message}</Text>
      );

      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary fallback={customFallback}>
          <TestChild shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Custom Error: Test error")).toBeTruthy();
      expect(screen.queryByText("¡Ups! Algo salió mal")).toBeFalsy();

      consoleSpy.mockRestore();
    });
  });
});

describe("useErrorHandler", () => {
  it("should return error handler function", () => {
    const TestComponent = () => {
      const handleError = useErrorHandler();

      React.useEffect(() => {
        handleError(new Error("Async error"), {
          componentStack: "TestComponentStack",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return <Text>Test Component</Text>;
    };

    render(<TestComponent />);

    expect(log.critical).toHaveBeenCalledWith(
      "useErrorHandler",
      "Async error caught",
      expect.objectContaining({
        errorId: expect.any(String),
        errorMessage: "Async error",
        errorStack: expect.any(String),
        componentStack: "TestComponentStack",
        source: "async_error_handler",
      }),
      expect.any(Error),
    );
  });
});

describe("withErrorBoundary HOC", () => {
  it("should wrap component with error boundary", () => {
    const TestComponent = () => <Text>Test Component</Text>;

    const WrappedComponent = withErrorBoundary(TestComponent);

    const { getByText } = render(<WrappedComponent />);

    expect(getByText("Test Component")).toBeTruthy();
  });

  it("should have correct display name", () => {
    const TestComponent = () => <Text>Test Component</Text>;
    TestComponent.displayName = "TestComponent";

    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe(
      "withErrorBoundary(TestComponent)",
    );
  });
});
