import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";

import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverTransportNavigateToOrigin: React.FC = () => {
  const { goTo } = useMapFlow();
  const {
    startNavigation,
    distanceText,
    etaText,
    currentInstruction,
    isNavigating,
  } = useMapNavigation();
  const active = useRealtimeStore.getState().activeRide as any;
  const [navigationStarted, setNavigationStarted] = useState(false);

  const destination = {
    latitude: active?.origin_latitude || active?.pickupLocation?.lat || 0,
    longitude: active?.origin_longitude || active?.pickupLocation?.lng || 0,
    address: active?.origin_address || "Origen del cliente",
  };

  // Auto-start navigation when component mounts
  useEffect(() => {
    if (!navigationStarted && destination.latitude && destination.longitude) {
      console.log("[DriverTransportNavigateToOrigin] Auto-starting navigation to:", destination);
      startNavigation({ destination, rideId: active?.ride_id });
      setNavigationStarted(true);
    }
  }, [navigationStarted, destination, active?.ride_id]);

  const handleArrived = () => {
    console.log("[DriverTransportNavigateToOrigin] Driver arrived at origin");
    goTo(FLOW_STEPS.DRIVER_TRANSPORT.EN_ORIGEN);
  };

  return (
    <View className="flex-1">
      <FlowHeader title="En camino al origen" />
      <View className="p-6">
        <Text className="font-JakartaBold text-lg mb-2 text-center">
          Dirigiéndote al punto de recogida
        </Text>

        <Text className="font-Jakarta text-base text-gray-600 mb-4 text-center">
          {active?.passenger?.name ? `Cliente: ${active.passenger.name}` : "Cliente esperando"}
        </Text>

        {/* Navigation Status */}
        <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <Text className="font-JakartaMedium text-blue-800 mb-1">
            📍 Estado de navegación
          </Text>
          <Text className="font-Jakarta text-sm text-blue-700">
            {isNavigating ? "Navegación activa" : "Iniciando navegación..."}
          </Text>
        </View>

        {/* Route Info */}
        {isNavigating && (
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
            <Text className="font-JakartaBold text-gray-800 mb-2">
              Información de ruta
            </Text>
            <Text className="font-Jakarta text-base text-gray-600 mb-1">
              {currentInstruction}
            </Text>
            <Text className="font-Jakarta text-sm text-gray-500">
              📏 {distanceText} • ⏱️ {etaText}
            </Text>
          </View>
        )}

        {/* Address */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="font-JakartaBold text-gray-800 mb-2">
            📍 Dirección de recogida
          </Text>
          <Text className="font-Jakarta text-base text-gray-700">
            {destination.address}
          </Text>
        </View>

        {/* Action Button */}
        <CustomButton
          title="He llegado al origen"
          bgVariant="success"
          onPress={handleArrived}
          className="w-full"
        />

        {/* Safety Note */}
        <View className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <Text className="font-JakartaMedium text-sm text-yellow-800 text-center">
            ⚠️ Mantén la distancia segura y respeta las normas de tránsito
          </Text>
        </View>
      </View>
    </View>
  );
};

export default DriverTransportNavigateToOrigin;
