import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useMapFlowContext } from "@/context/MapFlowContext";
import { useMapFlow } from "@/hooks/useMapFlow";

const ConfirmOrigin: React.FC = () => {
  const { next, back } = useMapFlow();
  const { map } = useMapFlowContext();

  return (
    <View>
      <Text className="font-JakartaBold text-lg mb-2">
        Confirma tu punto de partida
      </Text>
      <Text className="text-secondary-700 mb-3">
        Mueve el mapa para posicionar el pin y presiona confirmar.
      </Text>
      <View className="flex-row">
        <TouchableOpacity
          onPress={back}
          className="flex-1 bg-gray-200 rounded-lg p-4 mr-2"
        >
          <Text className="text-gray-800 font-JakartaBold text-center">
            Atrás
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // ejemplo: zoom suave al centro actual (puedes leer coords del store de location si quieres)
            map.zoomTo({ latitude: 0, longitude: 0 } as any, 0.01);
            next();
          }}
          className="flex-1 bg-primary-500 rounded-lg p-4"
        >
          <Text className="text-black font-JakartaBold text-center">
            Confirmar origen
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConfirmOrigin;
