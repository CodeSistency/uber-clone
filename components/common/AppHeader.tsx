import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightText?: string;
  rightIcon?: string;
  onRightPress?: () => void;
  rightTextDisabled?: boolean;
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  rightText,
  rightIcon,
  onRightPress,
  rightTextDisabled = false,
  className = '',
}) => {
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className={`bg-white border-b border-gray-200 ${className}`}>
      <View className="flex-row items-center justify-between px-4 py-3">
        {/* Left side - Back button */}
        <View className="flex-1">
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBackPress}
              className="w-10 h-10 items-center justify-center"
            >
              <Text className="text-2xl text-gray-600">←</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title and Subtitle */}
        <View className="flex-2 items-center">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 text-center">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm text-gray-600 text-center mt-1">
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right side - Action button */}
        <View className="flex-1 items-end">
          {rightText && (
            <TouchableOpacity
              onPress={onRightPress}
              disabled={rightTextDisabled}
              className={`px-4 py-2 rounded-lg ${
                rightTextDisabled
                  ? 'bg-gray-100'
                  : 'bg-blue-500'
              }`}
            >
              <Text
                className={`font-Jakarta-SemiBold text-sm ${
                  rightTextDisabled
                    ? 'text-gray-400'
                    : 'text-white'
                }`}
              >
                {rightText}
              </Text>
            </TouchableOpacity>
          )}
          
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightPress}
              className="w-10 h-10 items-center justify-center"
            >
              <Text className="text-xl">{rightIcon}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};




