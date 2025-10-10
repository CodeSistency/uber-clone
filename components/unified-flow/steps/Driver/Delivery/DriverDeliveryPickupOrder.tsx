import React, { useState } from "react";
import { View, Text } from "react-native";

import { driverDeliveryService } from "@/app/services/driverDeliveryService";
import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow";

const DriverDeliveryPickupOrder: React.FC = () => {
  const { goTo } = useMapFlow();
  const [loading, setLoading] = useState(false);

  const handlePicked = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const active = useRealtimeStore.getState().activeRide as any;
      const id = active?.orderId || active?.ride_id || active?.id || 0;
      if (id) await driverDeliveryService.pickup(id, generateIdempotencyKey());
      goTo(FLOW_STEPS.DRIVER_DELIVERY.EN_CAMINO_ENTREGA);
    } catch {
      // Optional: toast error
    } finally {
      setLoading(false);
    } 
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Recoger Pedido" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Detalles del pedido y del cliente
        </Text>
        <CustomButton
          title={loading ? "Confirmando..." : "He recogido el pedido"}
          loading={loading}
          bgVariant="success"
          onPress={handlePicked}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default DriverDeliveryPickupOrder;
