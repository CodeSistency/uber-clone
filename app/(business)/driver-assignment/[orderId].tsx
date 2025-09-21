import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MapViewWithBottomSheet from "../../../components/MapViewWithBottomSheet";

// Dummy data for driver assignment
const DUMMY_ORDER = {
  id: "ORD_1024",
  customerName: "Sarah Johnson",
  items: ["Margherita Pizza", "Caesar Salad"],
  total: 24.75,
  deliveryAddress: "456 Broadway Ave, Floor 3",
  latitude: 40.7589,
  longitude: -73.9851,
};

const DUMMY_AVAILABLE_DRIVERS = [
  {
    id: "DRV_001",
    name: "John Driver",
    rating: 4.9,
    totalDeliveries: 1247,
    vehicle: "Toyota Camry",
    currentLocation: { latitude: 40.7128, longitude: -74.006 },
    distance: 2.1,
    eta: 8,
    fee: 3.99,
    status: "available",
  },
  {
    id: "DRV_002",
    name: "Sarah Martinez",
    rating: 4.7,
    totalDeliveries: 892,
    vehicle: "Honda Civic",
    currentLocation: { latitude: 40.758, longitude: -73.9857 },
    distance: 0.3,
    eta: 3,
    fee: 4.5,
    status: "available",
  },
  {
    id: "DRV_003",
    name: "Mike Rodriguez",
    rating: 4.8,
    totalDeliveries: 1567,
    vehicle: "Nissan Altima",
    currentLocation: { latitude: 40.7505, longitude: -73.9934 },
    distance: 1.2,
    eta: 5,
    fee: 3.5,
    status: "available",
  },
  {
    id: "DRV_004",
    name: "Emma Wilson",
    rating: 4.6,
    totalDeliveries: 634,
    vehicle: "Ford Focus",
    currentLocation: { latitude: 40.73, longitude: -74.01 },
    distance: 3.8,
    eta: 15,
    fee: 5.25,
    status: "available",
  },
];

// Map markers for drivers and delivery location
const getMapMarkers = (drivers: typeof DUMMY_AVAILABLE_DRIVERS) => [
  // Delivery location
  {
    id: "delivery_location",
    latitude: DUMMY_ORDER.latitude,
    longitude: DUMMY_ORDER.longitude,
    title: `${DUMMY_ORDER.customerName} - ${DUMMY_ORDER.id}`,
    description: DUMMY_ORDER.deliveryAddress,
    image: require("@/assets/icons/pin.png"),
  },
  // Restaurant location
  {
    id: "restaurant",
    latitude: 40.7128,
    longitude: -74.006,
    title: "Mario's Pizza",
    description: "Restaurant Location",
    image: require("@/assets/icons/home.png"),
  },
  // Available drivers
  ...drivers.map((driver, index) => ({
    id: `driver_${driver.id}`,
    latitude: driver.currentLocation.latitude,
    longitude: driver.currentLocation.longitude,
    title: `${driver.name}`,
    description: `${driver.vehicle} • ${driver.distance}mi • ${driver.eta}min`,
    image: require("@/assets/icons/map.png"),
  })),
];

