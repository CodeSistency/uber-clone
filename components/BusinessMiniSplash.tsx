import React from "react";

import { SplashConfig } from "@/store";

import MiniSplash from "./MiniSplash";

interface BusinessMiniSplashProps {
  config: Partial<SplashConfig>;
  onComplete?: () => void;
  visible: boolean;
}

const BusinessMiniSplash: React.FC<BusinessMiniSplashProps> = ({
  config,
  onComplete,
  visible,
}) => {
  // Default business-specific configuration
  const businessConfig: SplashConfig = {
    id: config.id || `business-splash-${Date.now()}`,
    type: "module_transition",
    title: config.title || "Activando Modo Negocio",
    subtitle: config.subtitle || "Cargando tu panel administrativo...",
    backgroundColor: "#10B981",
    showProgress: config.showProgress !== false,
    progress: config.progress || 0,
    moduleSpecific: {
      fromModule: config.moduleSpecific?.fromModule || "customer",
      toModule: "business",
      dataQueries: config.moduleSpecific?.dataQueries || [
        "Perfil del negocio",
        "Productos activos",
        "Estadísticas de ventas",
        "Inventario",
        "Pedidos pendientes",
      ],
    },
    actions: config.actions,
    duration: config.duration,
    ...config, // Allow overrides
  };

  return (
    <MiniSplash
      config={businessConfig}
      onComplete={onComplete}
      visible={visible}
    />
  );
};

export default BusinessMiniSplash;
