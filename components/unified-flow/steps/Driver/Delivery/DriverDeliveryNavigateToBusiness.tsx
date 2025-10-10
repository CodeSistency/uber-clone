import React from "react";
import { View, Text } from "react-native";

import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow";

const DriverDeliveryNavigateToBusiness: React.FC = () => {
  const { goTo } = useMapFlow();
  const { startNavigation, distanceText, etaText, currentInstruction } =
    useMapNavigation();
  const active = useRealtimeStore.getState().activeRide as any;
  const destination = {
    latitude: active?.store?.latitude || active?.pickupLatitude || 0,
    longitude: active?.store?.longitude || active?.pickupLongitude || 0,
    address: active?.store?.name || "Negocio",
  };

  const handleStartNavigation = () => {
    startNavigation({ destination, rideId: active?.orderId });
  };

  const handleArrived = () => {
    goTo(FLOW_STEPS.DRIVER_DELIVERY.RECOGER_PEDIDO);
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Ir al Negocio" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Ruta hacia el negocio
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

export default DriverDeliveryNavigateToBusiness;
