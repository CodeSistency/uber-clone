import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useMapFlow } from '@/hooks/useMapFlow';

const TransportDefinition: React.FC = () => {
  const { next } = useMapFlow();

  return (
    <View className="flex-1">
      <Text className="font-JakartaBold text-xl mb-3 text-center">
        Definir Viaje
      </Text>

      {/* Origen */}
      <View className="bg-gray-50 rounded-lg p-4 mb-3">
        <Text className="font-JakartaMedium text-sm text-gray-600 mb-2">Origen</Text>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-lg mr-2">📍</Text>
          <Text className="font-Jakarta text-gray-700 flex-1">
            Tu ubicación actual
          </Text>
        </TouchableOpacity>
      </View>

      {/* Destino */}
      <View className="bg-gray-50 rounded-lg p-4 mb-3">
        <Text className="font-JakartaMedium text-sm text-gray-600 mb-2">Destino</Text>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-lg mr-2">🎯</Text>
          <Text className="font-Jakarta text-gray-500 flex-1">
            Toca para seleccionar destino
          </Text>
        </TouchableOpacity>
      </View>

      {/* Viajes recientes */}
      <View className="mb-4">
        <Text className="font-JakartaBold text-sm text-gray-700 mb-2">
          Viajes recientes
        </Text>
        <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 rounded-lg">
          <Text className="text-lg mr-2">🏠</Text>
          <View className="flex-1">
            <Text className="font-JakartaMedium text-gray-800">Casa</Text>
            <Text className="font-Jakarta text-xs text-gray-500">Calle Principal 123</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => next()}
        className="bg-primary-500 rounded-lg p-4 mt-4"
      >
        <Text className="text-white font-JakartaBold text-center">Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TransportDefinition;
