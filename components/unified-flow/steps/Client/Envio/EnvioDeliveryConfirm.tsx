import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";

import FlowHeader from "../../../FlowHeader";

const EnvioDeliveryConfirm: React.FC = () => {
  const { back } = useMapFlow();
  const { showSuccess } = useUI();

  const handleConfirm = () => {
    showSuccess("Entrega confirmada", "Se registró la entrega del paquete");
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title="Confirmación de entrega"
        subtitle="Solicita firma o registra evidencia"
        onBack={back}
      />

      <View className="px-5 mt-4">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="font-JakartaMedium text-gray-700">Evidencia</Text>
          <Text className="font-Jakarta text-gray-600 mt-1">
            (Demo) Aquí iría la captura de firma o foto de entrega.
          </Text>
        </View>
      </View>

      <View className="px-5 pb-4 mt-4">
        <TouchableOpacity
          onPress={handleConfirm}
          className="rounded-xl p-4 bg-primary-500"
        >
          <Text className="text-white font-JakartaBold text-center">
            Confirmar entrega
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EnvioDeliveryConfirm;




