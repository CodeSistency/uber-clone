import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface FlowHeaderProps {
  title: string;
  onBack?: () => void;
  subtitle?: string;
}

const FlowHeader: React.FC<FlowHeaderProps> = ({ title, onBack, subtitle }) => {
  return (
    <View className="mb-4">
      {onBack && (
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mr-3"
            activeOpacity={0.7}
          >
            <Text className="text-lg font-JakartaBold">←</Text>
          </TouchableOpacity>
          <Text className="font-JakartaBold text-xl flex-1 text-center mr-10">
            {title}
          </Text>
        </View>
      )}

      {!onBack && (
        <View className="items-center mb-6">
          <Text className="font-JakartaBold text-2xl text-center mb-2">
            {title}
          </Text>
          {subtitle && (
            <Text className="font-Jakarta text-sm text-gray-600 text-center px-4">
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default FlowHeader;
