import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";

// import * as Haptics from 'expo-haptics'; // Temporarily commented for TypeScript compatibility
import { useNotificationStore } from "../../../store";
import { NotificationData } from "../../../types/type";

const { width } = Dimensions.get("window");

interface NotificationBannerProps {
  notification: NotificationData;
  onClose: () => void;
  onAction?: () => void;
  autoHide?: boolean;
  duration?: number;
  position?: "top" | "bottom";
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onClose,
  onAction,
  autoHide = true,
  duration = 5000,
  position = "top",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animation] = useState(new Animated.Value(0));
  const { markAsRead } = useNotificationStore();

  useEffect(() => {
    // Slide in animation
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Trigger haptic feedback based on priority
    triggerHapticFeedback();

    // Auto-hide after duration if enabled
    if (autoHide && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const triggerHapticFeedback = async () => {
    try {
      switch (notification.priority) {
        case "critical":
          // await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // Temporarily commented
          break;
        case "high":
          // await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); // Temporarily commented
          break;
        case "normal":
          // await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Temporarily commented
          break;
        default:
          // No haptic for low priority
          break;
      }
    } catch (error) {
      console.warn("[NotificationBanner] Haptic feedback failed:", error);
    }
  };

  const handleClose = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onClose();
    });
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    handleClose();
  };

  const getIcon = () => {
    switch (notification.priority) {
      case "critical":
        return <Ionicons name="warning" size={20} color="#EF4444" />;
      case "high":
        return <Ionicons name="alert-circle" size={20} color="#F59E0B" />;
      case "normal":
        return <Ionicons name="information-circle" size={20} color="#3B82F6" />;
      case "low":
        return <Ionicons name="checkmark-circle" size={20} color="#10B981" />;
      default:
        return <Ionicons name="information-circle" size={20} color="#6B7280" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.priority) {
      case "critical":
        return "#FEE2E2"; // Red background
      case "high":
        return "#FEF3C7"; // Yellow background
      case "normal":
        return "#DBEAFE"; // Blue background
      case "low":
        return "#D1FAE5"; // Green background
      default:
        return "#F3F4F6"; // Gray background
    }
  };

  const getBorderColor = () => {
    switch (notification.priority) {
      case "critical":
        return "#EF4444";
      case "high":
        return "#F59E0B";
      case "normal":
        return "#3B82F6";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: position === "top" ? [-100, 0] : [100, 0],
  });

  if (!isVisible) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        position: "absolute",
        top: position === "top" ? 0 : undefined,
        bottom: position === "bottom" ? 0 : undefined,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <View
        style={{
          backgroundColor: getBackgroundColor(),
          borderBottomColor: getBorderColor(),
          borderBottomWidth: 2,
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingTop: 44, // Account for status bar
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          {/* Icon */}
          <View style={{ marginRight: 12, marginTop: 2 }}>{getIcon()}</View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 4,
              }}
              numberOfLines={2}
            >
              {notification.title}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 20,
              }}
              numberOfLines={2}
            >
              {notification.message}
            </Text>

            {/* Action Button */}
            {onAction && (
              <TouchableOpacity
                onPress={handleAction}
                style={{
                  marginTop: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: getBorderColor(),
                  borderRadius: 6,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#FFFFFF",
                  }}
                >
                  View Details
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={handleClose}
            style={{
              marginLeft: 12,
              padding: 4,
              borderRadius: 12,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Auto-hide Progress Bar */}
        {autoHide && duration > 0 && (
          <View
            style={{
              height: 2,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              borderRadius: 1,
              marginTop: 12,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                height: "100%",
                backgroundColor: getBorderColor(),
                transform: [
                  {
                    translateX: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-width, 0],
                    }),
                  },
                ],
              }}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default NotificationBanner;
