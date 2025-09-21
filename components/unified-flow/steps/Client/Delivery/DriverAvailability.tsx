import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { websocketService } from "@/app/services/websocketService";
import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useDriverConfigStore } from "@/store/driverConfig/driverConfig";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverAvailability: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();
  const { appSettings, updateAppSettings } = useDriverConfigStore();

  const isConnected = appSettings?.notifications?.rideRequests ?? true;

  const toggleAvailability = () => {
    // Reuse a simple setting flag to simulate availability; in real flow this would be a dedicated field
    updateAppSettings({
      notifications: {
        ...appSettings.notifications,
        rideRequests: !isConnected,
      },
    });

    // Inform backend via websocket
    try {
      websocketService.updateDriverStatus({ available: !isConnected });
    } catch (e) {}
  };

  const goMockIncoming = () => {
    // For demo: go to incoming request step
    startWithDriverStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD);
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Disponibilidad" />

      <View className="flex-1 items-center justify-center p-6">
        <Text className="font-JakartaBold text-2xl mb-4">Estado</Text>
        <Text
          className={`font-Jakarta text-lg mb-8 ${isConnected ? "text-green-600" : "text-gray-500"}`}
        >
          {isConnected ? "Conectado" : "Desconectado"}
        </Text>

        <CustomButton
          title={isConnected ? "Desconectar" : "Conectar"}
          bgVariant={isConnected ? "danger" : "success"}
          onPress={toggleAvailability}
          className="w-full mb-4"
        />

        <CustomButton
          title="Simular Solicitud Entrante"
          bgVariant="primary"
          onPress={goMockIncoming}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default DriverAvailability;
