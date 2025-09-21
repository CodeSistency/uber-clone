import React, { useState } from "react";
import { View, Text } from "react-native";

import { driverDeliveryService } from "@/app/services/driverDeliveryService";
import { driverStatusService } from "@/app/services/driverStatusService";
import CustomButton from "@/components/CustomButton";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverDeliveryConfirmFinish: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const [cashConfirmed, setCashConfirmed] = useState<boolean>(false);
  const [method, setMethod] = useState<"cash" | "card">("cash");
  const [finishing, setFinishing] = useState(false);

  const handleConfirm = () => {
    setCashConfirmed(true);
    showSuccess("Entrega confirmada", "Pago confirmado");
  };

  const handleFinish = async () => {
    if (finishing || !cashConfirmed) return;
    setFinishing(true);
    try {
      const active = useRealtimeStore.getState().activeRide as any;
      const id = active?.orderId || active?.ride_id || active?.id || 0;
      if (method === "card" && id) {
        const st = await driverStatusService.deliveryStatus(id);
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
      if (id) await driverDeliveryService.deliver(id, generateIdempotencyKey());
      showSuccess("Entrega completada", "Pedido entregado");
      startWithDriverStep(FLOW_STEPS.DRIVER_FINALIZACION_RATING as any);
    } catch (e) {
      showError("Error", "No se pudo confirmar la entrega");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Confirmación y Finalización" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Confirmar entrega y pago
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
            title={cashConfirmed ? "Confirmado" : "Confirmar cobro"}
            bgVariant={cashConfirmed ? "success" : "primary"}
            onPress={handleConfirm}
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

export default DriverDeliveryConfirmFinish;
