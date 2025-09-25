import React from "react";
import { View, Text } from "react-native";

import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";

export interface RideCompletedProps {
  driverName: string;
  fare: number;
  distance: number;
  duration: number;
  onRateDriver: () => void;
  onNewRide: () => void;
}

const RideCompleted: React.FC<RideCompletedProps> = ({
  driverName,
  fare,
  distance,
  duration,
  onRateDriver,
  onNewRide
}) => {
  const { back } = useMapFlow();

  return (
    <View className="flex-1">
      <FlowHeader title="Viaje Completado" onBack={back} />

      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-6xl mb-6">✅</Text>

        <Text className="font-JakartaBold text-xl text-gray-800 mb-2 text-center">
          ¡Viaje completado!
        </Text>

        <Text className="font-Jakarta text-gray-600 text-center mb-6">
          Gracias por viajar con nosotros
        </Text>

        {/* Resumen del viaje */}
        <View className="bg-gray-50 rounded-lg p-4 w-full mb-6">
          <Text className="font-JakartaBold text-gray-800 mb-3">Resumen</Text>

          <View>
            <View className="flex-row justify-between">
              <Text className="font-Jakarta text-gray-600">Conductor</Text>
              <Text className="font-JakartaBold text-gray-800">{driverName}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="font-Jakarta text-gray-600">Distancia</Text>
              <Text className="font-JakartaBold text-gray-800">{distance} km</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="font-Jakarta text-gray-600">Duración</Text>
              <Text className="font-JakartaBold text-gray-800">{duration} min</Text>
            </View>

            <View className="border-t border-gray-200 pt-2 mt-2">
              <View className="flex-row justify-between">
                <Text className="font-JakartaBold text-gray-800">Total</Text>
                <Text className="font-JakartaBold text-green-600 text-lg">${fare}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="w-full space-y-3">
          <CustomButton
            title="Calificar conductor"
            bgVariant="primary"
            onPress={onRateDriver}
            className="w-full"
          />

          <CustomButton
            title="Nuevo viaje"
            bgVariant="outline"
            onPress={onNewRide}
            className="w-full"
          />
        </View>
      </View>
    </View>
  );
};

export default RideCompleted;
