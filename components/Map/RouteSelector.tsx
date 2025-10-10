import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { AlternativeRoute } from '@/types/map';

interface RouteSelectorProps {
  routes: AlternativeRoute[];
  selectedIndex: number;
  onSelectRoute: (index: number) => void;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  selectedIndex,
  onSelectRoute,
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="absolute bottom-24 left-0 right-0"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {routes.map((route, index) => {
        const isSelected = index === selectedIndex;
        
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onSelectRoute(index)}
            className={`mr-3 p-4 rounded-xl ${
              isSelected ? 'bg-primary' : 'bg-white'
            } shadow-lg`}
            style={{ minWidth: 120 }}
          >
            <Text className={`font-JakartaBold text-sm ${
              isSelected ? 'text-white' : 'text-gray-800'
            }`}>
              Ruta {index + 1}
            </Text>
            
            {route.isFastest && (
              <Text className="text-xs text-green-500 mt-1">⚡ Más rápida</Text>
            )}
            {route.isShortest && (
              <Text className="text-xs text-blue-500 mt-1">📏 Más corta</Text>
            )}
            
            <Text className={`text-xs mt-2 ${
              isSelected ? 'text-white' : 'text-gray-600'
            }`}>
              {route.durationText}
            </Text>
            <Text className={`text-xs ${
              isSelected ? 'text-white' : 'text-gray-500'
            }`}>
              {route.distanceText}
            </Text>
            
            <View className="flex-row items-center mt-2">
              <View className={`w-2 h-2 rounded-full ${
                route.trafficLevel === 'low' ? 'bg-green-500' :
                route.trafficLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <Text className={`text-xs ml-1 ${
                isSelected ? 'text-white' : 'text-gray-500'
              }`}>
                Tráfico {
                  route.trafficLevel === 'low' ? 'bajo' :
                  route.trafficLevel === 'medium' ? 'medio' : 'alto'
                }
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default RouteSelector;
