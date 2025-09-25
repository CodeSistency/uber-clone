import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDrawer, Drawer } from "@/components/drawer";

import { icons } from "../../../constants";
import { calculateRegion } from "../../../lib/map";
import { useLocationStore } from "../../../store";

// Enhanced dummy data for business dashboard
const DUMMY_BUSINESS = {
  name: "Mario's Pizza",
  rating: 4.7,
  totalReviews: 284,
  isOpen: true,
  latitude: 40.7128,
  longitude: -74.006,
  address: "123 Main St, New York, NY",
  operatingHours: "9AM - 10PM",
};

const DUMMY_TODAY_STATS = {
  revenue: 1250.75,
  orders: 47,
  avgOrderValue: 26.61,
  customers: 43,
  deliveryTime: "28 min",
  satisfaction: "94%",
};

const DUMMY_ACTIVE_ORDERS = [
  {
    id: "ORD_001",
    customerName: "John Doe",
    items: ["Margherita Pizza", "Coca Cola"],
    total: 28.5,
    status: "preparing",
    time: "5 min ago",
    estimatedTime: "15 min",
  },
  {
    id: "ORD_002",
    customerName: "Jane Smith",
    items: ["Pepperoni Pizza", "Garlic Bread"],
    total: 32.75,
    status: "ready",
    time: "12 min ago",
    estimatedTime: "Ready for pickup",
  },
  {
    id: "ORD_003",
    customerName: "Mike Johnson",
    items: ["Vegetarian Pizza", "Salad"],
    total: 24.25,
    status: "out_for_delivery",
    time: "8 min ago",
    estimatedTime: "12 min remaining",
    driver: "John D.",
  },
];

// Map markers for active deliveries and restaurant
const DUMMY_MARKERS = [
  {
    id: "restaurant",
    latitude: 40.7128,
    longitude: -74.006,
    title: "Mario's Pizza",
    description: "Your Restaurant",
    image: require("@/assets/icons/home.png"),
  },
  {
    id: "delivery_001",
    latitude: 40.7135,
    longitude: -74.0055,
    title: "John Doe - ORD_001",
    description: "En route to customer",
    image: require("@/assets/icons/map.png"),
  },
  {
    id: "delivery_002",
    latitude: 40.7142,
    longitude: -74.0072,
    title: "Jane Smith - ORD_002",
    description: "Ready for pickup",
    image: require("@/assets/icons/pin.png"),
  },
];

