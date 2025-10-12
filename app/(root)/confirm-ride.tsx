import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, View, Text } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import ServiceLevelSelector from "@/components/ServiceLevelSelector";
import { fetchAPI } from "@/lib/fetch";
import { useDriverStore, useLocationStore, useUserStore, useMapFlowStore } from "@/store";
import { useRealtimeStore } from "@/store";

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
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);

  // Available ride tiers
  const rideTiers = [
    {
      id: 1,
      name: "Economy",
      baseFare: 2.5,
      perMinuteRate: 0.15,
      perMileRate: 1.25,
      imageUrl:
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100",
      description: "Affordable rides",
    },
    {
      id: 2,
      name: "Comfort",
      baseFare: 4.0,
      perMinuteRate: 0.25,
      perMileRate: 2.0,
      imageUrl:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100",
      description: "More space, premium cars",
    },
    {
      id: 3,
      name: "Premium",
      baseFare: 6.0,
      perMinuteRate: 0.35,
      perMileRate: 3.0,
      imageUrl:
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100",
      description: "Luxury experience",
    },
  ];

  const selectedDriverData = drivers?.find(
    (driver) => driver.id === selectedDriver,
  );

  const selectedTier = rideTiers.find((tier) => tier.id === selectedTierId!);

  // Auto-select timer (15s). If user no elige, selecciona el primero.
  const [secondsLeft, setSecondsLeft] = useState<number>(15);
  useEffect(() => {
    if (selectedDriver || (drivers?.length ?? 0) === 0) return;
    if (secondsLeft <= 0) {
      if (drivers && drivers[0]) {
        setSelectedDriver(drivers[0].id!);
      }
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, selectedDriver, drivers]);

  // Calculate fare based on selected tier and driver time
  const calculateFare = () => {
    if (!selectedDriverData || !selectedTier) return 0;

    const time = selectedDriverData.time || 30; // Default 30 minutes
    const baseFare = selectedTier.baseFare;
    const perMinuteRate = selectedTier.perMinuteRate;

    const totalFare = baseFare + time * perMinuteRate;
    return Math.round(totalFare * 100) / 100; // Round to 2 decimal places
  };

  

  const handleConfirmRide = async () => {
    
    
    
    
    

    if (!selectedDriverData || !user?.id) {
      
      
      
      return;
    }

    if (
      !userAddress ||
      !destinationAddress ||
      !userLatitude ||
      !destinationLatitude
    ) {
      
      
      
      
      
      return;
    }

    try {
      

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

      

      const response = await fetchAPI("ride/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rideData),
      });

      
      
      

      // Simular transición de estado del viaje para UI activa
      const rideId =
        response?.ride?.id || response?.ride_id || response?.id || Date.now();
      const realtime = useRealtimeStore.getState();
      try {
        realtime.setActiveRide({ ride_id: rideId, status: "accepted" } as any);
      } catch (e) {
        
      }
      realtime.updateRideStatus(rideId, "accepted");
      setTimeout(() => realtime.updateRideStatus(rideId, "arriving"), 1500);
      setTimeout(() => realtime.updateRideStatus(rideId, "arrived"), 4000);
      setTimeout(() => realtime.updateRideStatus(rideId, "in_progress"), 7000);
    } catch (error) {
      
      // Mantener al usuario en la pantalla para reintentar
    }
  };

  

  // To control sheet and list from CTA
  const listRef = useRef<FlatList<any>>(null);
  const sheetApiRef = useRef<{ snapToIndex: (index: number) => void } | null>(
    null,
  );

  return (
    <RideLayout
      title="Choose a Rider"
      snapPoints={["40%", "85%"]}
      onReady={(api) => {
        sheetApiRef.current = api;
      }}
    >
      <Text className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Available drivers ({drivers?.length || 0}) • Auto-select in{" "}
        {secondsLeft}s ⏱️
      </Text>

      <ServiceLevelSelector
        selectedServiceLevel={selectedTierId}
        onSelectServiceLevel={setSelectedTierId}
        estimatedDistance={5.2}
        estimatedTime={18}
        onContinue={() => {
          sheetApiRef.current?.snapToIndex(1);
          setTimeout(
            () =>
              listRef.current?.scrollToOffset({ offset: 0, animated: true }),
            50,
          );
        }}
        continueLabel="Continue to Drivers"
      />

      {/* CTA inline provisto por el selector */}

      <View className="mt-4 flex-1">
        <Text className="text-lg font-JakartaSemiBold mb-3 text-black dark:text-white">
          Available Drivers
        </Text>
        <FlatList
          ref={listRef}
          data={drivers}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            

            return (
              <DriverCard
                item={item}
                selected={selectedDriver!}
                setSelected={() => {
                  
                  setSelectedDriver(item.id!);
                  // Expand sheet and focus summary when a driver is picked
                  sheetApiRef.current?.snapToIndex(1);
                  setTimeout(
                    () =>
                      listRef.current?.scrollToOffset({
                        offset: 0,
                        animated: true,
                      }),
                    50,
                  );
                }}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      {selectedDriverData && selectedTier && (
        <View className="mt-4 p-4 bg-gray-50 dark:bg-brand-primary rounded-lg">
          <Text className="font-JakartaSemiBold mb-2 text-black dark:text-white">
            Ride Summary
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-black dark:text-white">
              Base fare ({selectedTier.name})
            </Text>
            <Text className="text-sm font-JakartaMedium text-black dark:text-white">
              ${selectedTier.baseFare.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-black dark:text-white">
              Time ({selectedDriverData.time?.toFixed(1)} min)
            </Text>
            <Text className="text-sm font-JakartaMedium text-black dark:text-white">
              $
              {(
                selectedDriverData.time || 0 * selectedTier.perMinuteRate
              ).toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between border-t border-gray-300 dark:border-brand-primaryDark pt-2 mt-2">
            <Text className="font-JakartaBold text-black dark:text-white">
              Total
            </Text>
            <Text className="font-JakartaBold text-black dark:text-white">
              ${calculateFare().toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {selectedDriverData && selectedTier && (
        <View className="absolute left-5 right-5 bottom-5">
          <CustomButton title="Confirm Ride" onPress={handleConfirmRide} />
        </View>
      )}
    </RideLayout>
  );
};

export default ConfirmRide;
