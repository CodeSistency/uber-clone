import React from "react";
import { View, Text } from "react-native";

import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";

export interface RideCancelledProps {
  reason: string;
  canRebook: boolean;
  onRebook: () => void;
  onGoHome: () => void;
}

const RideCancelled: React.FC<RideCancelledProps> = ({
  reason,
  canRebook = true,
  onRebook,
  onGoHome,
}) => {
  const { back } = useMapFlow();

  return (
    <View className="flex-1">
      <FlowHeader title="Viaje Cancelado" onBack={back} />

      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-6xl mb-6">❌</Text>

        <Text className="font-JakartaBold text-xl text-gray-800 mb-2 text-center">
          Viaje cancelado
        </Text>

        <Text className="font-Jakarta text-gray-600 text-center mb-6">
          {reason}
        </Text>

        <View className="w-full">
          {canRebook && (
            <CustomButton
              title="Buscar otro conductor"
              bgVariant="primary"
              onPress={onRebook}
              className="w-full"
            />
          )}

          <CustomButton
            title="Volver al inicio"
            bgVariant="outline"
            onPress={onGoHome}
            className="w-full"
          />
        </View>
      </View>
    </View>
  );
};

export default RideCancelled;
