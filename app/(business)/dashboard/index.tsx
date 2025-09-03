import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DrawerContent, { HamburgerMenu } from "../../components/DrawerContent";

// Dummy data for business dashboard
const DUMMY_BUSINESS = {
  name: "Mario's Pizza",
  rating: 4.7,
  totalReviews: 284,
  isOpen: true,
};

const DUMMY_TODAY_STATS = {
  revenue: 1250.75,
  orders: 47,
  avgOrderValue: 26.61,
  customers: 43,
};

const DUMMY_RECENT_ORDERS = [
  {
    id: "ORD_001",
    customerName: "John Doe",
    items: ["Margherita Pizza", "Coca Cola"],
    total: 28.5,
    status: "preparing",
    time: "5 min ago",
  },
  {
    id: "ORD_002",
    customerName: "Jane Smith",
    items: ["Pepperoni Pizza", "Garlic Bread"],
    total: 32.75,
    status: "ready",
    time: "12 min ago",
  },
  {
    id: "ORD_003",
    customerName: "Mike Johnson",
    items: ["Vegetarian Pizza", "Salad"],
    total: 24.25,
    status: "delivered",
    time: "25 min ago",
  },
];

const BusinessDashboard = () => {
  const [isOpen, setIsOpen] = useState(DUMMY_BUSINESS.isOpen);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState<
    "customer" | "driver" | "business"
  >("business");

  // Load current mode from AsyncStorage
  useEffect(() => {
    const loadCurrentMode = async () => {
      try {
        const savedMode = (await AsyncStorage.getItem("user_mode")) as
          | "customer"
          | "driver"
          | "business"
          | null;
        if (savedMode) {
          setCurrentMode(savedMode);
        }
      } catch (error) {
        console.error("Error loading current mode:", error);
      }
    };
    loadCurrentMode();
  }, []);

  // Function to handle mode changes from drawer
  const handleModeChange = (newMode: "customer" | "driver" | "business") => {
    console.log("Mode changed from business dashboard to:", newMode);
    setCurrentMode(newMode);
    setDrawerVisible(false);
  };

  const handleToggleStore = () => {
    setIsOpen(!isOpen);
    Alert.alert(
      "Store Status Updated",
      `Your store is now ${!isOpen ? "open" : "closed"}.`,
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "text-warning-500";
      case "ready":
        return "text-success-500";
      case "delivered":
        return "text-primary-500";
      default:
        return "text-secondary-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparing":
        return "👨‍🍳";
      case "ready":
        return "✅";
      case "delivered":
        return "🚚";
      default:
        return "📦";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header with Hamburger Menu and Store Toggle */}
      <View className="flex-row items-center justify-between p-5 bg-white">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            className="mr-3"
          >
            <View className="w-8 h-8 items-center justify-center">
              <View className="flex-col space-y-1">
                <View className="w-5 h-0.5 bg-primary-500 rounded-full" />
                <View className="w-5 h-0.5 bg-primary-500 rounded-full" />
                <View className="w-5 h-0.5 bg-primary-500 rounded-full" />
              </View>
            </View>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-JakartaBold">
              {DUMMY_BUSINESS.name}
            </Text>
            <Text className="text-secondary-600 mt-1">
              ⭐ {DUMMY_BUSINESS.rating} ({DUMMY_BUSINESS.totalReviews} reviews)
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleToggleStore}
          className={`px-4 py-2 rounded-full ${isOpen ? "bg-success-500" : "bg-danger-500"}`}
        >
          <Text className="text-white font-JakartaBold">
            {isOpen ? "Open" : "Closed"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Drawer Modal */}
      <DrawerContent
        visible={drawerVisible}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onClose={() => {
          console.log("Business drawer closed");
          setDrawerVisible(false);
        }}
      />

      <ScrollView className="flex-1 px-5">
        {/* Today's Stats */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">
            Today's Performance
          </Text>

          <View className="grid grid-cols-2 gap-4">
            <View className="items-center p-3 bg-primary-50 rounded-lg">
              <Text className="text-2xl font-JakartaExtraBold text-primary-500">
                ${DUMMY_TODAY_STATS.revenue}
              </Text>
              <Text className="text-sm text-secondary-600">Revenue</Text>
            </View>

            <View className="items-center p-3 bg-success-50 rounded-lg">
              <Text className="text-2xl font-JakartaExtraBold text-success-500">
                {DUMMY_TODAY_STATS.orders}
              </Text>
              <Text className="text-sm text-secondary-600">Orders</Text>
            </View>

            <View className="items-center p-3 bg-warning-50 rounded-lg">
              <Text className="text-2xl font-JakartaExtraBold text-warning-500">
                ${DUMMY_TODAY_STATS.avgOrderValue}
              </Text>
              <Text className="text-sm text-secondary-600">Avg Order</Text>
            </View>

            <View className="items-center p-3 bg-secondary-100 rounded-lg">
              <Text className="text-2xl font-JakartaExtraBold text-secondary-700">
                {DUMMY_TODAY_STATS.customers}
              </Text>
              <Text className="text-sm text-secondary-600">Customers</Text>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-JakartaBold">Recent Orders</Text>
            <TouchableOpacity
              onPress={() => router.push("/(business)/orders" as any)}
            >
              <Text className="text-primary-500 font-JakartaBold">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {DUMMY_RECENT_ORDERS.map((order) => (
            <View
              key={order.id}
              className="border-b border-general-500 py-3 last:border-b-0"
            >
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <Text className="text-lg mr-2">
                    {getStatusIcon(order.status)}
                  </Text>
                  <View>
                    <Text className="font-JakartaBold">
                      {order.customerName}
                    </Text>
                    <Text className="text-sm text-secondary-600">
                      {order.time}
                    </Text>
                  </View>
                </View>
                <Text className="font-JakartaBold text-primary-500">
                  ${order.total}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text
                  className="text-sm text-secondary-600 flex-1"
                  numberOfLines={1}
                >
                  {order.items.join(", ")}
                </Text>
                <Text
                  className={`text-sm font-JakartaBold ${getStatusColor(order.status)}`}
                >
                  {order.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Quick Actions</Text>
          <View className="space-y-3">
            <TouchableOpacity
              onPress={() => router.push("/(business)/menu" as any)}
              className="flex-row items-center p-3 bg-general-500 rounded-lg"
            >
              <Text className="text-lg mr-3">🍕</Text>
              <Text className="font-JakartaMedium">Update Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(business)/analytics" as any)}
              className="flex-row items-center p-3 bg-general-500 rounded-lg"
            >
              <Text className="text-lg mr-3">📊</Text>
              <Text className="font-JakartaMedium">View Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">⚙️</Text>
              <Text className="font-JakartaMedium">Store Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Items Today */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">
            Popular Items Today
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🍕</Text>
                <Text className="font-JakartaMedium">Margherita Pizza</Text>
              </View>
              <Text className="text-success-500 font-JakartaBold">18 sold</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🌶️</Text>
                <Text className="font-JakartaMedium">Pepperoni Pizza</Text>
              </View>
              <Text className="text-success-500 font-JakartaBold">15 sold</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🥤</Text>
                <Text className="font-JakartaMedium">Coca Cola</Text>
              </View>
              <Text className="text-success-500 font-JakartaBold">12 sold</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessDashboard;
