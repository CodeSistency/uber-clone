import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import MapViewWithBottomSheet from '../../../components/MapViewWithBottomSheet';

// Dummy data for order fulfillment
const DUMMY_ORDER = {
  id: "ORD_1024",
  customerName: "Sarah Johnson",
  customerPhone: "+1234567890",
  items: ["Margherita Pizza", "Caesar Salad"],
  total: 24.75,
  deliveryAddress: "456 Broadway Ave, Floor 3",
  latitude: 40.7589,
  longitude: -73.9851,
  status: "out_for_delivery",
  estimatedDelivery: "12 min",
  driver: {
    id: "DRV_001",
    name: "John Driver",
    phone: "+1987654321",
    rating: 4.9,
    vehicle: "Toyota Camry",
  },
};

// Simulate driver movement
const simulateDriverMovement = () => {
  const positions = [
    { latitude: 40.7128, longitude: -74.0060, progress: 0 }, // Restaurant
    { latitude: 40.7200, longitude: -74.0020, progress: 25 },
    { latitude: 40.7300, longitude: -73.9980, progress: 50 },
    { latitude: 40.7400, longitude: -73.9940, progress: 75 },
    { latitude: 40.7589, longitude: -73.9851, progress: 100 }, // Customer
  ];

  return positions;
};

