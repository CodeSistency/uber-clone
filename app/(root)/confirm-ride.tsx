import { router } from "expo-router";
import { FlatList, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { fetchAPI } from "@/lib/fetch";
import { useDriverStore, useLocationStore, useUserStore } from "@/store";

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

  const selectedDriverData = drivers?.find(
    (driver) => driver.id === selectedDriver,
  );

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

      const rideData = {
        origin_address: userAddress,
        destination_address: destinationAddress,
        origin_latitude: userLatitude,
        origin_longitude: userLongitude,
        destination_latitude: destinationLatitude,
        destination_longitude: destinationLongitude,
        ride_time: selectedDriverData.time?.toFixed(0) || "30", // Default 30 mins
        fare_price: selectedDriverData.price
          ? parseFloat(selectedDriverData.price) * 100
          : 2500, // Default $25
        payment_status: "paid", // Testing with paid status
        driver_id: selectedDriverData.id,
        user_id: user?.id,
      };

      console.log("[ConfirmRide] Ride data to send:", rideData);

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
