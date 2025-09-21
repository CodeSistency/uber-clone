import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useMapFlowContext } from "@/context/MapFlowContext";
import { useMapFlow } from "@/hooks/useMapFlow";

const SetLocations: React.FC = () => {
  const { next } = useMapFlow();
  const { map } = useMapFlowContext();

  return (
    <View>
      <Text className="font-JakartaBold text-lg mb-2">
        Selecciona origen y destino
      </Text>
      <View className="bg-gray-100 rounded-lg p-3 mb-3">
        <Text className="text-gray-700">Origen: usa el buscador o el mapa</Text>
      </View>
      <View className="bg-gray-100 rounded-lg p-3 mb-3">
        <Text className="text-gray-700">
          Destino: usa el buscador o el mapa
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          // ejemplo: enfocar bounds entre origen/destino cuando existan
          // map.fitBounds([{ latitude, longitude }, { latitude, longitude }]);
          next();
        }}
        className="bg-primary-500 rounded-lg p-4"
      >
        <Text className="text-black font-JakartaBold text-center">
          Continuar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SetLocations;
