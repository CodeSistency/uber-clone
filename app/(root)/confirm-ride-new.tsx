import { router } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, View, Text, TouchableOpacity, Image } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import Map from "@/components/Map";
import ServiceLevelSelector from "@/components/ServiceLevelSelector";
import { icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useDriverStore, useLocationStore, useUserStore } from "@/store";
import {
  DARK_MODERN_STYLE,
  type MapConfiguration,
} from "@/constants/mapStyles";

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

  const selectedTier = rideTiers.find((tier) => tier.id === selectedTierId);

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

      
      
      
      router.push("/(root)/(tabs)/rides" as any);
    } catch (error) {
      
      // Still navigate to rides page even if there's an error
      router.push("/(root)/(tabs)/rides" as any);
    }
  };

  

  // Refs used by onContinue (ensure defined)
  const listRef = useRef<FlatList<any>>(null);
  const sheetApiRef = useRef<{ snapToIndex: (i: number) => void } | null>(null);

  // 🎨 Configuración del mapa con tema dark moderno
  const mapConfig: Partial<MapConfiguration> = {
    theme: "dark",
    customStyle: DARK_MODERN_STYLE,
    userInterfaceStyle: "dark",
    mapType: "standard",
    showsUserLocation: true,
    showsPointsOfInterest: false,
    showsBuildings: true,
    showsTraffic: false,
    showsCompass: true,
    showsScale: false,
    showsMyLocationButton: false,
    zoomEnabled: true,
    scrollEnabled: true,
    rotateEnabled: true,
    pitchEnabled: true,
    tintColor: "#00FF88",
    routeColor: "#4285F4",
    trailColor: "#FFE014",
    predictionColor: "#00FF88",
  };

  return (
    <View className="flex-1 bg-general-500">
      {/* Mapa visible ocupando 40% superior */}
      <View className="flex-1 relative">
        <Map mapConfig={mapConfig} />

        {/* Información flotante sobre el mapa */}
        <View className="absolute top-12 left-4 right-4 z-10">
          <View className="bg-white rounded-lg p-4 shadow-lg">
            <Text className="text-lg font-JakartaBold mb-2">
              Available drivers ({drivers?.length || 0})
            </Text>
            <Text className="text-sm text-gray-600">
              Auto-select in: 15s ⏱️
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet con selección (60% inferior) */}
      <View className="bg-white rounded-t-3xl p-6" style={{ height: "60%" }}>
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
            try {
              sheetApiRef.current?.snapToIndex(1);
            } catch {}
            setTimeout(
              () =>
                listRef.current?.scrollToOffset({ offset: 0, animated: true }),
              50,
            );
          }}
        />

        {/* Drivers List */}
        <View className="mt-4 flex-1">
          <Text className="text-lg font-JakartaSemiBold mb-3">
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
              <Text className="text-sm font-JakartaMedium">
                ${selectedTier.baseFare.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm">
                Time ({selectedDriverData.time?.toFixed(1)} min)
              </Text>
              <Text className="text-sm font-JakartaMedium">
                $
                {(
                  selectedDriverData.time || 0 * selectedTier.perMinuteRate
                ).toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between border-t border-gray-300 pt-2 mt-2">
              <Text className="font-JakartaBold">Total</Text>
              <Text className="font-JakartaBold">
                ${calculateFare().toFixed(2)}
              </Text>
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
