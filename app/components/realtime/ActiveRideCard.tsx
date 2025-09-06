import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useRealtimeStore, useChatStore } from "../../../store";
import { Ride, RideStatus, LocationData } from "../../../types/type";

interface ActiveRideCardProps {
  ride: Ride;
  onNavigate?: () => void;
  onChat?: () => void;
  onEmergency?: () => void;
  compact?: boolean;
}

export const ActiveRideCard: React.FC<ActiveRideCardProps> = ({
  ride,
  onNavigate,
  onChat,
  onEmergency,
  compact = false,
}) => {
  const { driverLocation, rideStatus } = useRealtimeStore();
  const { unreadMessages } = useChatStore();

  const unreadCount =
    unreadMessages && ride.ride_id ? unreadMessages[ride.ride_id] || 0 : 0;

  const getStatusColor = (status: RideStatus) => {
    switch (status) {
      case "requested":
        return "#F59E0B"; // Yellow
      case "accepted":
        return "#3B82F6"; // Blue
      case "arriving":
        return "#8B5CF6"; // Purple
      case "arrived":
        return "#10B981"; // Green
      case "in_progress":
        return "#059669"; // Dark Green
      case "completed":
        return "#6B7280"; // Gray
      case "cancelled":
        return "#EF4444"; // Red
      case "emergency":
        return "#DC2626"; // Dark Red
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: RideStatus) => {
    switch (status) {
      case "requested":
        return "Finding Driver";
      case "accepted":
        return "Driver Assigned";
      case "arriving":
        return "Driver Arriving";
      case "arrived":
        return "Driver Arrived";
      case "in_progress":
        return "Ride in Progress";
      case "completed":
        return "Ride Completed";
      case "cancelled":
        return "Ride Cancelled";
      case "emergency":
        return "Emergency Mode";
      default:
        return "Unknown Status";
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (compact) {
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
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {ride.destination_address}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: getStatusColor(rideStatus),
                  marginRight: 6,
                }}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                }}
              >
                {getStatusText(rideStatus)}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row" }}>
            {onChat && (
              <TouchableOpacity
                onPress={onChat}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Ionicons name="chatbubble" size={18} color="#6B7280" />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      backgroundColor: "#EF4444",
                      borderRadius: 8,
                      minWidth: 16,
                      height: 16,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: "#FFFFFF",
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {onNavigate && (
              <TouchableOpacity
                onPress={onNavigate}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#3B82F6",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="navigate" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Full card
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {/* Status Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: getStatusColor(rideStatus),
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
            }}
          >
            {getStatusText(rideStatus)}
          </Text>
        </View>

        {rideStatus === "emergency" && (
          <TouchableOpacity
            onPress={onEmergency}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: "#EF4444",
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#FFFFFF",
              }}
            >
              🚨 EMERGENCY
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Route Info */}
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Ionicons name="location" size={16} color="#10B981" />
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginLeft: 8,
              flex: 1,
            }}
            numberOfLines={1}
          >
            From: {ride.origin_address}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="location" size={16} color="#EF4444" />
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginLeft: 8,
              flex: 1,
            }}
            numberOfLines={1}
          >
            To: {ride.destination_address}
          </Text>
        </View>
      </View>

      {/* Driver Info */}
      {ride.driver && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#E5E7EB",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 18 }}>👨‍💼</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
              }}
            >
              {ride.driver.first_name} {ride.driver.last_name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
              }}
            >
              ⭐ 4.8 • {ride.driver.car_seats} seats
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              // Call driver - would integrate with phone dialer
              console.log("Call driver:", ride.driver);
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#10B981",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
        }}
      >
        {onChat && (
          <TouchableOpacity
            onPress={onChat}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
            }}
          >
            <Ionicons name="chatbubble" size={18} color="#6B7280" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#374151",
                marginLeft: 8,
              }}
            >
              Chat {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
        )}

        {onNavigate && (
          <TouchableOpacity
            onPress={onNavigate}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              backgroundColor: "#3B82F6",
              borderRadius: 12,
            }}
          >
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#FFFFFF",
                marginLeft: 8,
              }}
            >
              Navigate
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ActiveRideCard;