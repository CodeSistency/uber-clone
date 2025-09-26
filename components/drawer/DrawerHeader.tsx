import React from "react";
import { View, Text, Image } from "react-native";

import { DrawerHeaderProps } from "./types";

// Componente para el header del drawer
export const DrawerHeader: React.FC<DrawerHeaderProps> = ({ config }) => {
  const { title, subtitle, avatar } = config || {};

  return (
    <View className="border-b border-secondary-300 dark:border-secondary-600 bg-secondary-100 dark:bg-brand-primaryDark">
      {/* User Info */}
      {(title || subtitle || avatar) && (
        <View className="px-6 py-4">
          {avatar && (
            <View className="items-center mb-3">
              <Image
                source={{ uri: avatar }}
                className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
              />
            </View>
          )}

          <View className="items-center">
            {title && (
              <Text className="text-lg font-JakartaBold text-gray-900 dark:text-white">
                {title}
              </Text>
            )}

            {subtitle && (
              <Text className="text-sm font-JakartaMedium text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
