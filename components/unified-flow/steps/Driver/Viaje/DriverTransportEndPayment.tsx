import React, { useState } from "react";
import { View, Text } from "react-native";

import { driverStatusService } from "@/app/services/driverStatusService";
import { driverTransportService } from "@/app/services/driverTransportService";
import CustomButton from "@/components/CustomButton";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverTransportEndPayment: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const [cashConfirmed, setCashConfirmed] = useState<boolean>(false);
  const [method, setMethod] = useState<"cash" | "card">("cash");
  const [finishing, setFinishing] = useState(false);

  const handleConfirmCash = () => {
    setCashConfirmed(true);
    showSuccess("Cobro confirmado", "Puedes finalizar el servicio");
  };

  const handleFinish = async () => {
    if (finishing || !cashConfirmed) return;
    setFinishing(true);
    try {
      const id = (useRealtimeStore.getState().activeRide as any)?.ride_id || 0;
      if (method === "card" && id) {
        const st = await driverStatusService.transportStatus(id);
        const paid =
          st?.paymentStatus === "paid" || st?.payment_status === "paid";
        if (!paid) {
          showError(
            "Pago no confirmado",
            "Aún no se ha confirmado el pago con tarjeta",
          );
          setFinishing(false);
          return;
        }
      }
      if (id)
        await driverTransportService.complete(
          id,
          8.2,
          generateIdempotencyKey(),
        );
      showSuccess("Viaje completado", "Pago registrado");
      startWithDriverStep(FLOW_STEPS.DRIVER_FINALIZACION_RATING as any);
    } catch (e) {
      showError("Error", "No se pudo completar el viaje");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Finalización y Pago" />
      <View className="p-6">
        <Text className="font-JakartaBold text-lg mb-2">Resumen de pago</Text>
        <Text className="font-Jakarta text-base text-gray-600 mb-2">
          Total: $8.20
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

        {method === "cash" ? (
          <CustomButton
            title={
              cashConfirmed ? "Cobro confirmado" : "Confirmar cobro en efectivo"
            }
            bgVariant={cashConfirmed ? "success" : "primary"}
            onPress={handleConfirmCash}
            className="w-full mb-4"
          />
        ) : (
          <CustomButton
            title="Verificar pago con tarjeta"
            bgVariant="primary"
            onPress={() => showSuccess("Pago", "Pago con tarjeta confirmado")}
            className="w-full mb-4"
          />
        )}
        <CustomButton
          title={finishing ? "Finalizando..." : "Finalizar servicio"}
          loading={finishing}
          bgVariant="danger"
          onPress={handleFinish}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default DriverTransportEndPayment;
