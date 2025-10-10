import React from "react";
import { View, Text } from "react-native";

import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow";

const DriverEnvioNavigateToOrigin: React.FC = () => {
  const { goTo } = useMapFlow();
  const { startNavigation, distanceText, etaText, currentInstruction } =
    useMapNavigation();
  const active = useRealtimeStore.getState().activeRide as any;
  const destination = {
    latitude: active?.origin_latitude || active?.pickupLatitude || 0,
    longitude: active?.origin_longitude || active?.pickupLongitude || 0,
    address: active?.origin_address || "Origen del paquete",
  };

  const handleStartNavigation = () => {
    startNavigation({ destination, rideId: active?.id });
  };

  const handleArrived = () => {
    goTo(FLOW_STEPS.DRIVER_ENVIO.RECOGER_PAQUETE);
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Ir al Origen (Envío)" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Ruta hacia el origen del paquete
        </Text>
        <Text className="font-Jakarta text-sm text-gray-500 mb-2">
          {currentInstruction} • {distanceText} • {etaText}
        </Text>
        <CustomButton
          title="Iniciar navegación"
          bgVariant="primary"
          onPress={handleStartNavigation}
          className="w-full mb-3"
        />
        <CustomButton
          title="He llegado"
          bgVariant="success"
          onPress={handleArrived}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default DriverEnvioNavigateToOrigin;
