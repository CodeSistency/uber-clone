import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";

// Using Expo Vector Icons instead of lucide-react-native for better compatibility
// import * as Haptics from 'expo-haptics'; // Temporarily commented for TypeScript compatibility
import { ChatMessage, LocationData } from "../../../types/type";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showTimestamp?: boolean;
  onLongPress?: () => void;
  onLocationPress?: (location: LocationData) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showTimestamp = true,
  onLongPress,
  onLocationPress,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleLongPress = () => {
    if (onLongPress) {
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Temporarily commented
      onLongPress();
    }
  };

  const handleLocationPress = () => {
    if (
      message.messageType === "location" &&
      message.senderId &&
      onLocationPress
    ) {
      // Parse location from message
      // This is a simplified example - in real implementation you'd parse actual coordinates
      const mockLocation: LocationData = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        timestamp: new Date(),
      };
      onLocationPress(mockLocation);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - messageTime.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;

    return messageTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getMessageStatusIcon = () => {
    if (!isOwnMessage) return null;

    if (message.isRead) {
      return <Ionicons name="checkmark-done" size={12} color="#10B981" />;
    }
    return <Ionicons name="checkmark" size={12} color="#9CA3AF" />;
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "location":
        return (
          <TouchableOpacity
            onPress={handleLocationPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 8,
            }}
          >
            <Ionicons name="location" size={16} color="#3B82F6" />
            <Text
              style={{
                fontSize: 14,
                color: "#3B82F6",
                fontWeight: "500",
                marginLeft: 6,
              }}
            >
              📍 Location shared
            </Text>
          </TouchableOpacity>
        );

      case "system":
        return (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              {message.message}
            </Text>
          </View>
        );

      default:
        return (
          <Text
            style={{
              fontSize: 16,
              color: isOwnMessage ? "#FFFFFF" : "#111827",
              lineHeight: 22,
            }}
          >
            {message.message}
          </Text>
        );
    }
  };

  const bubbleStyle = {
    maxWidth: "75%" as any, // Using any to bypass TypeScript strict checking for string percentage
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 4,
    ...(!isOwnMessage && {
      backgroundColor: "#F3F4F6",
      borderBottomLeftRadius: 4,
    }),
    ...(isOwnMessage && {
      backgroundColor: "#3B82F6",
      borderBottomRightRadius: 4,
      alignSelf: "flex-end" as any,
    }),
    ...(message.messageType === "system" && {
      backgroundColor: "transparent",
      alignSelf: "center" as any,
      maxWidth: "90%" as any,
    }),
  };

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      style={{
        marginVertical: 2,
        paddingHorizontal: 16,
        ...(isOwnMessage && { alignSelf: "flex-end" as any }),
        ...(!isOwnMessage && { alignSelf: "flex-start" as any }),
      }}
      activeOpacity={0.8}
    >
      <View style={bubbleStyle}>{renderMessageContent()}</View>

      {showTimestamp && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 2,
            paddingHorizontal: 4,
            ...(isOwnMessage && { justifyContent: "flex-end" }),
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              marginRight: 4,
            }}
          >
            {formatTimestamp(message.timestamp)}
          </Text>

          {getMessageStatusIcon()}
        </View>
      )}

      {/* Message options overlay (shown on long press) */}
      {showOptions && (
        <View
          style={{
            position: "absolute",
            top: -40,
            ...(isOwnMessage ? { right: 16 } : { left: 16 }),
            backgroundColor: "#FFFFFF",
            borderRadius: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setShowOptions(false);
              // Handle reply action
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRightWidth: 1,
              borderRightColor: "#E5E7EB",
            }}
          >
            <Text style={{ fontSize: 12, color: "#3B82F6" }}>Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowOptions(false);
              Alert.alert(
                "Delete Message",
                "Are you sure you want to delete this message?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      // Handle delete action
                      console.log("Delete message:", message.id);
                    },
                  },
                ],
              );
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Ionicons name="trash" size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default MessageBubble;