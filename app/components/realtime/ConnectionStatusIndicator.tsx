import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";

import NetInfo from "@react-native-community/netinfo"; // ✅ Activated for real connectivity detection
import { useRealtimeStore } from "../../../store";
import { ConnectionStatus } from "../../../types/type";
import {
  connectivityManager,
  useConnectivityManager,
} from "@/lib/connectivity";

interface ConnectionStatusIndicatorProps {
  showDetails?: boolean;
  onReconnect?: () => void;
  style?: "compact" | "detailed";
  showPendingCount?: boolean;
}

export const ConnectionStatusIndicator: React.FC<
  ConnectionStatusIndicatorProps
> = ({
  showDetails = false,
  onReconnect,
  style = "compact",
  showPendingCount = true,
}) => {
  const { connectionStatus } = useRealtimeStore();
  const connectivity = useConnectivityManager();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // Start pulsing animation when disconnected
    if (!connectionStatus.isConnected || !connectionStatus.websocketConnected) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [connectionStatus.isConnected, connectionStatus.websocketConnected]);

  useEffect(() => {
    // Initialize connectivity manager
    const initializeConnectivity = async () => {
      try {
        await connectivityManager.initialize();
        console.log(
          "[ConnectionStatusIndicator] ConnectivityManager initialized",
        );
      } catch (error) {
        console.error(
          "[ConnectionStatusIndicator] Failed to initialize connectivity:",
          error,
        );
      }
    };

    initializeConnectivity();

    // Cleanup on unmount
    return () => {
      connectivityManager.destroy();
    };
  }, []);

  const startPulseAnimation = () => {
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
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleReconnect = async () => {
    if (onReconnect) {
      setIsReconnecting(true);
      try {
        await onReconnect();
      } finally {
        setIsReconnecting(false);
      }
    }
  };

  const getStatusColor = () => {
    if (!connectionStatus.isConnected) return "#EF4444"; // Red
    if (!connectionStatus.websocketConnected) return "#F59E0B"; // Yellow
    return "#10B981"; // Green
  };

  const getStatusText = () => {
    if (!connectionStatus.isConnected) return "Offline";
    if (!connectionStatus.websocketConnected) return "Connecting...";
    return "Connected";
  };

  const getStatusIcon = () => {
    if (!connectionStatus.isConnected) {
      return <Ionicons name="wifi" size={16} color={getStatusColor()} />;
    }
    if (!connectionStatus.websocketConnected) {
      return (
        <Ionicons name="alert-circle" size={16} color={getStatusColor()} />
      );
    }
    return <Ionicons name="wifi" size={16} color={getStatusColor()} />;
  };

  const getDetailedStatus = () => {
    const parts = [];

    if (connectivity.isOnline) {
      parts.push(`${connectivity.connectionType.toUpperCase()}`);
      parts.push(`${connectivity.connectionSpeed} Mbps`);
      parts.push(`Quality: ${connectivity.connectionQuality}`);
    } else {
      parts.push("No Network");
    }

    if (connectivity.isInternetReachable) {
      parts.push("Internet Reachable");
    } else {
      parts.push("No Internet");
    }

    if (connectionStatus.websocketConnected) {
      parts.push("Real-time Active");
    } else {
      parts.push("Real-time Offline");
    }

    // Add pending sync count if requested
    if (
      showPendingCount &&
      "pendingSyncCount" in connectivity &&
      (connectivity as any).pendingSyncCount > 0
    ) {
      parts.push(`${(connectivity as any).pendingSyncCount} pending sync`);
    }

    return parts.join(" • ");
  };

  if (style === "compact") {
    return (
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        <TouchableOpacity
          onPress={handleReconnect}
          disabled={isReconnecting || !onReconnect}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: `${getStatusColor()}20`,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: getStatusColor(),
          }}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          {isReconnecting ? (
            <Ionicons name="refresh" size={14} color={getStatusColor()} />
          ) : (
            getStatusIcon()
          )}

          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: getStatusColor(),
              marginLeft: 4,
            }}
          >
            {isReconnecting ? "Reconnecting..." : getStatusText()}
          </Text>

          {showPendingCount &&
            "pendingSyncCount" in connectivity &&
            (connectivity as any).pendingSyncCount > 0 && (
              <View
                style={{
                  backgroundColor: "#F59E0B",
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 4,
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                  }}
                >
                  {(connectivity as any).pendingSyncCount > 99
                    ? "99+"
                    : (connectivity as any).pendingSyncCount}
                </Text>
              </View>
            )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Detailed style
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          {getStatusIcon()}
        </Animated.View>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#111827",
            marginLeft: 8,
          }}
        >
          Connection Status
        </Text>
      </View>

      <Text
        style={{
          fontSize: 14,
          color: "#6B7280",
          marginBottom: 8,
        }}
      >
        {getDetailedStatus()}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: getStatusColor(),
              marginRight: 6,
            }}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: getStatusColor(),
            }}
          >
            {getStatusText()}
          </Text>
        </View>

        {(!connectionStatus.isConnected ||
          !connectionStatus.websocketConnected) &&
          onReconnect && (
            <TouchableOpacity
              onPress={handleReconnect}
              disabled={isReconnecting}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: getStatusColor(),
                borderRadius: 6,
              }}
            >
              {isReconnecting ? (
                <Ionicons name="refresh" size={14} color="#FFFFFF" />
              ) : (
                <Ionicons name="refresh" size={14} color="#FFFFFF" />
              )}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#FFFFFF",
                  marginLeft: 6,
                }}
              >
                {isReconnecting ? "Reconnecting..." : "Reconnect"}
              </Text>
            </TouchableOpacity>
          )}
      </View>

      {showDetails && (
        <View
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              marginBottom: 4,
            }}
          >
            Last Updated: {connectionStatus.lastPing.toLocaleTimeString()}
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: "#9CA3AF",
            }}
          >
            Real-time updates:{" "}
            {connectionStatus.websocketConnected ? "Active" : "Inactive"}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ConnectionStatusIndicator;
