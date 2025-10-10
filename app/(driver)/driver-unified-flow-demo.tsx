import { Stack } from "expo-router";
import React, { useMemo } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppHeader } from "@/components/AppHeader";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import UnifiedFlowWrapper from "@/components/unified-flow/UnifiedFlowWrapper";
import { stepRegistry, componentMapper } from "@/components/unified-flow/registry";
import { useMapFlow } from "@/hooks/useMapFlow";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";
import { log } from "@/lib/logger";
import { MapFlowStep } from "@/store";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Componente para pasos por defecto con navegación hacia atrás
const DefaultStep: React.FC<{ step: MapFlowStep }> = React.memo(({ step }) => {
  const { back } = useMapFlow();

  return (
    <View className="flex-1">
      <FlowHeader title="Paso en Desarrollo (Driver)" onBack={back} />

      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-6xl mb-6">🚧</Text>
        <Text className="font-JakartaBold text-xl text-gray-800 mb-3 text-center">
          Paso no implementado aún
        </Text>
        <Text className="font-Jakarta text-sm text-gray-500 text-center bg-gray-50 px-4 py-2 rounded-lg">
          Paso actual: {String(step).replace(/_/g, " ").toLowerCase()}
        </Text>
      </View>
    </View>
  );
});

DefaultStep.displayName = "DefaultStep";

const createTypeSafeRenderStep = () => {
  // Configurar mapper
  componentMapper.setDefaultComponent(() => <DefaultStep step="DRIVER_DISPONIBILIDAD" />);

  // Crear función de renderizado
  return (step: MapFlowStep) => {
    log.unifiedFlow.debug('Render step called', { data: step });
    
    const renderFn = componentMapper.createMapper({
      role: 'driver',
      fallbackToDefault: true,
      showDebugInfo: __DEV__,
    });
    
    const result = renderFn(step);
    log.unifiedFlow.debug('Render result', { data: result });
    return result;
  };
};

// Crear la función renderStep usando el registry centralizado
const renderStep = createTypeSafeRenderStep();

// Función para renderizar pasos sin logging (para uso en UnifiedFlowWrapper)
const quietRenderStep = (step: MapFlowStep) => {
  return renderStep(step);
};

const DriverUnifiedFlowDemo: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();
  const hasInitialized = React.useRef(false);

  React.useEffect(() => {
    if (!hasInitialized.current) {
      startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
      hasInitialized.current = true;
    }
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Flujo Unificado Conductor"
        subtitle="Sistema de navegación modular"
        showHamburgerMenu={true}
      />
      
      <UnifiedFlowWrapper role="driver" renderStep={quietRenderStep} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

export default function DriverUnifiedFlowDemoScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <DriverUnifiedFlowDemo />
    </>
  );
}