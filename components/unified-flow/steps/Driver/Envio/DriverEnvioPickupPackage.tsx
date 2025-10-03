import React, { useState } from "react";
import { View, Text } from "react-native";

import { driverParcelService } from "@/app/services/driverParcelService";
import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverEnvioPickupPackage: React.FC = () => {
  const { goTo } = useMapFlow();
  const [loading, setLoading] = useState(false);

  const handlePicked = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const active = useRealtimeStore.getState().activeRide as any;
      const id = active?.id || active?.ride_id || 0;
      if (id) await driverParcelService.pickup(id, generateIdempotencyKey());
      goTo(FLOW_STEPS.DRIVER_ENVIO_EN_CAMINO_DESTINO);
    } catch {
      // Optional: toast error
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Recoger Paquete" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Detalles del paquete (descripción, tamaño)
        </Text>
        <CustomButton
          title={loading ? "Confirmando..." : "He recogido el paquete"}
          loading={loading}
          bgVariant="success"
          onPress={handlePicked}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default DriverEnvioPickupPackage;