interface BusinessDashboardProps {
  drawer: ReturnType<typeof useDrawer>;
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ drawer }) => {
  console.log("[BusinessDashboard] Component mounted");

  const [isOpen, setIsOpen] = useState(DUMMY_BUSINESS.isOpen);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const { userLatitude, userLongitude } = useLocationStore();

  // Present bottom sheet on mount
  useEffect(() => {
    console.log("[BusinessDashboard] Presenting bottom sheet");
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.present();
      console.log("[BusinessDashboard] Bottom sheet presented successfully");
    } else {
      console.log("[BusinessDashboard] Bottom sheet ref is null");
    }
  }, []);

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
        return "text-warning-500 bg-warning-50";
      case "ready":
        return "text-success-500 bg-success-50";
      case "out_for_delivery":
        return "text-primary-500 bg-primary-50";
      default:
        return "text-secondary-600 bg-secondary-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparing":
        return "👨‍🍳";
      case "ready":
        return "✅";
      case "out_for_delivery":
        return "🚗";
      default:
        return "📦";
    }
  };

  // Calculate map region
  const region = calculateRegion({
    userLatitude: userLatitude || 40.7128,
    userLongitude: userLongitude || -74.006,
    destinationLatitude: null,
    destinationLongitude: null,
  });

  // Bottom Sheet Content for the enhanced dashboard
  const bottomSheetContent = (
    <View className="pb-8">
      {/* Header with Store Info */}
      <View className="bg-white dark:bg-brand-primary rounded-t-2xl">
        <View className="flex-row items-center justify-between p-5">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={drawer.toggle} className="mr-3">
              <View className="w-8 h-8 items-center justify-center">
                <View className="flex-col space-y-1">
                  <View className="w-5 h-0.5 bg-primary-500 rounded-full" />
                  <View className="w-5 h-0.5 bg-primary-500 rounded-full" />
                  <View className="w-5 h-0.5 bg-primary-500 rounded-full" />
                </View>
              </View>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-JakartaBold text-black dark:text-white">
                {DUMMY_BUSINESS.name}
              </Text>
              <Text className="text-secondary-600 dark:text-gray-300 mt-1">
                ⭐ {DUMMY_BUSINESS.rating} ({DUMMY_BUSINESS.totalReviews}{" "}
                reviews)
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

        {/* Store Status */}
        <View className="px-5 pb-4">
          <View className="bg-general-500 dark:bg-brand-primary rounded-lg p-3">
            <Text className="text-sm text-secondary-600 dark:text-gray-300 mb-1">
              Operating Hours
            </Text>
            <Text className="font-JakartaBold text-black dark:text-white">
              {DUMMY_BUSINESS.operatingHours}
            </Text>
          </View>
        </View>
      </View>

      {/* Today's Stats */}
      <View className="bg-white dark:bg-brand-primary px-5 py-4">
        <Text className="text-lg font-JakartaBold mb-4 text-black dark:text-white">
          Today's Performance
        </Text>

        <View className="grid grid-cols-2 gap-4 mb-4">
          <View className="items-center p-3 bg-primary-50 rounded-lg">
            <Text className="text-2xl font-JakartaExtraBold text-primary-500">
              ${DUMMY_TODAY_STATS.revenue.toLocaleString()}
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

        {/* Quick Stats Row */}
        <View className="flex-row justify-between">
          <View className="flex-1 items-center">
            <Text className="text-lg font-JakartaBold text-primary-500">
              {DUMMY_TODAY_STATS.deliveryTime}
            </Text>
            <Text className="text-xs text-secondary-600">Avg Delivery</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-lg font-JakartaBold text-success-500">
              {DUMMY_TODAY_STATS.satisfaction}
            </Text>
            <Text className="text-xs text-secondary-600">Satisfaction</Text>
          </View>
        </View>
      </View>

      {/* Active Orders */}
      <View className="bg-white dark:bg-brand-primary px-5 py-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-JakartaBold text-black dark:text-white">
            Active Orders
          </Text>
          <TouchableOpacity onPress={() => router.push("/orders" as any)}>
            <Text className="text-primary-500 font-JakartaBold">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-3">
          {DUMMY_ACTIVE_ORDERS.map((order) => (
            <View
              key={order.id}
              className="border border-general-500 dark:border-brand-primaryDark rounded-lg p-3"
            >
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <Text className="text-lg mr-2">
                    {getStatusIcon(order.status)}
                  </Text>
                  <View>
                    <Text className="font-JakartaBold text-black dark:text-white">
                      {order.customerName}
                    </Text>
                    <Text className="text-sm text-secondary-600 dark:text-gray-300">
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
                  className="text-sm text-secondary-600 dark:text-gray-300 flex-1"
                  numberOfLines={1}
                >
                  {order.items.join(", ")}
                </Text>
                <View
                  className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}
                >
                  <Text className="text-xs font-JakartaBold">
                    {order.status.replace("_", " ").toUpperCase()}
                  </Text>
                </View>
              </View>

              {order.driver && (
                <Text className="text-sm text-primary-500 mt-1">
                  Driver: {order.driver}
                </Text>
              )}

              <Text className="text-sm text-success-500 mt-1">
                {order.estimatedTime}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-brand-primary dark:bg-brand-primaryDark px-5 py-4">
        <Text className="text-lg font-JakartaBold mb-4 text-black dark:text-white">
          Quick Actions
        </Text>
        <View className="grid grid-cols-2 gap-3">
          <TouchableOpacity
            onPress={() => router.push("/menu" as any)}
            className="flex-row items-center p-3 bg-general-500 rounded-lg"
          >
            <Text className="text-lg mr-3">🍕</Text>
            <Text className="font-JakartaMedium">Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/analytics" as any)}
            className="flex-row items-center p-3 bg-general-500 rounded-lg"
          >
            <Text className="text-lg mr-3">📊</Text>
            <Text className="font-JakartaMedium">Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/orders" as any)}
            className="flex-row items-center p-3 bg-general-500 rounded-lg"
          >
            <Text className="text-lg mr-3">📦</Text>
            <Text className="font-JakartaMedium">Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
            <Text className="text-lg mr-3">⚙️</Text>
            <Text className="font-JakartaMedium">Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <BottomSheetModalProvider>
      <SafeAreaView className="flex-1 bg-general-500">
        {/* Header con drawer */}
        <View className="flex-row items-center justify-between p-4 bg-brand-primary dark:bg-brand-primaryDark shadow-sm z-10 border-b border-secondary-300 dark:border-secondary-600">
          <TouchableOpacity onPress={drawer.toggle} className="p-2">
            <Text className="text-2xl text-secondary-700 dark:text-secondary-300">
              ☰
            </Text>
          </TouchableOpacity>
          <Text className="text-lg font-JakartaBold text-secondary-700 dark:text-secondary-300">
            Business Dashboard
          </Text>
          <TouchableOpacity className="p-2">
            <Text className="text-xl text-secondary-700 dark:text-secondary-300">
              🔔
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map Container - 40% height */}
        <View style={{ height: "40%" }} className="relative">
          <MapView
            provider={PROVIDER_DEFAULT}
            className="w-full h-full"
            region={region}
            showsUserLocation={true}
            showsPointsOfInterest={false}
          >
            {/* Restaurant marker */}
            {DUMMY_MARKERS.map((marker, index) => (
              <Marker
                key={marker.id}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={marker.title}
                description={marker.description}
                image={marker.image}
              />
            ))}
          </MapView>
        </View>

        {/* Bottom Sheet Modal */}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={["60%"]}
          enablePanDownToClose={false}
          backgroundStyle={{
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          handleIndicatorStyle={{
            backgroundColor: "#E5E5E5",
            width: 40,
            height: 4,
          }}
        >
          <BottomSheetView className="flex-1 px-5 pt-2">
            <ScrollView showsVerticalScrollIndicator={false}>
              {bottomSheetContent}
            </ScrollView>
          </BottomSheetView>
        </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

// Componente del drawer business separado para estar encima de todo
const DrawerBusiness: React.FC<{
  drawerState?: ReturnType<typeof useDrawer>;
}> = ({ drawerState }) => {
  // Si se proporciona drawerState, úsalo. Si no, crea uno nuevo.
  const drawer = drawerState || useDrawer({ module: "business" });

  return (
    <Drawer
      config={drawer.config}
      isOpen={drawer.isOpen}
      activeRoute={drawer.activeRoute}
      expandedRoutes={drawer.expandedRoutes}
      currentModule={drawer.currentModule}
      isTransitioning={drawer.isTransitioning}
      onRoutePress={drawer.handleRoutePress}
      onToggleExpanded={drawer.toggleExpanded}
      onClose={drawer.close}
      onModuleChange={drawer.switchModule}
    />
  );
};

// Hook para compartir el estado del drawer entre componentes
const useBusinessDrawer = () => {
  return useDrawer({ module: "business" });
};

const BusinessDashboardWithDrawer: React.FC = () => {
  const drawer = useBusinessDrawer();

  return (
    <>
      <BusinessDashboard drawer={drawer} />
      <DrawerBusiness drawerState={drawer} />
    </>
  );
};

export default BusinessDashboardWithDrawer;
