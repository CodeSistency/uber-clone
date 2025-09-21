import { router } from "expo-router";
import { useState } from "react";
import { Text, View, TouchableOpacity, Image } from "react-native";

import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";

const FindRide = () => {
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();

  const [selectedVehicleType, setSelectedVehicleType] = useState<number | null>(
    null,
  );
  const [estimatedDistance, setEstimatedDistance] = useState<number>(5.2);
  const [estimatedTime, setEstimatedTime] = useState<number>(18);

  // Popular destinations data
  const popularDestinations = [
    {
      id: "home",
      name: "Home",
      address: "123 Main St, City, ST",
      icon: "🏠",
      color: "bg-blue-100",
    },
    {
      id: "work",
      name: "Work",
      address: "456 Business Ave, City, ST",
      icon: "🏢",
      color: "bg-green-100",
    },
    {
      id: "mall",
      name: "Mall",
      address: "789 Shopping Blvd, City, ST",
      icon: "🛒",
      color: "bg-purple-100",
    },
  ];

  const handlePopularDestinationPress = (
    destination: (typeof popularDestinations)[0],
  ) => {
    setDestinationLocation({
      latitude: 0, // Mock coordinates - in real app would be actual coordinates
      longitude: 0,
      address: destination.address,
    });
  };

  return (
    <RideLayout title="Ride" snapPoints={["50%", "85%"]}>
      <View className="mb-4">
        <Text className="text-lg font-JakartaSemiBold mb-3">From</Text>
        <GoogleTextInput
          icon={icons.target}
          initialLocation={userAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="#f5f5f5"
          handlePress={(location) => setUserLocation(location)}
        />
      </View>

      <View className="mb-4">
        <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>
        <GoogleTextInput
          icon={icons.map}
          initialLocation={destinationAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="transparent"
          handlePress={(location) => setDestinationLocation(location)}
        />
      </View>

      {/* Popular Destinations */}
      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-3">Popular destinations</Text>
        <View className="flex-row justify-between">
          {popularDestinations.map((destination) => (
            <TouchableOpacity
              key={destination.id}
              onPress={() => handlePopularDestinationPress(destination)}
              className="items-center flex-1"
            >
              <View
                className={`w-12 h-12 rounded-full items-center justify-center mb-1 ${destination.color}`}
              >
                <Text className="text-lg">{destination.icon}</Text>
              </View>
              <Text className="text-xs text-gray-600 text-center">
                {destination.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text className="text-sm text-gray-600 mb-3">
        Estimated: {estimatedDistance.toFixed(1)} miles • {estimatedTime} min
      </Text>

      <CustomButton
        title="Continue"
        onPress={() => {
          router.push(`/(root)/vehicle-selection` as any);
        }}
        className="mt-2"
      />
    </RideLayout>
  );
};

export default FindRide;
