import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";

import FlowHeader from "../../../FlowHeader";

const MandadoFinalize: React.FC = () => {
  const { back } = useMapFlow();
  const { showSuccess } = useUI();

  const handleFinish = () => {
    showSuccess("Mandado finalizado", "Gracias por usar el servicio");
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title="Finalización"
        subtitle="Resumen y calificación"
        onBack={back}
      />

      <View className="px-5 mt-4">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="font-JakartaMedium text-gray-700">Resumen</Text>
          <Text className="font-Jakarta text-gray-600 mt-1">
            (Demo) Resumen del mandado y costos totales.
          </Text>
        </View>
      </View>

      <View className="px-5 pb-4 mt-4">
        <TouchableOpacity
          onPress={handleFinish}
          className="rounded-xl p-4 bg-primary-500"
        >
          <Text className="text-white font-JakartaBold text-center">
            Finalizar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MandadoFinalize;




