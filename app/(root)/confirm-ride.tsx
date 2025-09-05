import { router } from "expo-router";
import { FlatList, View, Text, TouchableOpacity, Image } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { fetchAPI } from "@/lib/fetch";
import { useDriverStore, useLocationStore, useUserStore } from "@/store";
import { useState } from "react";

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
    <RideLayout title={"Choose a Rider"} snapPoints={["65%", "85%"]}>
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
        ListHeaderComponent={() => (
          <View className="mx-5 mb-5">
            <Text className="text-xl font-JakartaBold mb-3">Choose Ride Type</Text>
            <FlatList
              data={rideTiers}
              horizontal
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedTierId(item.id)}
                  className={`mr-3 p-3 rounded-xl border-2 ${
                    selectedTierId === item.id
                      ? "border-primary bg-primary-50"
                      : "border-gray-200 bg-white"
                  }`}
                  style={{ width: 120 }}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-12 h-12 rounded-lg mb-2"
                    resizeMode="cover"
                  />
                  <Text className="font-JakartaSemiBold text-sm mb-1">
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-600 mb-2">
                    {item.description}
                  </Text>
                  <Text className="font-JakartaBold text-sm">
                    ${item.baseFare.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
            {selectedDriverData && selectedTier && (
              <View className="mt-4 p-3 bg-gray-50 rounded-lg">
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
          </View>
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton title="Select Ride" onPress={handleConfirmRide} />
          </View>
        )}
      />
    </RideLayout>
  );
};

export default ConfirmRide;
