import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { ModuleSwitcherProps } from "./types";

// Componente para cambiar entre módulos
export const ModuleSwitcher: React.FC<ModuleSwitcherProps> = ({
  currentModule,
  onModuleChange,
  availableModules = ["customer", "business", "driver"],
  disabled = false,
}) => {
  const modules = [
    {
      key: "customer" as const,
      label: "Customer",
      icon: "👤",
      shortLabel: "Cust",
    },
    {
      key: "business" as const,
      label: "Business",
      icon: "🏪",
      shortLabel: "Biz",
    },
    {
      key: "driver" as const,
      label: "Driver",
      icon: "🚗",
      shortLabel: "Driver",
    },
  ].filter((module) => availableModules.includes(module.key));

  return (
    <View className="flex-row justify-center p-3 bg-brand-primary dark:bg-brand-primaryDark border-b border-secondary-300 dark:border-secondary-600">
      {modules.map((module) => {
        const isActive = currentModule === module.key;

        return (
          <TouchableOpacity
            key={module.key}
            onPress={() => !disabled && !isActive && onModuleChange(module.key)}
            disabled={disabled || isActive}
            className={`flex-1 mx-1 py-2 px-3 rounded-lg items-center transition-colors ${
              isActive
                ? "bg-primary-500"
                : disabled
                  ? "bg-secondary-200 dark:bg-secondary-700 opacity-50"
                  : "bg-secondary-200 dark:bg-secondary-700 active:bg-secondary-300 dark:active:bg-secondary-600"
            }`}
          >
            <Text
              className={`text-xs mb-1 ${isActive ? "text-brand-primary" : "text-secondary-600 dark:text-secondary-300"}`}
            >
              {module.icon}
            </Text>
            <Text
              className={`text-xs font-JakartaMedium ${
                isActive
                  ? "text-brand-primary"
                  : "text-secondary-600 dark:text-secondary-300"
              }`}
            >
              {module.shortLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
