import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMapFlow } from '@/hooks/useMapFlow';
import { AVAILABLE_SERVICES } from '@/lib/unified-flow/constants';

const ServiceSelection: React.FC = () => {
  console.log('[ServiceSelection] Component rendered');
  const { startService } = useMapFlow();

  return (
    <View className="flex-1">
      <Text className="font-JakartaBold text-xl mb-4 text-center">
        ¿Qué necesitas hoy?
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="space-y-3">
          {AVAILABLE_SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              onPress={() => {
                console.log('[ServiceSelection] Service selected:', service.id);
                startService(service.id);
              }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-3xl mr-3">{service.icon}</Text>
                <View className="flex-1">
                  <Text className="font-JakartaBold text-lg text-gray-800">
                    {service.title}
                  </Text>
                  <Text className="font-JakartaMedium text-sm text-gray-600 mt-1">
                    {service.subtitle}
                  </Text>
                  <Text className="font-Jakarta text-xs text-gray-500 mt-1">
                    {service.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ServiceSelection;
