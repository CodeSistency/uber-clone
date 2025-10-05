import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useConnectivity } from "@/hooks/useConnectivity";
import { offlineQueue } from "@/lib/offline/OfflineQueue";
import { criticalDataCache } from "@/lib/cache/CriticalDataCache";

interface OfflineIndicatorProps {
  showDetails?: boolean;
  onSync?: () => void;
  position?: "top" | "bottom" | "center";
  style?: "banner" | "floating" | "inline";
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showDetails = false,
  onSync,
  position = "top",
  style = "banner",
  autoHide = false,
  autoHideDelay = 5000,
}) => {
  const {
    isOnline,
    connectionType,
    connectionSpeed,
    connectionQuality,
    pendingSyncCount,
    lastSyncTime,
    syncNow,
    isFeatureAvailable,
  } = useConnectivity();

  const [isVisible, setIsVisible] = useState(!isOnline);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [syncing, setSyncing] = useState(false);
  const [showSyncProgress, setShowSyncProgress] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Auto-hide logic
  useEffect(() => {
    if (autoHide && isOnline) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(!isOnline);
    }
  }, [isOnline, autoHide, autoHideDelay]);

  // Pulse animation when offline
  useEffect(() => {
    if (!isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isOnline]);

  const handleManualSync = async () => {
    if (syncing || !isOnline) return;

    setSyncing(true);
    setShowSyncProgress(true);
    setSyncProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await syncNow();

      setSyncProgress(100);
      setTimeout(() => {
        setShowSyncProgress(false);
        setSyncProgress(0);
        onSync?.();
      }, 1000);
    } catch (error) {
      
      setShowSyncProgress(false);
    } finally {
      setSyncing(false);
    }
  };

  const getConnectionColor = () => {
    if (isOnline) return "#10B981"; // Green
    if (connectionQuality === "fair") return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  const getConnectionIcon = () => {
    if (isOnline) return "wifi";
    if (connectionQuality === "fair") return "wifi-off-outline";
    return "wifi-off";
  };

  const getConnectionText = () => {
    if (isOnline) return "Online";
    if (connectionQuality === "fair") return "Conexión débil";
    return "Sin conexión";
  };

  const getPositionStyle = () => {
    switch (position) {
      case "top":
        return { top: 50, left: 16, right: 16 };
      case "bottom":
        return { bottom: 100, left: 16, right: 16 };
      case "center":
        return {
          top: "50%",
          left: "50%",
          transform: [{ translateX: -150 }, { translateY: -50 }],
        };
      default:
        return { top: 50, left: 16, right: 16 };
    }
  };

  const getStyleLayout = () => {
    switch (style) {
      case "floating":
        return {
          position: "absolute" as const,
          ...getPositionStyle(),
          zIndex: 1000,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        };
      case "banner":
        return {
          backgroundColor: `${getConnectionColor()}20`,
          borderColor: getConnectionColor(),
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
        };
      case "inline":
        return {
          backgroundColor: `${getConnectionColor()}15`,
          borderRadius: 8,
          padding: 8,
        };
      default:
        return {};
    }
  };

  if (!isVisible) return null;

  if (style === "floating") {
    return (
      <Animated.View
        style={[getStyleLayout(), { transform: [{ scale: pulseAnim }] }]}
      >
        <View className="bg-white rounded-xl p-4 min-w-[280px]">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Ionicons
                  name={getConnectionIcon() as any}
                  size={24}
                  color={getConnectionColor()}
                />
              </Animated.View>
              <Text
                className="ml-3 font-JakartaBold text-lg"
                style={{ color: getConnectionColor() }}
              >
                {getConnectionText()}
              </Text>
            </View>

            {pendingSyncCount > 0 && (
              <TouchableOpacity
                onPress={handleManualSync}
                disabled={syncing}
                className="bg-blue-500 px-3 py-2 rounded-lg"
              >
                {syncing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-sm font-JakartaMedium">
                    Sincronizar ({pendingSyncCount})
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {showDetails && (
            <View className="border-t border-gray-200 pt-3">
              <Text className="text-sm text-gray-600 mb-2">
                {isOnline
                  ? `Conexión: ${connectionType.toUpperCase()} • ${connectionSpeed} Mbps • ${connectionQuality}`
                  : "Las acciones se guardarán localmente y se sincronizarán cuando vuelvas a tener conexión."}
              </Text>

              {lastSyncTime && (
                <Text className="text-xs text-gray-500">
                  Última sincronización: {lastSyncTime.toLocaleTimeString()}
                </Text>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[getStyleLayout(), { transform: [{ scale: pulseAnim }] }]}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons
              name={getConnectionIcon() as any}
              size={20}
              color={getConnectionColor()}
            />
          </Animated.View>
          <Text
            className="ml-2 font-JakartaMedium"
            style={{ color: getConnectionColor() }}
          >
            {getConnectionText()}
          </Text>

          {pendingSyncCount > 0 && (
            <View className="ml-2 bg-orange-100 px-2 py-1 rounded-full">
              <Text className="text-xs font-JakartaBold text-orange-800">
                {pendingSyncCount}
              </Text>
            </View>
          )}
        </View>

        {!isOnline && pendingSyncCount > 0 && (
          <TouchableOpacity
            onPress={handleManualSync}
            disabled={syncing}
            className="bg-blue-500 px-3 py-2 rounded-lg"
          >
            {syncing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white text-sm font-JakartaMedium">
                Sincronizar
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {showSyncProgress && (
        <View className="mt-3">
          <View className="bg-gray-200 rounded-full h-2">
            <View
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${syncProgress}%` }}
            />
          </View>
          <Text className="text-xs text-gray-600 mt-1 text-center">
            Sincronizando... {syncProgress}%
          </Text>
        </View>
      )}

      {showDetails && !isOnline && (
        <Text className="mt-2 text-sm text-gray-600">
          Las acciones se guardarán localmente y se sincronizarán cuando vuelvas
          a tener conexión.
        </Text>
      )}
    </Animated.View>
  );
};

// Specialized components for different contexts
export const OfflineBanner: React.FC<Omit<OfflineIndicatorProps, "style">> = (
  props,
) => <OfflineIndicator {...props} style="banner" />;

export const OfflineFloating: React.FC<Omit<OfflineIndicatorProps, "style">> = (
  props,
) => <OfflineIndicator {...props} style="floating" />;

export const OfflineInline: React.FC<Omit<OfflineIndicatorProps, "style">> = (
  props,
) => <OfflineIndicator {...props} style="inline" />;
