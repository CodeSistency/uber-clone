import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NotificationItem from "./NotificationItem";
import {
  ExpoNotificationData,
  ExpoNotificationType,
} from "../../types/expo-notifications";
import { useExpoNotifications } from "@/app/hooks/expo-notifications";

interface NotificationListProps {
  onNotificationPress?: (notification: ExpoNotificationData) => void;
  onRefresh?: () => Promise<void>;
  emptyMessage?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  maxHeight?: number;
}

/**
 * Componente para mostrar una lista de notificaciones
 * Incluye filtros, búsqueda, estados vacíos y refresh
 */
const NotificationList: React.FC<NotificationListProps> = ({
  onNotificationPress,
  onRefresh,
  emptyMessage = "No notifications yet",
  showSearch = true,
  showFilters = true,
  maxHeight,
}) => {
  const { notifications, markAsRead, clearNotifications } =
    useExpoNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    ExpoNotificationType | "all"
  >("all");

  // Filtros y búsqueda
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filtrar por tipo
    if (selectedFilter !== "all") {
      filtered = filtered.filter(
        (notification) => notification.type === selectedFilter,
      );
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query),
      );
    }

    // Ordenar por fecha (más recientes primero)
    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }, [notifications, selectedFilter, searchQuery]);

  // Filtros disponibles basados en notificaciones existentes
  const availableFilters = useMemo(() => {
    const types = new Set(notifications.map((n) => n.type));
    return ["all" as const, ...Array.from(types)];
  }, [notifications]);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotificationPress = (notification: ExpoNotificationData) => {
    // Marcar como leída automáticamente
    markAsRead(notification.id);

    // Callback personalizado
    onNotificationPress?.(notification);
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

  const renderNotification = ({ item }: { item: ExpoNotificationData }) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
      showTimestamp={true}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🔔</Text>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyMessage}>{emptyMessage}</Text>
    </View>
  );

  const renderFilterButton = (filter: ExpoNotificationType | "all") => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {filter === "all" ? "All" : filter.replace("_", " ")}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con acciones */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Barra de búsqueda */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search notifications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      )}

      {/* Filtros */}
      {showFilters && availableFilters.length > 1 && (
        <View style={styles.filtersContainer}>
          {availableFilters.map(renderFilterButton)}
        </View>
      )}

      {/* Lista de notificaciones */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0286FF"
            />
          ) : undefined
        }
        style={[styles.list, maxHeight ? { maxHeight } : undefined]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredNotifications.length === 0 ? styles.emptyList : undefined
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },

  clearButton: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },

  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },

  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#F3F4F6",
  },

  filterButtonActive: {
    backgroundColor: "#0286FF",
  },

  filterButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "capitalize",
  },

  filterButtonTextActive: {
    color: "#FFFFFF",
  },

  list: {
    flex: 1,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },

  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },

  emptyMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default NotificationList;
