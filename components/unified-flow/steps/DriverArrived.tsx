import React from "react";
import { View, Text } from "react-native";

import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";

export interface DriverArrivedProps {
  driverName: string;
  vehicleInfo: string;
  onReady: () => void;
  onCallDriver: () => void;
}

const DriverArrived: React.FC<DriverArrivedProps> = ({
  driverName,
  vehicleInfo,
  onReady,
  onCallDriver
}) => {
  const { back } = useMapFlow();

  return (
    <View className="flex-1">
      <FlowHeader title="Conductor Llegó" onBack={back} />

      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-6xl mb-6">🚗</Text>

        <Text className="font-JakartaBold text-xl text-gray-800 mb-2 text-center">
          ¡Tu conductor llegó!
        </Text>

        <Text className="font-Jakarta text-gray-600 text-center mb-6">
          {driverName} te está esperando{vehicleInfo ? ` con ${vehicleInfo}` : ''}
        </Text>

        <View className="w-full">
          <CustomButton
            title="Estoy listo"
            bgVariant="success"
            onPress={onReady}
            className="w-full mb-3"
          />

          <CustomButton
            title="Llamar conductor"
            bgVariant="outline"
            onPress={onCallDriver}
            className="w-full"
          />
        </View>
      </View>
    </View>
  );
};

export default DriverArrived;