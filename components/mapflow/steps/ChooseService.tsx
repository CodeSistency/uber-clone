import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useMapFlow } from "@/hooks/useMapFlow";

const ChooseService: React.FC = () => {
  const { next } = useMapFlow();

  return (
    <View>
      <Text className="font-JakartaBold text-lg mb-3">
        Selecciona un servicio
      </Text>
      <View className="flex-row mb-3">
        <TouchableOpacity className="flex-1 bg-white rounded-lg p-4 mr-2 border border-gray-200">
          <Text className="font-JakartaBold">Económico</Text>
          <Text className="text-secondary-700">Rápido y accesible</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
          <Text className="font-JakartaBold">Premium</Text>
          <Text className="text-secondary-700">Mayor confort</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={next}
        className="bg-primary-500 rounded-lg p-4"
      >
        <Text className="text-black font-JakartaBold text-center">
          Continuar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChooseService;
