import React, { useState } from "react";
import { View, Text } from "react-native";

import { driverParcelService } from "@/app/services/driverParcelService";
import CustomButton from "@/components/CustomButton";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverEnvioDeliveryConfirm: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const [proofCollected, setProofCollected] = useState<boolean>(false);
  const [method, setMethod] = useState<"cash" | "card">("cash");
  const [finishing, setFinishing] = useState(false);

  const handleCollectProof = () => {
    // TODO: Integrar firma digital o foto (POD)
    setProofCollected(true);
    showSuccess("Prueba de entrega", "Firma/foto capturada");
  };

  const handleFinish = async () => {
    if (finishing || !proofCollected) return;
    setFinishing(true);
    try {
      const active = useRealtimeStore.getState().activeRide as any;
      const id = active?.id || active?.ride_id || 0;
      if (id)
        await driverParcelService.deliver(
          id,
          undefined,
          generateIdempotencyKey(),
        );
      showSuccess("Envío completado", "Entrega confirmada");
      startWithDriverStep(FLOW_STEPS.DRIVER_FINALIZACION_RATING as any);
    } catch (e) {
      showError("Error", "No se pudo registrar la entrega");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Confirmar Entrega (POD)" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Obtener firma o foto como prueba de entrega
        </Text>
        <View className="flex-row mb-4">
          <CustomButton
            title={method === "cash" ? "Efectivo ✓" : "Efectivo"}
            bgVariant={method === "cash" ? "success" : "outline"}
            onPress={() => setMethod("cash")}
            className="flex-1 mr-2"
          />
          <CustomButton
            title={method === "card" ? "Tarjeta ✓" : "Tarjeta"}
            bgVariant={method === "card" ? "success" : "outline"}
            onPress={() => setMethod("card")}
            className="flex-1 ml-2"
          />
        </View>
        <CustomButton
          title={proofCollected ? "Prueba registrada" : "Capturar prueba"}
          bgVariant={proofCollected ? "success" : "primary"}
          onPress={handleCollectProof}
          className="w-full mb-4"
        />
        <CustomButton
          title={finishing ? "Finalizando..." : "Finalizar envío"}
          loading={finishing}
          bgVariant="danger"
          onPress={handleFinish}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default DriverEnvioDeliveryConfirm;
