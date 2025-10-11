import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { log } from "@/lib/logger";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId =
      this.state.errorId ||
      `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log the error with detailed information
    log.error(
      "JavaScript error caught by boundary",
      {
        component: "ErrorBoundary",
        action: "error_caught",
        data: {
        errorId,
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }
    });

    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Call optional onError callback
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        log.error(
          "Error in onError callback",
          {
            component: "ErrorBoundary",
            action: "callback_error",
            data: {
            errorId,
            callbackError:
              callbackError instanceof Error
                ? callbackError.message
                : String(callbackError),
          }
        });
      }
    }

    // Show alert in development
    if (__DEV__) {
      Alert.alert(
        "Error Boundary Triggered",
        `Error ID: ${errorId}\n\n${error.message}`,
        [
          { text: "OK" },
          {
            text: "View Details",
            onPress: () => {
              Alert.alert(
                "Error Details",
                `Name: ${error.name}\nMessage: ${error.message}\n\nComponent Stack:\n${errorInfo.componentStack}`,
                [{ text: "Close" }],
              );
            },
          },
        ],
      );
    }
  }

  handleRetry = () => {
    log.info("User triggered error boundary retry", {
      component: "ErrorBoundary",
      action: "retry_triggered",
      data: {
        errorId: this.state.errorId,
        previousError: this.state.error?.message,
      }
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    });
  };

  handleReportError = () => {
    const { error, errorId } = this.state;

    Alert.alert(
      "Report Error",
      "This will help us fix the issue. Include any steps that led to this error.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          onPress: () => {
            log.info("User reported error", {
              component: "ErrorBoundary",
              action: "error_reported",
              data: {
                errorId,
                errorMessage: error?.message,
                userAction: "reported_error",
              }
            });

            Alert.alert(
              "Thank You",
              "Error reported successfully. Our team will investigate this issue.",
              [{ text: "OK" }],
            );
          },
        },
      ],
    );
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleRetry);
      }

      // Default error UI
      return (
        <SafeAreaView className="flex-1 bg-red-50">
          <View className="flex-1 p-6 justify-center items-center">
            <View className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm">
              <Text className="text-2xl font-bold text-red-600 mb-4 text-center">
                ¡Ups! Algo salió mal
              </Text>

              <Text className="text-gray-600 mb-4 text-center">
                Ha ocurrido un error inesperado en la aplicación.
              </Text>

              {__DEV__ && (
                <ScrollView className="bg-gray-100 p-3 rounded mb-4 max-h-32">
                  <Text className="text-xs font-mono text-red-600">
                    {this.state.error?.name}: {this.state.error?.message}
                  </Text>
                  {this.state.errorInfo?.componentStack && (
                    <Text className="text-xs font-mono text-gray-600 mt-2">
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </ScrollView>
              )}

              <View className="space-y-3">
                <TouchableOpacity
                  onPress={this.handleRetry}
                  className="bg-blue-500 py-3 px-6 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">
                    Intentar de Nuevo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={this.handleReportError}
                  className="bg-gray-500 py-3 px-6 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">
                    Reportar Error
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-xs text-gray-400 text-center mt-4">
                Error ID: {this.state.errorId}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to catch async errors
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    const errorId = `async_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    log.error(
      "Async error caught",
      {
        component: "useErrorHandler",
        action: "async_error_caught",
        data: {
        errorId,
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo?.componentStack,
        source: "async_error_handler",
      }
    });

    // In development, show alert
    if (__DEV__) {
      Alert.alert("Async Error", `Error ID: ${errorId}\n\n${error.message}`, [
        { text: "OK" },
      ]);
    }
  };
};

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, retry: () => void) => ReactNode,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;