const DriverAssignmentScreen = () => {
  const { orderId } = useLocalSearchParams();
  const [availableDrivers, setAvailableDrivers] = useState(
    DUMMY_AVAILABLE_DRIVERS,
  );
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [autoAssignProgress, setAutoAssignProgress] = useState(0);

  // Simulate auto-assignment process
  const handleAutoAssign = async () => {
    setIsAutoAssigning(true);
    setAutoAssignProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAutoAssignProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsAutoAssigning(false);

          // Auto-select best driver (closest with highest rating)
          const bestDriver = availableDrivers.reduce((best, current) => {
            if (
              current.distance < best.distance ||
              (current.distance === best.distance &&
                current.rating > best.rating)
            ) {
              return current;
            }
            return best;
          });

          setSelectedDriver(bestDriver.id);
          Alert.alert(
            "Driver Assigned!",
            `${bestDriver.name} has been assigned to deliver order ${orderId}`,
            [{ text: "OK", onPress: () => router.back() }],
          );
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleManualAssign = (driverId: string) => {
    const driver = availableDrivers.find((d) => d.id === driverId);
    if (driver) {
      Alert.alert(
        "Confirm Assignment",
        `Assign ${driver.name} to deliver order ${orderId}?\n\nDelivery Fee: $${driver.fee}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Assign",
            onPress: () => {
              setSelectedDriver(driverId);
              Alert.alert(
                "Driver Assigned!",
                `${driver.name} has been assigned to deliver order ${orderId}`,
                [{ text: "OK", onPress: () => router.back() }],
              );
            },
          },
        ],
      );
    }
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-success-500 bg-success-50";
      case "busy":
        return "text-warning-500 bg-warning-50";
      default:
        return "text-secondary-600 bg-secondary-50";
    }
  };

  // Sort drivers by distance and rating
  const sortedDrivers = [...availableDrivers].sort((a, b) => {
    // Primary: distance
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    // Secondary: rating
    return b.rating - a.rating;
  });

  const mapMarkers = getMapMarkers(sortedDrivers);

  // Bottom Sheet Content
  const bottomSheetContent = (
    <View className="pb-8">
      {/* Header */}
      <View className="bg-white rounded-t-2xl p-5">
        <Text className="text-xl font-JakartaBold mb-2">Assign Driver</Text>
        <View className="bg-general-500 rounded-lg p-3">
          <Text className="font-JakartaBold">{DUMMY_ORDER.customerName}</Text>
          <Text className="text-sm text-secondary-600">{DUMMY_ORDER.id}</Text>
          <Text className="text-sm text-secondary-600 mt-1">
            {DUMMY_ORDER.items.join(", ")}
          </Text>
          <Text className="text-sm text-secondary-600">
            📍 {DUMMY_ORDER.deliveryAddress}
          </Text>
        </View>
      </View>

      {/* Auto Assignment Section */}
      <View className="bg-white px-5 py-4">
        <TouchableOpacity
          onPress={handleAutoAssign}
          disabled={isAutoAssigning}
          className={`bg-primary-500 rounded-lg p-4 items-center ${
            isAutoAssigning ? "opacity-50" : ""
          }`}
        >
          <Text className="text-white font-JakartaBold text-lg">
            🤖{" "}
            {isAutoAssigning ? "Finding Best Driver..." : "Auto-Assign Driver"}
          </Text>
          {isAutoAssigning && (
            <View className="w-full bg-primary-200 rounded-full h-2 mt-3">
              <View
                className="bg-white h-2 rounded-full"
                style={{ width: `${autoAssignProgress}%` }}
              />
            </View>
          )}
          {!isAutoAssigning && (
            <Text className="text-primary-100 text-sm mt-1">
              Smart matching based on distance, rating & availability
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-secondary-600">───── or ─────</Text>
        </View>
      </View>

      {/* Manual Selection */}
      <View className="bg-white px-5 py-4">
        <Text className="text-lg font-JakartaBold mb-4">Available Drivers</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="space-y-3">
            {sortedDrivers.map((driver, index) => (
              <TouchableOpacity
                key={driver.id}
                onPress={() => handleManualAssign(driver.id)}
                className={`border rounded-lg p-4 ${
                  selectedDriver === driver.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-general-500 bg-white"
                }`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="font-JakartaBold mr-2">
                        {driver.name}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full ${getDriverStatusColor(driver.status)}`}
                      >
                        <Text className="text-xs font-JakartaBold">
                          {driver.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-secondary-600">
                      ⭐ {driver.rating} • {driver.totalDeliveries} deliveries
                    </Text>
                    <Text className="text-sm text-secondary-600">
                      🚗 {driver.vehicle}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="font-JakartaBold text-primary-500">
                      ${driver.fee}
                    </Text>
                    <Text className="text-xs text-secondary-600">fee</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-sm text-secondary-600 mr-3">
                      📍 {driver.distance} miles
                    </Text>
                    <Text className="text-sm text-secondary-600">
                      ⏱️ {driver.eta} min ETA
                    </Text>
                  </View>

                  {index === 0 && (
                    <View className="bg-success-100 px-2 py-1 rounded-full">
                      <Text className="text-xs font-JakartaBold text-success-600">
                        BEST MATCH
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View className="bg-white px-5 py-4">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-general-500 rounded-full py-3 items-center"
          >
            <Text className="font-JakartaBold text-secondary-700">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (selectedDriver) {
                const driver = availableDrivers.find(
                  (d) => d.id === selectedDriver,
                );
                Alert.alert(
                  "Confirm Assignment",
                  `Assign ${driver?.name} to deliver order ${orderId}?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Confirm",
                      onPress: () => {
                        Alert.alert(
                          "Driver Assigned!",
                          `${driver?.name} has been assigned to deliver order ${orderId}`,
                          [{ text: "OK", onPress: () => router.back() }],
                        );
                      },
                    },
                  ],
                );
              }
            }}
            disabled={!selectedDriver}
            className={`flex-1 rounded-full py-3 items-center ${
              selectedDriver ? "bg-primary-500" : "bg-general-500"
            }`}
          >
            <Text
              className={`font-JakartaBold ${
                selectedDriver ? "text-white" : "text-secondary-600"
              }`}
            >
              Assign Selected
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <MapViewWithBottomSheet
        markers={mapMarkers}
        mapHeight={50}
        bottomSheetHeight={50}
        bottomSheetContent={bottomSheetContent}
        showUserLocation={false}
        snapPoints={["40%", "60%", "80%"]}
      />
    </SafeAreaView>
  );
};

export default DriverAssignmentScreen;
