import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";

import { useNotificationStore } from "../../../store";
import { NotificationData } from "../../../types/type";

const { width, height } = Dimensions.get("window");

interface NotificationListProps {
  onNotificationPress?: (notification: NotificationData) => void;
  showUnreadOnly?: boolean;
  maxHeight?: number;
  emptyStateMessage?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  onNotificationPress,
  showUnreadOnly = false,
  maxHeight = height * 0.6,
  emptyStateMessage = "No notifications",
}) => {
  const { notifications, markAsRead, clearNotifications, removeNotification } =
    useNotificationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Filter notifications based on unread preference
  const filteredNotifications = showUnreadOnly
    ? notifications.filter(
        (notification: NotificationData) => !notification.isRead,
      )
    : notifications;

  // Sort by timestamp (newest first)
  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Implement actual refresh from server
    // await notificationService.refreshNotifications();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleNotificationPress = useCallback(
    (notification: NotificationData) => {
      // Mark as read
      if (!notification.isRead) {
        markAsRead(notification.id);
      }

      // Call optional callback
      if (onNotificationPress) {
        onNotificationPress(notification);
      }
    },
    [markAsRead, onNotificationPress],
  );

  const handleDeleteNotification = useCallback(
    (notificationId: string) => {
      Alert.alert(
        "Delete Notification",
        "Are you sure you want to delete this notification?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setDeletingIds((prev) => new Set(prev).add(notificationId));
              removeNotification(notificationId);
              setDeletingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(notificationId);
                return newSet;
              });
            },
          },
        ],
      );
    },
    [removeNotification],
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: clearNotifications,
        },
      ],
    );
  }, [clearNotifications]);

  const getIcon = (priority: string) => {
    switch (priority) {
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

  const getBackgroundColor = (isRead: boolean, priority: string) => {
    if (!isRead) {
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
    }
    return "transparent";
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return timestamp.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: NotificationData }) => {
    const isDeleting = deletingIds.has(item.id);

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        disabled={isDeleting}
        style={{
          opacity: isDeleting ? 0.5 : 1,
          backgroundColor: getBackgroundColor(item.isRead, item.priority),
          marginHorizontal: 16,
          marginVertical: 4,
          borderRadius: 12,
          padding: 16,
          borderWidth: item.isRead ? 0 : 1,
          borderColor: item.isRead ? "transparent" : "#E5E7EB",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          {/* Icon */}
          <View style={{ marginRight: 12, marginTop: 2 }}>
            {getIcon(item.priority)}
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: item.isRead ? "500" : "600",
                  color: "#111827",
                  flex: 1,
                  marginRight: 8,
                }}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              {/* Delete button */}
              <TouchableOpacity
                onPress={() => handleDeleteNotification(item.id)}
                style={{
                  padding: 4,
                  borderRadius: 12,
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash" size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 20,
                marginTop: 4,
                marginBottom: 8,
              }}
              numberOfLines={2}
            >
              {item.message}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                }}
              >
                {formatTimestamp(item.timestamp)}
              </Text>

              {!item.isRead && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#3B82F6",
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 48,
      }}
    >
      <Text
        style={{
          fontSize: 48,
          marginBottom: 16,
        }}
      >
        🔔
      </Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: "#111827",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {emptyStateMessage}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#6B7280",
          textAlign: "center",
          paddingHorizontal: 32,
        }}
      >
        {showUnreadOnly
          ? "You have no unread notifications"
          : "Your notifications will appear here"}
      </Text>
    </View>
  );

  const renderHeader = () => {
    if (sortedNotifications.length === 0) return null;

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#111827",
          }}
        >
          Notifications{" "}
          {showUnreadOnly ? `(${sortedNotifications.length})` : ""}
        </Text>

        {sortedNotifications.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: "#EF4444",
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#FFFFFF",
              }}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{ maxHeight }}>
      {renderHeader()}

      <FlatList
        data={sortedNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: sortedNotifications.length === 0 ? 1 : 0,
        }}
      />
    </View>
  );
};
