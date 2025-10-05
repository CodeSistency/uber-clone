import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";

import { ModuleType } from "@/components/drawer/types";
import { useModuleTransition } from "@/store/module/module";

interface ModuleSwitcherWithSplashProps {
  currentModule: ModuleType;
  onModuleChange?: (module: ModuleType) => void;
  onClose?: () => void;
}

const ModuleSwitcherWithSplash: React.FC<ModuleSwitcherWithSplashProps> = ({
  currentModule,
  onModuleChange,
  onClose,
}) => {
  const {
    switchToDriver,
    switchToBusiness,
    switchToCustomer,
    isSplashActive,
    splashProgress,
    currentTransition,
  } = useModuleTransition();

  const handleModuleSwitch = async (targetModule: ModuleType) => {
    if (targetModule === currentModule) {
      
      return;
    }

    try {
      switch (targetModule) {
        case "driver":
          await switchToDriver();
          break;
        case "business":
          await switchToBusiness();
          break;
        case "customer":
          await switchToCustomer();
          break;
      }

      onModuleChange?.(targetModule);
      onClose?.(); // Close drawer after successful module switch
    } catch (error) {
      Alert.alert("No se pudo cambiar el módulo");
      
    }
  };

  const getModuleInfo = (module: ModuleType) => {
    switch (module) {
      case "customer":
        return {
          title: "Cliente",
          description: "Viajes y reservas",
          icon: "👤",
          color: "bg-blue-500",
        };
      case "driver":
        return {
          title: "Conductor",
          description: "Gestionar viajes",
          icon: "🚗",
          color: "bg-green-500",
        };
      case "business":
        return {
          title: "Negocio",
          description: "Administrar pedidos",
          icon: "🏢",
          color: "bg-purple-500",
        };
      default:
        return {
          title: "Desconocido",
          description: "",
          icon: "❓",
          color: "bg-gray-500",
        };
    }
  };

  const modules: ModuleType[] = ["customer", "driver", "business"];

  return (
    <View className="p-4">
      <Text className="text-xl font-JakartaBold text-center mb-6">
        Cambiar de Módulo
      </Text>

      {/* Current module indicator */}
      <View className="bg-gray-100 rounded-lg p-4 mb-6">
        <Text className="text-sm font-JakartaMedium text-gray-600 mb-2">
          Módulo Actual
        </Text>
        <View className="flex-row items-center">
          <Text className="text-2xl mr-3">
            {getModuleInfo(currentModule).icon}
          </Text>
          <View>
            <Text className="text-lg font-JakartaBold">
              {getModuleInfo(currentModule).title}
            </Text>
            <Text className="text-sm text-gray-600">
              {getModuleInfo(currentModule).description}
            </Text>
          </View>
        </View>
      </View>

      {/* Splash status indicator */}
      {isSplashActive && (
        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <Text className="text-sm font-JakartaMedium text-yellow-800 mb-2">
            Cambiando de módulo...
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-yellow-700">
              {currentTransition?.fromModule} → {currentTransition?.toModule}
            </Text>
            <Text className="text-sm font-JakartaBold text-yellow-800">
              {splashProgress}%
            </Text>
          </View>
          <View className="w-full bg-yellow-200 rounded-full h-2 mt-2">
            <View
              className="bg-yellow-500 h-2 rounded-full"
              style={{ width: `${splashProgress}%` }}
            />
          </View>
        </View>
      )}

      {/* Module options */}
      <Text className="text-lg font-JakartaSemiBold mb-4">
        Seleccionar Módulo
      </Text>

      {modules.map((module) => {
        const info = getModuleInfo(module);
        const isCurrent = module === currentModule;

        return (
          <TouchableOpacity
            key={module}
            onPress={() => handleModuleSwitch(module)}
            disabled={isSplashActive}
            className={`flex-row items-center p-4 rounded-lg mb-3 border-2 ${
              isCurrent
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white"
            } ${isSplashActive ? "opacity-50" : ""}`}
          >
            <Text className="text-2xl mr-4">{info.icon}</Text>
            <View className="flex-1">
              <Text
                className={`text-lg font-JakartaSemiBold ${
                  isCurrent ? "text-blue-700" : "text-gray-800"
                }`}
              >
                {info.title}
              </Text>
              <Text
                className={`text-sm ${
                  isCurrent ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {info.description}
              </Text>
              {isCurrent && (
                <Text className="text-xs text-blue-500 font-JakartaMedium mt-1">
                  Módulo actual
                </Text>
              )}
            </View>
            {isCurrent && (
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                <Text className="text-white text-sm">✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Helper text */}
      <Text className="text-xs text-gray-500 text-center mt-4">
        Los cambios de módulo muestran un splash screen mientras se cargan los
        datos necesarios.
      </Text>
    </View>
  );
};

export default ModuleSwitcherWithSplash;
