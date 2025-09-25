import React from "react";
import { View, Text } from "react-native";

import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";

export interface RideInProgressProps {
  driverName: string;
  destination: string;
  estimatedTime: number;
  onCallDriver: () => void;
  onEmergency: () => void;
}

const RideInProgress: React.FC<RideInProgressProps> = ({
  driverName,
  destination,
  estimatedTime,
  onCallDriver,
  onEmergency
}) => {
  const { back } = useMapFlow();

  return (
    <View className="flex-1">
      <FlowHeader title="Viaje en Curso" onBack={back} />

      <View className="p-6">
        <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <Text className="font-JakartaBold text-green-800 mb-1">
            Viaje activo
          </Text>
          <Text className="font-Jakarta text-green-700">
            Con {driverName} hacia {destination}
          </Text>
          <Text className="font-Jakarta text-green-600 text-sm mt-1">
            Tiempo estimado: {estimatedTime} min
          </Text>
        </View>

        <View>
          <CustomButton
            title="Llamar conductor"
            bgVariant="outline"
            onPress={onCallDriver}
            className="w-full mb-3"
          />

          <CustomButton
            title="🚨 Emergencia"
            bgVariant="danger"
            onPress={onEmergency}
            className="w-full"
          />
        </View>
      </View>
    </View>
  );
};

export default RideInProgress;
