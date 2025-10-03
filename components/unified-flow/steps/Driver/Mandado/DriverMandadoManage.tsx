import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";

import { driverErrandService } from "@/app/services/driverErrandService";
import CustomButton from "@/components/CustomButton";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverMandadoManage: React.FC = () => {
  const { goTo } = useMapFlow();
  const { showSuccess } = useUI();
  const [itemsCost, setItemsCost] = useState<string>("");

  const handleConfirmItems = () => {
    if (!itemsCost) return;
    showSuccess("Productos confirmados", `Costo: $${itemsCost}`);
    try {
      const id = (useRealtimeStore.getState().activeRide as any)?.id || 0;
      if (id) driverErrandService.updateShopping(id, parseFloat(itemsCost));
    } catch {}
    goTo(FLOW_STEPS.DRIVER_MANDADO_EN_CAMINO_DESTINO);
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Gestión del Mandado" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Confirmar detalles y costo de los artículos antes de comprar
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 mb-3 text-black"
          placeholder="Costo total de los artículos (USD)"
          inputMode="decimal"
          value={itemsCost}
          onChangeText={setItemsCost}
        />
        <CustomButton
          title="Confirmar productos"
          bgVariant="success"
          onPress={handleConfirmItems}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default DriverMandadoManage;
