import { router } from "expo-router";
import { View, Text, TouchableOpacity, Image } from "react-native";

import CustomButton from "@/components/CustomButton";
import VehicleTypeSelector from "@/components/VehicleTypeSelector";
import Map from "@/components/Map";
import { icons } from "@/constants";
import { useState } from "react";

const VehicleSelection = () => {
  const [selectedVehicleType, setSelectedVehicleType] = useState<number | null>(null);

  return (
    <View className="flex-1 bg-general-500">
      {/* Mapa visible ocupando 75% superior */}
      <View className="flex-1 relative">
        <Map />

        {/* Header con título */}
        <View className="absolute top-12 left-4 right-4 z-10">
          <View className="bg-white rounded-lg p-4 shadow-lg">
            <Text className="text-lg font-JakartaBold text-center">Choose Vehicle Type</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet con selección de vehículo (25% inferior) */}
      <View className="bg-white rounded-t-3xl p-6" style={{ height: '25%' }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-JakartaBold">Choose Vehicle</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={icons.close} className="w-6 h-6" />
          </TouchableOpacity>
        </View>

        <VehicleTypeSelector
          selectedVehicleType={selectedVehicleType}
          onSelectVehicleType={setSelectedVehicleType}
        />

        <CustomButton
          title="Continue to Service Options"
          onPress={() => {
            if (selectedVehicleType) {
              router.push(`/(root)/confirm-ride` as any);
            }
          }}
          className="mt-5"
          disabled={!selectedVehicleType}
        />
      </View>
    </View>
  );
};

export default VehicleSelection;
