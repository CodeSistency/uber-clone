import { router } from "expo-router";
import { useState } from "react";
import { FlatList, View, Text, TouchableOpacity, Image } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import Map from "@/components/Map";
import ServiceLevelSelector from "@/components/ServiceLevelSelector";
import { fetchAPI } from "@/lib/fetch";
import { useDriverStore, useLocationStore, useUserStore } from "@/store";
import { icons } from "@/constants";

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  const { user } = useUserStore();
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  // Tier selection state
  const [selectedTierId, setSelectedTierId] = useState<number>(1); // Default to Economy

  // Available ride tiers
  const rideTiers = [
    {
      id: 1,
      name: "Economy",
      baseFare: 2.50,
      perMinuteRate: 0.15,
      perMileRate: 1.25,
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100",
      description: "Affordable rides"
    },
    {
      id: 2,
      name: "Comfort",
      baseFare: 4.00,
      perMinuteRate: 0.25,
      perMileRate: 2.00,
      imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100",
      description: "More space, premium cars"
    },
    {
      id: 3,
      name: "Premium",
      baseFare: 6.00,
      perMinuteRate: 0.35,
      perMileRate: 3.00,
      imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100",
      description: "Luxury experience"
    }
  ];

  const selectedDriverData = drivers?.find(
    (driver) => driver.id === selectedDriver,
  );

  const selectedTier = rideTiers.find(tier => tier.id === selectedTierId);

  // Calculate fare based on selected tier and driver time
  const calculateFare = () => {
    if (!selectedDriverData || !selectedTier) return 0;

    const time = selectedDriverData.time || 30; // Default 30 minutes
    const baseFare = selectedTier.baseFare;
    const perMinuteRate = selectedTier.perMinuteRate;

    const totalFare = baseFare + (time * perMinuteRate);
    return Math.round(totalFare * 100) / 100; // Round to 2 decimal places
  };

  console.log("[ConfirmRide] Component state:", {
    driversCount: drivers?.length,
    selectedDriver,
    selectedDriverData,
    userId: user?.id,
  });

  const handleConfirmRide = async () => {
    console.log("[ConfirmRide] Starting ride confirmation process...");
    console.log("[ConfirmRide] Selected driver ID:", selectedDriver);
    console.log("[ConfirmRide] Available drivers:", drivers?.length);
    console.log("[ConfirmRide] User ID:", user?.id);
    console.log("[ConfirmRide] Selected driver data:", selectedDriverData);

    if (!selectedDriverData || !user?.id) {
      console.error("[ConfirmRide] Missing driver data or user ID");
      console.error("[ConfirmRide] selectedDriverData:", selectedDriverData);
      console.error("[ConfirmRide] userId:", user?.id);
      return;
    }

    if (
      !userAddress ||
      !destinationAddress ||
      !userLatitude ||
      !destinationLatitude
    ) {
      console.error("[ConfirmRide] Missing location data");
      console.error("[ConfirmRide] userAddress:", userAddress);
      console.error("[ConfirmRide] destinationAddress:", destinationAddress);
      console.error("[ConfirmRide] userLatitude:", userLatitude);
      console.error("[ConfirmRide] destinationLatitude:", destinationLatitude);
      return;
    }

    try {
      console.log(
        "[ConfirmRide] Creating ride without payment for debugging...",
      );

      const calculatedFare = calculateFare();

      const rideData = {
        origin_address: userAddress,
        destination_address: destinationAddress,
        origin_latitude: userLatitude,
        origin_longitude: userLongitude,
        destination_latitude: destinationLatitude,
        destination_longitude: destinationLongitude,
        ride_time: selectedDriverData.time?.toFixed(0) || "30", // Default 30 mins
        fare_price: calculatedFare,
        payment_status: "paid", // Testing with paid status
        driver_id: selectedDriverData.id,
        user_id: user?.id,
        tier_id: selectedTierId, // Use selected tier
      };

      console.log("[ConfirmRide] Ride data to send:", {
        ...rideData,
        selectedTier: selectedTier?.name,
        calculatedFare
      });

      const response = await fetchAPI("ride/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rideData),
      });

      console.log("[ConfirmRide] API Response:", response);
      console.log("[ConfirmRide] Addresses in response:", {
        origin: response?.origin_address,
        destination: response?.destination_address,
      });
      console.log("[ConfirmRide] Ride created successfully without payment");
      router.push("/(root)/(tabs)/rides" as any);
    } catch (error) {
      console.error("[ConfirmRide] Error creating ride:", error);
      // Still navigate to rides page even if there's an error
      router.push("/(root)/(tabs)/rides" as any);
    }
  };

  console.log("[ConfirmRide] All drivers in store:", {
    driversCount: drivers?.length,
    drivers: drivers?.map(d => ({
      id: d.id,
      title: d.title,
      firstName: d.first_name,
      lastName: d.last_name,
      keys: Object.keys(d)
    }))
  });

  return (
    <View className="flex-1 bg-general-500">
      {/* Mapa visible ocupando 40% superior */}
      <View className="flex-1 relative">
        <Map />

        {/* Información flotante sobre el mapa */}
        <View className="absolute top-12 left-4 right-4 z-10">
          <View className="bg-white rounded-lg p-4 shadow-lg">
            <Text className="text-lg font-JakartaBold mb-2">Available drivers ({drivers?.length || 0})</Text>
            <Text className="text-sm text-gray-600">Auto-select in: 15s ⏱️</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet con selección (60% inferior) */}
      <View className="bg-white rounded-t-3xl p-6" style={{ height: '60%' }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-JakartaBold">Choose a Rider</Text>
          <TouchableOpacity>
            <Image source={icons.close} className="w-6 h-6" />
          </TouchableOpacity>
        </View>

        {/* Service Level Selector */}
        <ServiceLevelSelector
          selectedServiceLevel={selectedTierId}
          onSelectServiceLevel={setSelectedTierId}
          estimatedDistance={5.2}
          estimatedTime={18}
          continueLabel="Continue to Drivers"
          onContinue={() => {
            // Expandir sheet para mostrar drivers
            sheetApiRef.current?.snapToIndex(1);
            setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 50);
          }}
        />

        {/* Drivers List */}
        <View className="mt-4 flex-1">
          <Text className="text-lg font-JakartaSemiBold mb-3">Available Drivers</Text>
          <FlatList
            data={drivers}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              console.log("[ConfirmRide] Rendering DriverCard:", {
                index,
                driverId: item.id,
                driverTitle: item.title,
                driverKeys: Object.keys(item),
                firstName: item.first_name,
                lastName: item.last_name,
                selectedDriver,
                isSelected: selectedDriver === item.id,
              });

              return (
                <DriverCard
                  item={item}
                  selected={selectedDriver!}
                  setSelected={() => {
                    console.log(
                      "[ConfirmRide] Calling setSelectedDriver with:",
                      item.id,
                    );
                    setSelectedDriver(item.id!);
                  }}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>

        {/* Ride Summary */}
        {selectedDriverData && selectedTier && (
          <View className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Text className="font-JakartaSemiBold mb-2">Ride Summary</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm">Base fare ({selectedTier.name})</Text>
              <Text className="text-sm font-JakartaMedium">${selectedTier.baseFare.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm">Time ({selectedDriverData.time?.toFixed(1)} min)</Text>
              <Text className="text-sm font-JakartaMedium">
                ${(selectedDriverData.time || 0 * selectedTier.perMinuteRate).toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between border-t border-gray-300 pt-2 mt-2">
              <Text className="font-JakartaBold">Total</Text>
              <Text className="font-JakartaBold">${calculateFare().toFixed(2)}</Text>
            </View>
          </View>
        )}

        <CustomButton
          title="Confirm Ride"
          onPress={handleConfirmRide}
          className="mt-5"
        />
      </View>
    </View>
  );
};

export default ConfirmRide;
