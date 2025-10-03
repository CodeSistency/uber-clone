import React from "react";
import { View, Text } from "react-native";

import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverMandadoNavigateToDestination: React.FC = () => {
  const { goTo } = useMapFlow();
  const { startNavigation, distanceText, etaText, currentInstruction } =
    useMapNavigation();
  const active = useRealtimeStore.getState().activeRide as any;
  const destination = {
    latitude: active?.destination_latitude || active?.dropoffLatitude || 0,
    longitude: active?.destination_longitude || active?.dropoffLongitude || 0,
    address: active?.destination_address || "Destino del cliente",
  };

  const handleStartNavigation = () => {
    startNavigation({ destination, rideId: active?.id });
  };

  const handleDelivered = () => {
    goTo(FLOW_STEPS.DRIVER_MANDADO_ENTREGAR_MANDADO);
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Ir al Destino (Mandado)" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Ruta hacia el destino del cliente
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
          onPress={handleDelivered}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default DriverMandadoNavigateToDestination;
