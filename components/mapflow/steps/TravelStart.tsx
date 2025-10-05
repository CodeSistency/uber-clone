import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useMapFlow } from "@/hooks/useMapFlow";

const TravelStart: React.FC = () => {
  
  const { next } = useMapFlow();
  

  return (
    <View>
      <Text className="font-JakartaBold text-xl mb-3">
        ¿A dónde quieres viajar?
      </Text>
      <TouchableOpacity
        onPress={() => {
          
          next();
        }}
        className="mt-2 bg-primary-500 rounded-lg p-4"
      >
        <Text className="text-black font-JakartaBold text-center">Viajar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TravelStart;
