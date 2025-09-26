import React from "react";
import { View, Text } from "react-native";

import { SplashConfig } from "@/store";

import MiniSplash from "./MiniSplash";

interface DriverMiniSplashProps {
  config: Partial<SplashConfig>;
  onComplete?: () => void;
  visible: boolean;
}

const DriverMiniSplash: React.FC<DriverMiniSplashProps> = ({
  config,
  onComplete,
  visible,
}) => {
  // Default driver-specific configuration
  const driverConfig: SplashConfig = {
    id: config.id || `driver-splash-${Date.now()}`,
    type: "module_transition",
    title: config.title || "Activando Modo Conductor",
    subtitle: config.subtitle || "Preparando tu vehículo y ruta...",
    backgroundColor: "#0286FF",
    showProgress: config.showProgress !== false,
    progress: config.progress || 0,
    moduleSpecific: {
      fromModule: config.moduleSpecific?.fromModule || "customer",
      toModule: "driver",
      dataQueries: config.moduleSpecific?.dataQueries || [
        "Perfil de conductor",
        "Estado del vehículo",
        "Ubicación GPS",
        "Disponibilidad",
        "Historial de viajes",
      ],
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
