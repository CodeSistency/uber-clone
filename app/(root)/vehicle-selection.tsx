import { router } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

import CustomButton from "@/components/CustomButton";
import RideLayout from "@/components/RideLayout";
import VehicleTypeSelector from "@/components/VehicleTypeSelector";
import { icons } from "@/constants";

const VehicleSelection = () => {
  const [selectedVehicleType, setSelectedVehicleType] = useState<number | null>(
    null,
  );

  return (
    <RideLayout title="Choose Vehicle" snapPoints={["25%", "50%"]}>
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
    </RideLayout>
  );
};

export default VehicleSelection;

