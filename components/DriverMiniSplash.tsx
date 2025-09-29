import React from "react";
import { View, Text } from "react-native";

import { SplashConfig } from "@/store";

import MiniSplash from "./MiniSplash";

interface DriverMiniSplashProps {
  config: Partial<SplashConfig>;
  onComplete?: () => void;
  visible: boolean;
  isFirstTime?: boolean; // New prop to indicate if this is the user's first time
}

const DriverMiniSplash: React.FC<DriverMiniSplashProps> = ({
  config,
  onComplete,
  visible,
  isFirstTime = false,
}) => {
  // Customize messages based on whether it's the first time or a regular switch
  const getTitle = () => {
    if (isFirstTime) {
      return config.title || "Bienvenido al Modo Conductor";
    }
    return config.title || "Activando Modo Conductor";
  };

  const getSubtitle = () => {
    if (isFirstTime) {
      return config.subtitle || "Configurando tu cuenta de conductor...";
    }
    return config.subtitle || "Preparando tu vehículo y ruta...";
  };

  const getDataQueries = () => {
    if (isFirstTime) {
      return config.moduleSpecific?.dataQueries || [
        "Verificando perfil de conductor",
        "Configurando preferencias",
        "Cargando datos del vehículo",
        "Preparando interfaz de conductor",
      ];
    }
    return config.moduleSpecific?.dataQueries || [
      "Perfil de conductor",
      "Estado del vehículo",
      "Ubicación GPS",
      "Disponibilidad",
      "Historial de viajes",
    ];
  };

  // Default driver-specific configuration
  const driverConfig: SplashConfig = {
    id: config.id || `driver-splash-${Date.now()}`,
    type: "module_transition",
    title: getTitle(),
    subtitle: getSubtitle(),
    backgroundColor: "#0286FF",
    showProgress: config.showProgress !== false,
    progress: config.progress || 0,
    moduleSpecific: {
      fromModule: config.moduleSpecific?.fromModule || "customer",
      toModule: "driver",
      dataQueries: getDataQueries(),
    },
    actions: config.actions,
    duration: config.duration,
    ...config, // Allow overrides
  };

  return (
    <MiniSplash
      config={driverConfig}
      onComplete={onComplete}
      visible={visible}
    />
  );
};

export default DriverMiniSplash;
