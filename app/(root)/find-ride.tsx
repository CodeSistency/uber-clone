import { router } from "expo-router";
import { Text, View, TouchableOpacity, Image } from "react-native";

import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RideLayout from "@/components/RideLayout";
import Map from "@/components/Map";
import VehicleTypeSelector from "@/components/VehicleTypeSelector";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { useState } from "react";

const FindRide = () => {
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();

  const [selectedVehicleType, setSelectedVehicleType] = useState<number | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number>(5.2);
  const [estimatedTime, setEstimatedTime] = useState<number>(18);

  return (
    <View className="flex-1 bg-general-500">
      {/* Mapa visible ocupando 50% superior */}
      <View className="flex-1 relative">
        <Map />

        {/* Información flotante sobre el mapa */}
        <View className="absolute top-12 left-4 right-4 z-10">
          <View className="bg-white rounded-lg p-4 shadow-lg">
            <Text className="text-lg font-JakartaBold mb-2">Estimated: {estimatedDistance.toFixed(1)} miles • {estimatedTime} min</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">💡 Popular destinations</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-xs text-blue-600">🏠 Home</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-xs text-green-600">🏢 Work</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-purple-100 px-3 py-1 rounded-full">
                  <Text className="text-xs text-purple-600">🛒 Mall</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Sheet con formulario (50% inferior) */}
      <View className="bg-white rounded-t-3xl p-6" style={{ height: '50%' }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-JakartaBold">Ride</Text>
          <TouchableOpacity>
            <Image source={icons.close} className="w-6 h-6" />
          </TouchableOpacity>
        </View>

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

        <CustomButton
          title="Continue"
          onPress={() => {
            if (selectedVehicleType) {
              router.push(`/(root)/confirm-ride` as any);
            } else {
              // Navigate to vehicle selection if not selected
              router.push(`/(root)/vehicle-selection` as any);
            }
          }}
          className="mt-5"
        />
      </View>
    </View>
  );
};

export default FindRide;
