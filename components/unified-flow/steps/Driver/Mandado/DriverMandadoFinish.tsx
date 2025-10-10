import React, { useState } from "react";
import { View, Text } from "react-native";

import { driverErrandService } from "@/app/services/driverErrandService";
import CustomButton from "@/components/CustomButton";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow";

const DriverMandadoFinish: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();
  const { showSuccess } = useUI();
  const [cashConfirmed, setCashConfirmed] = useState<boolean>(false);

  const handleConfirm = () => {
    setCashConfirmed(true);
    showSuccess("Mandado finalizado", "Pago total confirmado");
  };

  const handleFinish = async () => {
    if (!cashConfirmed) return;
    try {
      const id = (useRealtimeStore.getState().activeRide as any)?.id || 0;
      if (id) await driverErrandService.complete(id, generateIdempotencyKey());
      showSuccess("Mandado completado", "Entrega confirmada");
    } catch (e) {
      // No showError por no bloquear, paso a rating igual
    }
    startWithDriverStep(FLOW_STEPS.DRIVER_FINALIZACION_RATING);
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Finalizar Mandado" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Confirmar cobro final: servicio + artículos
        </Text>
        <CustomButton
          title={cashConfirmed ? "Confirmado" : "Confirmar cobro total"}
          bgVariant={cashConfirmed ? "success" : "primary"}
          onPress={handleConfirm}
          className="w-full mb-4"
        />
        <CustomButton
          title="Finalizar servicio"
          bgVariant="danger"
          onPress={handleFinish}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default DriverMandadoFinish;
