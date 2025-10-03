import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  formatTime,
  getRelativeTime,
  getNotificationIcon,
  getNotificationColor,
} from "@/lib/expo-notifications/utils";
import { ExpoNotificationData } from "../../types/expo-notifications";

interface NotificationItemProps {
  notification: ExpoNotificationData;
  onPress?: (notification: ExpoNotificationData) => void;
  onLongPress?: (notification: ExpoNotificationData) => void;
  showTimestamp?: boolean;
  compact?: boolean;
}

/**
 * Componente para mostrar una notificación individual
 * Soporta modos compacto y completo, con diferentes estilos según prioridad
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onLongPress,
  showTimestamp = true,
  compact = false,
}) => {
  const handlePress = () => {
    onPress?.(notification);
  };

  const handleLongPress = () => {
    onLongPress?.(notification);
  };

  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);

  const containerStyle = [
    styles.container,
    compact && styles.containerCompact,
    !notification.isRead && styles.unreadContainer,
    { borderLeftColor: color },
  ];

  const titleStyle = [
    styles.title,
    compact && styles.titleCompact,
    !notification.isRead && styles.titleUnread,
  ];

  const messageStyle = [styles.message, compact && styles.messageCompact];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {/* Indicador visual de tipo de notificación */}
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>

      {/* Contenido principal */}
      <View style={styles.contentContainer}>
        <Text style={titleStyle} numberOfLines={compact ? 1 : 2}>
          {notification.title}
        </Text>

        <Text style={messageStyle} numberOfLines={compact ? 1 : 3}>
          {notification.message}
        </Text>

        {/* Timestamp y prioridad */}
        {showTimestamp && (
          <View style={styles.footerContainer}>
            <Text style={styles.timestamp}>
              {getRelativeTime(notification.timestamp)}
            </Text>

            {/* Indicador de prioridad para notificaciones críticas */}
            {notification.priority === "critical" && (
              <View style={[styles.priorityBadge, { backgroundColor: color }]}>
                <Text style={styles.priorityText}>!</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Indicador de no leído */}
      {!notification.isRead && (
        <View style={[styles.unreadIndicator, { backgroundColor: color }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0286FF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  containerCompact: {
    padding: 12,
    marginVertical: 2,
  },

  unreadContainer: {
    backgroundColor: "#F8F9FF",
    borderLeftWidth: 5,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  contentContainer: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 20,
  },

  titleCompact: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
    lineHeight: 18,
  },

  titleUnread: {
    fontWeight: "700",
    color: "#111827",
  },

  message: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 8,
  },

  messageCompact: {
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 4,
  },

  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  priorityBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  priorityText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    top: 12,
    right: 12,
  },
});

export default NotificationItem;
