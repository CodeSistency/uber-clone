import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { icons } from "@/constants";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface TripSummaryHeaderProps {
  origin?: LocationData;
  destination?: LocationData;
  onBack: () => void;
  showBackButton?: boolean;
}

const TripSummaryHeader: React.FC<TripSummaryHeaderProps> = ({
  origin,
  destination,
  onBack,
  showBackButton = true
}) => {
  // Debug logs
  console.log('[TripSummaryHeader] Received props:', { origin, destination });

  // Función para truncar direcciones largas
  const truncateAddress = (address: string, maxLength: number = 25) => {
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength - 3) + "...";
  };

  return (
    <View className="absolute top-0 left-0 right-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <View className="flex-row items-center justify-between p-4">
        {/* Botón de retroceso */}
        {showBackButton && (
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-xl text-gray-600 dark:text-gray-300">←</Text>
          </TouchableOpacity>
        )}

        {/* Información del viaje */}
        <View className="flex-1 mx-4">
          {/* Origen */}
          <View className="flex-row items-center mb-1">
            <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-2">
              <View className="w-2 h-2 bg-white rounded-full" />
            </View>
            <Text className="flex-1 font-Jakarta text-sm text-gray-600 dark:text-gray-300">
              {origin ? truncateAddress(origin.address) : "Origen no definido"}
            </Text>
          </View>

          {/* Línea conectora */}
          <View className="flex-row items-center ml-3 mb-1">
            <View className="w-px h-4 bg-gray-300 dark:bg-gray-600 mr-2" />
            <Text className="text-xs text-gray-400 dark:text-gray-500 mr-2">↓</Text>
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Destino */}
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-2">
              <View className="w-2 h-2 bg-white rounded-full" />
            </View>
            <Text className="flex-1 font-Jakarta text-sm text-gray-600 dark:text-gray-300">
              {destination ? truncateAddress(destination.address) : "Destino no definido"}
            </Text>
          </View>
        </View>

        {/* Espacio para balancear */}
        <View className="w-10" />
      </View>
    </View>
  );
};

export default TripSummaryHeader;
