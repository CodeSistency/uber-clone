import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";

// import NetInfo from '@react-native-community/netinfo'; // Temporarily commented for TypeScript compatibility
import { useRealtimeStore } from "../../../store";
import { ConnectionStatus } from "../../../types/type";

interface ConnectionStatusIndicatorProps {
  showDetails?: boolean;
  onReconnect?: () => void;
  style?: "compact" | "detailed";
}

export const ConnectionStatusIndicator: React.FC<
  ConnectionStatusIndicatorProps
> = ({ showDetails = false, onReconnect, style = "compact" }) => {
  const { connectionStatus, setConnectionStatus } = useRealtimeStore();
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
    // Listen to network changes
    // Temporarily commented for TypeScript compatibility
    // const unsubscribe = NetInfo.addEventListener(state => {
    //   const newStatus = {
    //     isConnected: state.isConnected ?? false,
    //     connectionType: state.type === 'wifi' ? 'wifi' : 'cellular',
    //     websocketConnected: connectionStatus.websocketConnected,
    //     lastPing: new Date(),
    //   };
    //   setConnectionStatus(newStatus);
    // });

    // return () => unsubscribe();
    return () => {}; // Placeholder return
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

    if (connectionStatus.isConnected) {
      parts.push(`${connectionStatus.connectionType.toUpperCase()}`);
    } else {
      parts.push("No Network");
    }

    if (connectionStatus.websocketConnected) {
      parts.push("Real-time Active");
    } else {
      parts.push("Real-time Offline");
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
