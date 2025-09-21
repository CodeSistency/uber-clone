import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";

import { useNotificationStore } from "../../../store";
import { NotificationData } from "../../../types/type";

import { NotificationList } from "./NotificationList";
import { NotificationModal } from "./NotificationModal";

const { width, height } = Dimensions.get("window");

interface NotificationCenterProps {
  onClose?: () => void;
  onSettingsPress?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onClose,
  onSettingsPress,
}) => {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } =
    useNotificationStore();

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationData | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const handleMarkAllAsRead = () => {
    Alert.alert(
      "Mark All as Read",
      "Are you sure you want to mark all notifications as read?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark All Read",
          onPress: markAllAsRead,
        },
      ],
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: clearNotifications,
        },
      ],
    );
  };

  const handleNotificationPress = (notification: NotificationData) => {
    setSelectedNotification(notification);
  };

  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      // Default behavior - could navigate to settings screen
      console.log("Navigate to notification settings");
    }
  };

  const filteredNotifications = showUnreadOnly
    ? notifications.filter(
        (notification: NotificationData) => !notification.isRead,
      )
    : notifications;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="notifications" size={24} color="#111827" />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#111827",
              marginLeft: 12,
            }}
          >
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View
              style={{
                backgroundColor: "#EF4444",
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 8,
                paddingHorizontal: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={handleSettingsPress}
            style={{
              padding: 8,
              marginRight: 8,
              borderRadius: 8,
              backgroundColor: "#F3F4F6",
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings" size={20} color="#6B7280" />
          </TouchableOpacity>

          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: "#F3F4F6",
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 18, color: "#6B7280" }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Toggle */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={() => setShowUnreadOnly(false)}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: showUnreadOnly ? "#F3F4F6" : "#3B82F6",
            marginRight: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: showUnreadOnly ? "#6B7280" : "#FFFFFF",
              textAlign: "center",
            }}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowUnreadOnly(true)}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: showUnreadOnly ? "#3B82F6" : "#F3F4F6",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: showUnreadOnly ? "#FFFFFF" : "#6B7280",
              textAlign: "center",
            }}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      {(notifications.length > 0 || unreadCount > 0) && (
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: "#10B981",
                marginRight: 12,
              }}
            >
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#FFFFFF",
                  marginLeft: 6,
                }}
              >
                Mark All Read
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleClearAll}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: "#EF4444",
            }}
          >
            <Ionicons name="trash" size={16} color="#FFFFFF" />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#FFFFFF",
                marginLeft: 6,
              }}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notification List */}
      <NotificationList
        onNotificationPress={handleNotificationPress}
        showUnreadOnly={showUnreadOnly}
        maxHeight={height - 300} // Adjust based on header height
      />

      {/* Notification Modal */}
      <NotificationModal
        visible={selectedNotification !== null}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        actions={[
          { label: "Mark as Read", action: "mark_read" },
          { label: "Dismiss", action: "dismiss", style: "secondary" },
        ]}
      />
    </SafeAreaView>
  );
};

export default NotificationCenter;
