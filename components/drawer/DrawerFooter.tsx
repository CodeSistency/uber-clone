import React from "react";
import { View, Text } from "react-native";
import { DrawerFooterProps } from "./types";

// Componente para el footer del drawer
export const DrawerFooter: React.FC<DrawerFooterProps> = ({ config }) => {
  const { copyright, version } = config || {};

  return (
    <View className="border-t border-secondary-300 dark:border-secondary-600 bg-secondary-100 dark:bg-brand-primaryDark px-6 py-4">
      <View className="items-center">
        {copyright && (
          <Text className="text-xs font-JakartaMedium text-gray-500 dark:text-gray-400 mb-1">
            {copyright}
          </Text>
        )}

        {version && (
          <Text className="text-xs font-JakartaRegular text-gray-400 dark:text-gray-500">
            {version}
          </Text>
        )}
      </View>
    </View>
  );
};
