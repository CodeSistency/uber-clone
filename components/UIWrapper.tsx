import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { useColorScheme } from "react-native";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";

import { useUIStore } from "@/store";

interface UIWrapperProps {
  children: React.ReactNode;
  showGlobalLoading?: boolean;
}

const UIEventToast: React.FC<{
  event: any;
  onDismiss: (id: string) => void;
}> = ({ event, onDismiss }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide if specified
    if (event.autoHide && event.duration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, event.duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(event.id);
    });
  };

  const getBackgroundColor = () => {
    switch (event.type) {
      case "error":
        return "bg-red-500";
      case "success":
        return "bg-green-500";
      case "info":
        return "bg-blue-500";
      case "loading":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getIcon = () => {
    switch (event.type) {
      case "error":
        return "❌";
      case "success":
        return "✅";
      case "info":
        return "ℹ️";
      case "loading":
        return "⏳";
      default:
        return "📢";
    }
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className={`mx-4 mb-2 p-4 rounded-lg shadow-lg ${getBackgroundColor()}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start flex-1">
          <Text className="text-xl mr-3">{getIcon()}</Text>
          <View className="flex-1">
            <Text className="text-white font-JakartaBold text-base mb-1">
              {event.title}
            </Text>
            <Text className="text-white font-JakartaMedium text-sm opacity-90">
              {event.message}
            </Text>
          </View>
        </View>

        {!event.autoHide && (
          <TouchableOpacity onPress={handleDismiss} className="ml-3 p-1">
            <Text className="text-white text-lg font-bold">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {event.action && (
        <TouchableOpacity
          onPress={() => {
            event.action.onPress();
            handleDismiss();
          }}
          className="mt-3 bg-white bg-opacity-20 px-4 py-2 rounded-md self-start"
        >
          <Text className="text-white font-JakartaMedium text-sm">
            {event.action.label}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// Loading States Components
const LoadingSpinner: React.FC<{
  size?: "sm" | "md" | "lg";
  color?: string;
}> = ({ size = "md", color = "#0286FF" }) => {
  const spinnerSize =
    size === "sm" ? "small" : size === "lg" ? "large" : "small";
  return <ActivityIndicator size={spinnerSize} color={color} />;
};

const LoadingDots: React.FC<{ size?: "sm" | "md" | "lg"; color?: string }> = ({
  size = "md",
  color = "#0286FF",
}) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const textSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";

  return (
    <Text className={`${textSize} font-JakartaMedium`} style={{ color }}>
      Loading{dots}
    </Text>
  );
};

const LoadingSkeleton: React.FC<{
  width?: number | string;
  height?: number;
  className?: string;
}> = ({ width = "100%", height = 20, className = "" }) => {
  const [opacity] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      className={`bg-gray-300 rounded ${className}`}
      style={{
        width: width as any,
        height,
        opacity,
      }}
    />
  );
};

// Progress Indicators
const LinearProgress: React.FC<{
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showPercentage?: boolean;
  label?: string;
}> = ({
  value,
  max = 100,
  color = "#0286FF",
  height = 4,
  showPercentage = false,
  label,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-JakartaMedium text-gray-700 mb-2">
          {label}
        </Text>
      )}
      <View className="w-full bg-gray-200 rounded-full" style={{ height }}>
        <View
          className="rounded-full"
          style={{
            width: `${percentage}%`,
            height,
            backgroundColor: color,
          }}
        />
      </View>
      {showPercentage && (
        <Text className="text-xs font-JakartaMedium text-gray-500 mt-1 text-right">
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
};

const CircularProgress: React.FC<{
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: string;
  showPercentage?: boolean;
  label?: string;
}> = ({
  value,
  max = 100,
  size = "md",
  color = "#0286FF",
  showPercentage = false,
  label,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = size === "sm" ? 20 : size === "lg" ? 40 : 30;
  const strokeWidth = size === "sm" ? 3 : size === "lg" ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View className="items-center">
      {label && (
        <Text className="text-sm font-JakartaMedium text-gray-700 mb-2">
          {label}
        </Text>
      )}
      <View className="relative">
        <svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
          />
        </svg>
        {showPercentage && (
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-xs font-JakartaBold" style={{ color }}>
              {Math.round(percentage)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Bottom Sheet Component
const BottomSheet: React.FC<{
  config: any;
  onClose: (id: string) => void;
}> = ({ config, onClose }) => {
  const [translateY] = useState(new Animated.Value(0));
  const [panY] = useState(new Animated.Value(0));

  const getHeight = () => {
    if (typeof config.height === "number") return config.height;
    switch (config.height) {
      case "half":
        return "50%";
      case "full":
        return "100%";
      default:
        return "auto";
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: panY } }],
    { useNativeDriver: false },
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY } = event.nativeEvent;
      if (translationY > 100) {
        // Close sheet
        Animated.timing(translateY, {
          toValue: 1000,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onClose(config.id));
      } else {
        // Snap back
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
      panY.setValue(0);
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={() => config.backdropClose && onClose(config.id)}
    >
      <TouchableOpacity
        className="flex-1 bg-black bg-opacity-50"
        activeOpacity={1}
        onPress={() => config.backdropClose && onClose(config.id)}
      >
        <View className="flex-1" />
      </TouchableOpacity>

      <Animated.View
        className="bg-white rounded-t-3xl"
        style={{
          transform: [{ translateY }],
          maxHeight: getHeight(),
        }}
      >
        {config.draggable && (
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <View className="items-center py-3">
              {config.showHandle && (
                <View className="w-12 h-1 bg-gray-300 rounded-full mb-2" />
              )}
            </View>
          </PanGestureHandler>
        )}

        <View className="px-6 pb-6">
          {config.title && (
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-JakartaBold text-gray-800">
                {config.title}
              </Text>
              {config.showCloseButton && (
                <TouchableOpacity
                  onPress={() => onClose(config.id)}
                  className="p-2"
                >
                  <Text className="text-2xl text-gray-400">✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View className="max-h-96">{config.content}</View>
        </View>
      </Animated.View>
    </Modal>
  );
};

// Advanced Modal Component
const AdvancedModal: React.FC<{
  config: any;
  onClose: (id: string) => void;
}> = ({ config, onClose }) => {
  const getSize = () => {
    switch (config.size) {
      case "sm":
        return "w-80";
      case "lg":
        return "w-11/12 max-w-lg";
      case "xl":
        return "w-11/12 max-w-xl";
      case "fullscreen":
        return "w-full h-full";
      default:
        return "w-11/12 max-w-md";
    }
  };

  const getVariant = () => {
    switch (config.variant) {
      case "confirmation":
        return "border-blue-500";
      case "destructive":
        return "border-red-500";
      default:
        return "border-gray-200";
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={() => config.backdropClose && onClose(config.id)}
    >
      <View className="flex-1 bg-black bg-opacity-50 items-center justify-center p-4">
        <View
          className={`bg-white rounded-2xl shadow-2xl border-2 ${getSize()} ${getVariant()}`}
        >
          {config.title && (
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
              <Text className="text-xl font-JakartaBold text-gray-800">
                {config.title}
              </Text>
              {config.showCloseButton && (
                <TouchableOpacity
                  onPress={() => onClose(config.id)}
                  className="p-2"
                >
                  <Text className="text-2xl text-gray-400">✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View className="p-6">{config.content}</View>

          {config.actions && config.actions.length > 0 && (
            <View className="flex-row justify-end space-x-3 p-6 border-t border-gray-200">
              {config.actions.map((action: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    action.onPress();
                    if (!action.keepOpen) {
                      onClose(config.id);
                    }
                  }}
                  disabled={action.disabled}
                  className={`px-4 py-2 rounded-lg ${
                    action.variant === "destructive"
                      ? "bg-red-500"
                      : action.variant === "secondary"
                        ? "bg-gray-200"
                        : "bg-blue-500"
                  }`}
                >
                  <Text
                    className={`font-JakartaMedium ${
                      action.variant === "secondary"
                        ? "text-gray-700"
                        : "text-white"
                    }`}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Advanced Snackbar Component
const AdvancedSnackbar: React.FC<{
  config: any;
  onClose: (id: string) => void;
}> = ({ config, onClose }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    if (!config.persistent && config.duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, config.duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose(config.id);
    });
  };

  const getPosition = () => {
    switch (config.position) {
      case "top-left":
        return "top-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "top":
        return "top-4 left-1/2 -translate-x-1/2";
      case "bottom":
        return "bottom-4 left-1/2 -translate-x-1/2";
      default:
        return "bottom-4 left-1/2 -translate-x-1/2";
    }
  };

  const getTypeColor = () => {
    switch (config.type) {
      case "success":
        return "bg-green-500 border-green-600";
      case "error":
        return "bg-red-500 border-red-600";
      case "warning":
        return "bg-yellow-500 border-yellow-600";
      case "info":
        return "bg-blue-500 border-blue-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };

  const getIcon = () => {
    switch (config.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className={`absolute z-50 p-4 rounded-lg border-2 shadow-lg ${getPosition()} ${getTypeColor()}`}
    >
      <View className="flex-row items-start max-w-xs">
        <Text className="text-xl mr-3">{getIcon()}</Text>
        <View className="flex-1">
          <Text className="text-white font-JakartaBold text-sm mb-1">
            {config.message}
          </Text>
        </View>

        {config.showCloseButton && (
          <TouchableOpacity onPress={handleClose} className="ml-3 p-1">
            <Text className="text-white text-lg font-bold">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {config.action && (
        <TouchableOpacity
          onPress={() => {
            config.action.onPress();
            handleClose();
          }}
          className="mt-3 bg-white bg-opacity-20 px-3 py-1 rounded-md self-start"
        >
          <Text className="text-white font-JakartaMedium text-sm">
            {config.action.label}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const GlobalLoadingOverlay: React.FC = () => {
  const { globalLoading, globalLoadingMessage } = useUIStore();

  if (!globalLoading) return null;

  return (
    <Modal
      visible={globalLoading}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View className="flex-1 bg-black bg-opacity-50 items-center justify-center">
        <View className="bg-white p-6 rounded-2xl shadow-2xl items-center min-w-[200px]">
          <ActivityIndicator size="large" color="#0286FF" />
          <Text className="mt-4 text-lg font-JakartaMedium text-gray-700 text-center">
            {globalLoadingMessage}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export const UIWrapper: React.FC<UIWrapperProps> = ({
  children,
  showGlobalLoading = true,
}) => {
  const {
    events,
    bottomSheets,
    modals,
    snackbars,
    loadingStates,
    progressIndicators,
    dismissEvent,
    hideBottomSheet,
    hideModal,
    hideSnackbar,
    hideLoadingState,
    hideProgress,
    theme,
    loadTheme,
  } = useUIStore();

  // Load saved theme once
  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <>
      <View
        className={
          theme === "dark"
            ? "dark flex-1 bg-brand-primaryDark"
            : "flex-1 bg-brand-primary"
        }
      >
        {children}
      </View>

      {/* Global Loading Overlay */}
      {showGlobalLoading && <GlobalLoadingOverlay />}

      {/* Toast Notifications */}
      <View className="absolute top-0 left-0 right-0 z-50 pt-12">
        {events.map((event) => (
          <UIEventToast key={event.id} event={event} onDismiss={dismissEvent} />
        ))}
      </View>

      {/* Bottom Sheets */}
      {bottomSheets.map((sheet) => (
        <BottomSheet key={sheet.id} config={sheet} onClose={hideBottomSheet} />
      ))}

      {/* Advanced Modals */}
      {modals.map((modal) => (
        <AdvancedModal key={modal.id} config={modal} onClose={hideModal} />
      ))}

      {/* Advanced Snackbars */}
      {snackbars.map((snackbar) => (
        <AdvancedSnackbar
          key={snackbar.id}
          config={snackbar}
          onClose={hideSnackbar}
        />
      ))}

      {/* Loading States */}
      {loadingStates.map((loading) => (
        <View
          key={loading.id}
          className={`absolute z-40 ${loading.overlay ? "inset-0 bg-black bg-opacity-30 items-center justify-center" : ""}`}
        >
          {loading.type === "spinner" && (
            <LoadingSpinner size={loading.size} color={loading.color} />
          )}
          {loading.type === "dots" && (
            <LoadingDots size={loading.size} color={loading.color} />
          )}
          {loading.type === "pulse" && (
            <LoadingSpinner size={loading.size} color={loading.color} />
          )}
          {loading.type === "bars" && (
            <LoadingSpinner size={loading.size} color={loading.color} />
          )}
          {loading.message && (
            <Text className="mt-2 text-sm font-JakartaMedium text-gray-600">
              {loading.message}
            </Text>
          )}
        </View>
      ))}

      {/* Progress Indicators */}
      <View className="absolute top-4 left-4 right-4 z-40">
        {progressIndicators.map((progress) => (
          <View key={progress.id} className="mb-2">
            {progress.type === "linear" && (
              <LinearProgress
                value={progress.value}
                max={progress.max}
                color={progress.color}
                label={progress.label}
                showPercentage={progress.showPercentage}
              />
            )}
            {progress.type === "circular" && (
              <CircularProgress
                value={progress.value}
                max={progress.max}
                size={progress.size}
                color={progress.color}
                label={progress.label}
                showPercentage={progress.showPercentage}
              />
            )}
            {progress.type === "steps" && progress.steps && (
              <View className="w-full">
                {progress.label && (
                  <Text className="text-sm font-JakartaMedium text-gray-700 mb-2">
                    {progress.label}
                  </Text>
                )}
                <View className="flex-row justify-between">
                  {progress.steps.map((step, index) => (
                    <View key={index} className="flex-1 items-center">
                      <View
                        className={`w-8 h-8 rounded-full items-center justify-center mb-2 ${
                          step.completed
                            ? "bg-green-500"
                            : step.active
                              ? "bg-blue-500"
                              : "bg-gray-300"
                        }`}
                      >
                        <Text className="text-white font-JakartaBold text-sm">
                          {index + 1}
                        </Text>
                      </View>
                      <Text
                        className={`text-xs font-JakartaMedium ${
                          step.active ? "text-blue-600" : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    </>
  );
};

// Hook for easy UI management
export const useUI = () => {
  const uiStore = useUIStore();

  // Basic UI methods
  const showLoading = (message?: string, options?: any) => {
    return uiStore.showLoading(message, options);
  };

  const hideLoading = (id?: string) => {
    uiStore.hideLoading(id);
  };

  const showError = (
    title: string,
    message: string,
    action?: any,
    options?: any,
  ) => {
    return uiStore.showError(title, message, action, options);
  };

  const showSuccess = (
    title: string,
    message: string,
    action?: any,
    options?: any,
  ) => {
    return uiStore.showSuccess(title, message, action, options);
  };

  const showInfo = (
    title: string,
    message: string,
    action?: any,
    options?: any,
  ) => {
    return uiStore.showInfo(title, message, action, options);
  };

  const showWarning = (
    title: string,
    message: string,
    action?: any,
    options?: any,
  ) => {
    return uiStore.showWarning(title, message, action, options);
  };

  const showAdvancedToast = (config: any) => {
    return uiStore.showAdvancedToast(config);
  };

  // Advanced UI methods
  const showBottomSheet = (config: any) => {
    return uiStore.showBottomSheet(config);
  };

  const hideBottomSheet = (id: string) => {
    uiStore.hideBottomSheet(id);
  };

  const showModal = (config: any) => {
    return uiStore.showModal(config);
  };

  const hideModal = (id: string) => {
    uiStore.hideModal(id);
  };

  const showSnackbar = (config: any) => {
    return uiStore.showSnackbar(config);
  };

  const hideSnackbar = (id: string) => {
    uiStore.hideSnackbar(id);
  };

  const showLoadingState = (config: any) => {
    return uiStore.showLoadingState(config);
  };

  const hideLoadingState = (id: string) => {
    uiStore.hideLoadingState(id);
  };

  const showProgress = (config: any) => {
    return uiStore.showProgress(config);
  };

  const hideProgress = (id: string) => {
    uiStore.hideProgress(id);
  };

  const setGlobalLoading = (loading: boolean, message?: string) => {
    uiStore.setGlobalLoading(loading, message);
  };

  // Async wrapper for API calls with automatic UI management
  const withUI = async <T,>(
    asyncFn: () => Promise<T>,
    options: {
      loadingMessage?: string;
      successMessage?: string;
      errorTitle?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
    } = {},
  ): Promise<T | null> => {
    const loadingId = showLoading(options.loadingMessage || "Loading...");

    try {
      const result = await asyncFn();

      hideLoading(loadingId);

      if (options.successMessage) {
        showSuccess("Success", options.successMessage);
      }

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (error) {
      hideLoading(loadingId);

      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      showError(options.errorTitle || "Error", errorMessage);

      if (options.onError) {
        options.onError(error);
      }

      return null;
    }
  };

  // Advanced async wrapper with progress
  const withProgress = async <T,>(
    asyncFn: (
      updateProgress: (value: number, message?: string) => void,
    ) => Promise<T>,
    options: {
      initialMessage?: string;
      successMessage?: string;
      errorTitle?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
    } = {},
  ): Promise<T | null> => {
    const progressId = showProgress({
      type: "linear",
      value: 0,
      label: options.initialMessage || "Processing...",
      showPercentage: true,
    });

    try {
      const updateProgress = (value: number, message?: string) => {
        uiStore.updateProgress(progressId, {
          value,
          label: message || options.initialMessage,
        });
      };

      const result = await asyncFn(updateProgress);

      hideProgress(progressId);

      if (options.successMessage) {
        showSuccess("Success", options.successMessage);
      }

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (error) {
      hideProgress(progressId);

      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      showError(options.errorTitle || "Error", errorMessage);

      if (options.onError) {
        options.onError(error);
      }

      return null;
    }
  };

  return {
    // Basic methods
    showLoading,
    hideLoading,
    showError,
    showSuccess,
    showInfo,
    showWarning,
    showAdvancedToast,

    // Advanced methods
    showBottomSheet,
    hideBottomSheet,
    showModal,
    hideModal,
    showSnackbar,
    hideSnackbar,
    showLoadingState,
    hideLoadingState,
    showProgress,
    hideProgress,

    // Global methods
    setGlobalLoading,
    withUI,
    withProgress,

    // State access
    events: uiStore.events,
    bottomSheets: uiStore.bottomSheets,
    modals: uiStore.modals,
    snackbars: uiStore.snackbars,
    loadingStates: uiStore.loadingStates,
    progressIndicators: uiStore.progressIndicators,
    globalLoading: uiStore.globalLoading,
    theme: uiStore.theme,
    setTheme: uiStore.setTheme,
    toggleTheme: uiStore.toggleTheme,
  };
};

// Export individual components for direct use
export { LoadingSpinner, LoadingDots, LoadingSkeleton };
export { LinearProgress, CircularProgress };
export { BottomSheet, AdvancedModal, AdvancedSnackbar };

export default UIWrapper;