const OrderFulfillmentScreen = () => {
  const { orderId } = useLocalSearchParams();
  const [driverPosition, setDriverPosition] = useState({ latitude: 40.7128, longitude: -74.0060 });
  const [deliveryProgress, setDeliveryProgress] = useState(25);
  const [estimatedTime, setEstimatedTime] = useState("12 min");
  const [isDelivered, setIsDelivered] = useState(false);

  // Simulate real-time driver movement
  useEffect(() => {
    const positions = simulateDriverMovement();
    let currentIndex = 1;

    const movementInterval = setInterval(() => {
      if (currentIndex < positions.length) {
        const position = positions[currentIndex];
        setDriverPosition({
          latitude: position.latitude,
          longitude: position.longitude,
        });
        setDeliveryProgress(position.progress);

        // Update estimated time based on progress
        const remainingTime = Math.max(1, Math.round((100 - position.progress) * 0.12));
        setEstimatedTime(`${remainingTime} min`);

        currentIndex++;
      } else {
        // Delivery completed
        setIsDelivered(true);
        setDeliveryProgress(100);
        setEstimatedTime("Delivered");
        clearInterval(movementInterval);

        Alert.alert(
          "Order Delivered!",
          "The order has been successfully delivered to the customer.",
          [
            {
              text: "View Receipt",
              onPress: () => router.replace("/(business)/dashboard" as any)
            }
          ]
        );
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(movementInterval);
  }, []);

  const handleCallDriver = () => {
    Alert.alert("Call Driver", `Calling ${DUMMY_ORDER.driver.name}...`);
  };

  const handleMessageDriver = () => {
    Alert.alert("Message Driver", "Open chat with driver functionality");
  };

  const handleMarkDelivered = () => {
    Alert.alert(
      "Mark as Delivered",
      "Are you sure the order has been delivered?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            setIsDelivered(true);
            setDeliveryProgress(100);
            setEstimatedTime("Delivered");
            router.back();
          }
        }
      ]
    );
  };

  // Map markers
  const mapMarkers = [
    // Restaurant
    {
      id: "restaurant",
      latitude: 40.7128,
      longitude: -74.0060,
      title: "Mario's Pizza",
      description: "Order Pickup Location",
      image: require("@/assets/icons/home.png"),
    },
    // Customer delivery location
    {
      id: "delivery",
      latitude: DUMMY_ORDER.latitude,
      longitude: DUMMY_ORDER.longitude,
      title: `${DUMMY_ORDER.customerName}`,
      description: DUMMY_ORDER.deliveryAddress,
      image: require("@/assets/icons/pin.png"),
    },
    // Driver current location
    {
      id: "driver",
      latitude: driverPosition.latitude,
      longitude: driverPosition.longitude,
      title: `${DUMMY_ORDER.driver.name}`,
      description: `${DUMMY_ORDER.driver.vehicle} • ${estimatedTime}`,
      image: require("@/assets/icons/map.png"),
    },
  ];

  // Route coordinates (simplified)
  const routeCoordinates = [
    { latitude: 40.7128, longitude: -74.0060 }, // Restaurant
    { latitude: 40.7200, longitude: -74.0020 },
    { latitude: 40.7300, longitude: -73.9980 },
    { latitude: 40.7400, longitude: -73.9940 },
    { latitude: 40.7589, longitude: -73.9851 }, // Customer
  ];

  // Bottom Sheet Content
  const bottomSheetContent = (
    <View className="pb-8">
      {/* Header with Order Info */}
      <View className="bg-white rounded-t-2xl p-5">
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-xl font-JakartaBold">{DUMMY_ORDER.id}</Text>
            <Text className="text-secondary-600">{DUMMY_ORDER.customerName}</Text>
          </View>
          <View className="bg-primary-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-JakartaBold">
              OUT FOR DELIVERY
            </Text>
          </View>
        </View>

        <View className="bg-general-500 rounded-lg p-3">
          <Text className="text-sm text-secondary-600">
            {DUMMY_ORDER.items.join(", ")}
          </Text>
          <Text className="font-JakartaBold mt-1">${DUMMY_ORDER.total}</Text>
        </View>
      </View>

      {/* Delivery Progress */}
      <View className="bg-white px-5 py-4">
        <Text className="text-lg font-JakartaBold mb-4">Delivery Progress</Text>

        {/* Progress Bar */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-secondary-600">Progress</Text>
            <Text className="font-JakartaBold text-primary-500">
              {deliveryProgress}%
            </Text>
          </View>
          <View className="w-full bg-general-500 rounded-full h-3">
            <View
              className="bg-primary-500 h-3 rounded-full"
              style={{ width: `${deliveryProgress}%` }}
            />
          </View>
        </View>

        {/* Estimated Time */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-sm text-secondary-600">Estimated Time</Text>
            <Text className="text-2xl font-JakartaExtraBold text-primary-500">
              {estimatedTime}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-sm text-secondary-600">Driver</Text>
            <Text className="font-JakartaBold">{DUMMY_ORDER.driver.name}</Text>
            <Text className="text-sm text-secondary-600">
              ⭐ {DUMMY_ORDER.driver.rating}
            </Text>
          </View>
        </View>
      </View>

      {/* Driver Information */}
      <View className="bg-white px-5 py-4">
        <Text className="text-lg font-JakartaBold mb-4">Driver Information</Text>

        <View className="bg-general-500 rounded-lg p-4">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="font-JakartaBold">{DUMMY_ORDER.driver.name}</Text>
              <Text className="text-sm text-secondary-600">
                🚗 {DUMMY_ORDER.driver.vehicle}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-JakartaBold text-primary-500">
                ${DUMMY_ORDER.total}
              </Text>
              <Text className="text-xs text-secondary-600">Order Total</Text>
            </View>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleCallDriver}
              className="flex-1 bg-primary-500 rounded-full py-2 items-center"
            >
              <Text className="text-white font-JakartaBold text-sm">📞 Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleMessageDriver}
              className="flex-1 bg-success-500 rounded-full py-2 items-center"
            >
              <Text className="text-white font-JakartaBold text-sm">💬 Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Customer Information */}
      <View className="bg-white px-5 py-4">
        <Text className="text-lg font-JakartaBold mb-4">Delivery Details</Text>

        <View className="bg-general-500 rounded-lg p-4">
          <Text className="font-JakartaBold mb-1">{DUMMY_ORDER.customerName}</Text>
          <Text className="text-sm text-secondary-600 mb-2">
            📞 {DUMMY_ORDER.customerPhone}
          </Text>
          <Text className="text-sm text-secondary-600">
            📍 {DUMMY_ORDER.deliveryAddress}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="bg-white px-5 py-4">
        <TouchableOpacity
          onPress={handleMarkDelivered}
          disabled={isDelivered}
          className={`rounded-full py-3 items-center ${
            isDelivered ? "bg-success-500" : "bg-primary-500"
          }`}
        >
          <Text className="text-white font-JakartaBold text-lg">
            {isDelivered ? "✅ Order Delivered" : "Mark as Delivered"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <MapViewWithBottomSheet
        markers={mapMarkers}
        routeCoordinates={routeCoordinates}
        mapHeight={50}
        bottomSheetHeight={50}
        bottomSheetContent={bottomSheetContent}
        showUserLocation={false}
        snapPoints={["30%", "50%", "70%"]}
      />
    </SafeAreaView>
  );
};

export default OrderFulfillmentScreen;
