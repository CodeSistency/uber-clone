import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";

// import * as Haptics from 'expo-haptics'; // Temporarily commented for TypeScript compatibility
import { useNotificationStore } from "../../../store";
import { NotificationData } from "../../../types/type";

const { width, height } = Dimensions.get("window");

interface NotificationModalProps {
  visible: boolean;
  notification: NotificationData | null;
  onClose: () => void;
  onAction?: (action: string) => void;
  actions?: {
    label: string;
    action: string;
    style?: "primary" | "secondary" | "danger";
  }[];
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  notification,
  onClose,
  onAction,
  actions = [
    { label: "Mark as Read", action: "mark_read" },
    { label: "Dismiss", action: "dismiss", style: "secondary" },
  ],
}) => {
  const [scaleAnim] = React.useState(new Animated.Value(0));
  const [opacityAnim] = React.useState(new Animated.Value(0));
  const { markAsRead } = useNotificationStore();

  useEffect(() => {
    if (visible && notification) {
      // Mark as read when modal opens
      if (!notification.isRead) {
        markAsRead(notification.id);
      }

      // Trigger haptic feedback
      triggerHapticFeedback();

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, notification]);

  const triggerHapticFeedback = async () => {
    try {
      if (notification?.priority === "critical") {
        // await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // Temporarily commented
      } else if (notification?.priority === "high") {
        // await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); // Temporarily commented
      } else {
        // await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Temporarily commented
      }
    } catch (error) {
      console.warn("[NotificationModal] Haptic feedback failed:", error);
    }
  };

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
    onClose();
  };

  const getIcon = (priority?: string) => {
    const size = 32;
    switch (priority) {
      case "critical":
        return <Ionicons name="warning" size={size} color="#EF4444" />;
      case "high":
        return <Ionicons name="alert-circle" size={size} color="#F59E0B" />;
      case "normal":
        return (
          <Ionicons name="information-circle" size={size} color="#3B82F6" />
        );
      case "low":
        return <Ionicons name="checkmark-circle" size={size} color="#10B981" />;
      default:
        return (
          <Ionicons name="information-circle" size={size} color="#6B7280" />
        );
    }
  };

  const getBackgroundColor = (priority?: string) => {
    switch (priority) {
      case "critical":
        return "#FEF2F2";
      case "high":
        return "#FFFBEB";
      case "normal":
        return "#EFF6FF";
      case "low":
        return "#F0FDF4";
      default:
        return "#F9FAFB";
    }
  };

  const getBorderColor = (priority?: string) => {
    switch (priority) {
      case "critical":
        return "#EF4444";
      case "high":
        return "#F59E0B";
      case "normal":
        return "#3B82F6";
      case "low":
        return "#10B981";
      default:
        return "#D1D5DB";
    }
  };

  const getActionButtonStyle = (style?: string) => {
    switch (style) {
      case "primary":
        return {
          backgroundColor: "#3B82F6",
          borderColor: "#3B82F6",
        };
      case "danger":
        return {
          backgroundColor: "#EF4444",
          borderColor: "#EF4444",
        };
      case "secondary":
      default:
        return {
          backgroundColor: "transparent",
          borderColor: "#D1D5DB",
        };
    }
  };

  const getActionButtonTextColor = (style?: string) => {
    switch (style) {
      case "secondary":
        return "#374151";
      default:
        return "#FFFFFF";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return timestamp.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!notification) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Animated.View
          style={{
            width: width * 0.9,
            maxHeight: height * 0.8,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: getBackgroundColor(notification.priority),
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                {getIcon(notification.priority)}
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {notification.title}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="calendar" size={14} color="#6B7280" />
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      marginLeft: 4,
                    }}
                  >
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={{ maxHeight: height * 0.5 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                fontSize: 16,
                color: "#374151",
                lineHeight: 24,
                marginBottom: 16,
              }}
            >
              {notification.message}
            </Text>

            {/* Additional Data Display */}
            {notification.data && Object.keys(notification.data).length > 0 && (
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 8,
                  padding: 16,
                  marginTop: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Details
                </Text>

                {Object.entries(notification.data).map(([key, value]) => (
                  <View
                    key={key}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6B7280",
                        textTransform: "capitalize",
                      }}
                    >
                      {key.replace(/_/g, " ")}:
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#111827",
                        fontWeight: "500",
                      }}
                      numberOfLines={1}
                    >
                      {String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Priority Indicator */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 16,
                padding: 12,
                backgroundColor: getBackgroundColor(notification.priority),
                borderRadius: 8,
                borderWidth: 1,
                borderColor: getBorderColor(notification.priority),
              }}
            >
              {getIcon(notification.priority)}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#374151",
                  marginLeft: 8,
                  textTransform: "capitalize",
                }}
              >
                {notification.priority} Priority
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View
            style={{
              flexDirection: "row",
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              gap: 12,
            }}
          >
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleAction(action.action)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  ...getActionButtonStyle(action.style),
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: getActionButtonTextColor(action.style),
                    textAlign: "center",
                  }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default NotificationModal;
