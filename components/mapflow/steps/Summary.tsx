import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useMapFlow } from "@/hooks/useMapFlow";

const Summary: React.FC = () => {
  const { reset } = useMapFlow();

  return (
    <View>
      <Text className="font-JakartaBold text-lg mb-2">Resumen</Text>
      <Text className="text-secondary-700 mb-4">
        Origen, destino, servicio y conductor seleccionados.
      </Text>
      <TouchableOpacity
        onPress={reset}
        className="bg-primary-500 rounded-lg p-4"
      >
        <Text className="text-black font-JakartaBold text-center">
          Finalizar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Summary;
