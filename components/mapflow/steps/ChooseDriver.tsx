import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useMapFlow } from '@/hooks/useMapFlow';

const ChooseDriver: React.FC = () => {
  const { next, back } = useMapFlow();

  return (
    <View>
      <Text className="font-JakartaBold text-lg mb-2">Conductores cercanos</Text>
      <View className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
        <Text className="font-JakartaMedium">Conductor 1 • 4.8★ • 3 min</Text>
      </View>
      <View className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
        <Text className="font-JakartaMedium">Conductor 2 • 4.7★ • 5 min</Text>
      </View>
      <View className="flex-row">
        <TouchableOpacity onPress={back} className="flex-1 bg-gray-200 rounded-lg p-4 mr-2">
          <Text className="text-gray-800 font-JakartaBold text-center">Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={next} className="flex-1 bg-primary-500 rounded-lg p-4">
          <Text className="text-black font-JakartaBold text-center">Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChooseDriver;


