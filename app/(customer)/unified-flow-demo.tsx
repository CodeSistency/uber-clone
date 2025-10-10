import { Stack } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import Reanimated from "react-native-reanimated";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui";
import { websocketService } from "@/app/services/websocketService";
import { useUI } from "@/components/UIWrapper";
import {
  WebSocketStatus,
  NotificationSettings,
  VenezuelanPaymentSelector,
  DriverFlowControls,
  PerformanceMetrics,
  DevModeIndicator,
  RideStatusControls,
  SimulationControls as BaseSimulationControls,
} from "@/components/unified-flow/BaseComponents";
import FlowHeader from "@/components/unified-flow/FlowHeader";

import UnifiedFlowWrapper from "@/components/unified-flow/UnifiedFlowWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useMapFlowActions } from "@/hooks/useMapFlowActions";
import { useDevStore, useRealtimeStore, useUserStore } from "@/store";
import { tokenManager } from "@/lib/auth";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";
import { MapFlowStep } from '@/store';
import { stepRegistry, componentMapper } from "@/components/unified-flow/registry";
import { log } from "@/lib/logger";

// Componente para pasos por defecto con navegación hacia atrás
const DefaultStep: React.FC<{ step: MapFlowStep }> = React.memo(({ step }) => {
  const { back } = useMapFlow();

  return (
    <View className="flex-1">
      <FlowHeader title="Paso en Desarrollo (Customer)" onBack={back} />

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

  // Función helper para crear un renderStep usando el registry
  const createTypeSafeRenderStep = () => {
    // Configurar mapper
    componentMapper.setDefaultComponent(() => <DefaultStep step="SELECCION_SERVICIO" />);

    // Crear función de renderizado
    return (step: MapFlowStep) => {
      log.unifiedFlow.debug('Render step called', { data: step });
      
      const renderFn = componentMapper.createMapper({
        role: 'customer',
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

const SimulationControls: React.FC = () => {
  const realtime = useRealtimeStore();
  const actions = useMapFlowActions();

  return (
    <View className="px-4 py-3">
      <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide">
        Simulation & Map
      </Text>
      <View className="space-y-2">
        <Button
          variant={realtime.simulationEnabled ? "danger" : "primary"}
          title={
            realtime.simulationEnabled
              ? "⏸️ Pause Simulation"
              : "▶️ Resume Simulation"
          }
          onPress={() => {
            realtime.setSimulationEnabled(!realtime.simulationEnabled)
          }}
          className="px-4 py-2"
        />

        <Button
          variant="primary"
          title="📍 Move Driver"
          onPress={() => {
            const state = actions.getCurrentState();
            const baseLat = state.location.userLatitude || 40.7128;
            const baseLng = state.location.userLongitude || -74.006;
            const jitter = () => (Math.random() - 0.5) * 0.003;
            actions.updateDriverLocation({
              latitude: baseLat + jitter(),
              longitude: baseLng + jitter(),
              timestamp: new Date(),
            });
          }}
          className="px-4 py-2 bg-purple-600"
        />

        <Button
          variant="primary"
          title="🎯 Fit Route"
          onPress={() => {
            const state = actions.getCurrentState();
            const points: { latitude: number; longitude: number }[] = [];
            if (state.location.userLatitude && state.location.userLongitude)
              points.push({ 
                latitude: state.location.userLatitude, 
                longitude: state.location.userLongitude 
              });
            if (state.location.destinationLatitude && state.location.destinationLongitude)
              points.push({
                latitude: state.location.destinationLatitude,
                longitude: state.location.destinationLongitude,
              });
            if (state.realtime.driverLocation)
              points.push({
                latitude: state.realtime.driverLocation.latitude,
                longitude: state.realtime.driverLocation.longitude,
              });

            
          }}
          className="px-4 py-2 bg-indigo-600"
        />
      </View>
    </View>
  );
};

const WebSocketTestingControls: React.FC = () => {
  const { user } = useUserStore();
  
  const handleConnect = async () => {
    try {
      if (!user) {
        console.warn('[WebSocket] No user available');
        return;
      }
      
      const token = await tokenManager.getAccessToken();
      if (!token) {
        console.warn('[WebSocket] No token available');
        return;
      }
      
      await websocketService.connect(user.id.toString(), token);
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
    }
  };

  return (
    <View className="px-4 py-3">
      <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide">
        WebSocket Testing
      </Text>
      <View className="space-y-2">
        <Button
          variant="primary"
          title="🔌 Connect WebSocket"
          onPress={handleConnect}
          className="px-4 py-2"
        />
        <Button
          variant="danger"
          title="🔌 Disconnect WebSocket"
          onPress={() => {
            websocketService.disconnect();
          }}
          className="px-4 py-2"
        />
      </View>
    </View>
  );
};

const UnifiedFlowDemo: React.FC = () => {
  const { showLoading, showError, showSuccess } = useUI();
  const devStore = useDevStore();

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Unified Flow Demo" />
      
      <UnifiedFlowWrapper
        role="customer"
        renderStep={quietRenderStep}
        usePagerView={true}
        enablePagerViewForSteps={[
          FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
          FLOW_STEPS.CUSTOMER_TRANSPORT_SELECCION_VEHICULO,
          FLOW_STEPS.CUSTOMER_TRANSPORT_METODOLOGIA_PAGO,
        ]}
        onStepChange={(step) => {
          log.stepChange.debug('Step changed', { data: step });
        }}
        onPageChange={(pageIndex) => {
          log.pageChange.debug('Page changed', { data: pageIndex });
        }}
      />

      {/* Developer Controls */}
      {/* {devStore.developerMode && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-h-96">
          <View className="flex-row flex-wrap">
            <DriverFlowControls />
            <RideStatusControls />
            <SimulationControls />
            <WebSocketTestingControls />
            <WebSocketStatus />
            <NotificationSettings />
            <VenezuelanPaymentSelector />
            <PerformanceMetrics />
            <DevModeIndicator />
          </View>
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default UnifiedFlowDemo;
