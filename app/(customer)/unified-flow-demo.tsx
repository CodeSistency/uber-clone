import { Stack } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import Reanimated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui";
import { websocketService } from "@/app/services/websocketService";
import { useUI } from "@/components/UIWrapper";
import {
  ErrorBoundaryStep,
  LoadingTransition,
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
import ChooseDriver from "@/components/unified-flow/steps/Client/ChooseDriver";
import DeliveryBusinessSearch from "@/components/unified-flow/steps/Client/Delivery/DeliveryBusinessSearch";
import DeliveryCheckout from "@/components/unified-flow/steps/Client/Delivery/DeliveryCheckout";
import DeliveryTracking from "@/components/unified-flow/steps/Client/Delivery/DeliveryTracking";
import EnvioDeliveryConfirm from "@/components/unified-flow/steps/Client/Envio/EnvioDeliveryConfirm";
import EnvioDetails from "@/components/unified-flow/steps/Client/Envio/EnvioDetails";
import EnvioPricingAndPayment from "@/components/unified-flow/steps/Client/Envio/EnvioPricingAndPayment";
import EnvioTracking from "@/components/unified-flow/steps/Client/Envio/EnvioTracking";
import MandadoCommsAndConfirm from "@/components/unified-flow/steps/Client/Mandado/MandadoCommsAndConfirm";
import MandadoDetails from "@/components/unified-flow/steps/Client/Mandado/MandadoDetails";
import MandadoFinalize from "@/components/unified-flow/steps/Client/Mandado/MandadoFinalize";
import MandadoPriceAndPayment from "@/components/unified-flow/steps/Client/Mandado/MandadoPriceAndPayment";
import MandadoSearching from "@/components/unified-flow/steps/Client/Mandado/MandadoSearching";
import ServiceSelection from "@/components/unified-flow/steps/Client/ServiceSelection";
import UnifiedFlowWrapper from "@/components/unified-flow/UnifiedFlowWrapper";
import { useMapFlowContext } from "@/context/MapFlowContext";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore, useDevStore } from "@/store";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";
import { MapFlowStep } from "@/store/mapFlow/mapFlow";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Componente para pasos por defecto con navegación hacia atrás
const DefaultStep: React.FC<{ step: MapFlowStep }> = ({ step }) => {
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
};

// Función helper para crear un renderStep completamente type-safe
const createTypeSafeRenderStep = (
  stepMappings: Partial<Record<MapFlowStep, () => React.ReactNode>>,
) => {
  return (step: MapFlowStep) => {
    const renderFn = stepMappings[step];
    if (renderFn) {
      return renderFn();
    }
    return <DefaultStep step={step} />;
  };
};

// Mapeo type-safe de pasos a componentes - usando solo pasos que existen
const STEP_COMPONENTS: Partial<Record<MapFlowStep, () => React.ReactNode>> = {
  // Service selection
  [FLOW_STEPS.SELECCION_SERVICIO]: () => <ServiceSelection />,

  // Transport - usando pasos que existen
  [FLOW_STEPS.CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR]: () => <ChooseDriver />,

  // Delivery - usando pasos que existen (comentados hasta que existan las constantes)
  // [FLOW_STEPS.CUSTOMER_DELIVERY_BUSINESS_SEARCH]: () => <DeliveryBusinessSearch />,
  // [FLOW_STEPS.CUSTOMER_DELIVERY_CHECKOUT]: () => <DeliveryCheckout />,
  // [FLOW_STEPS.CUSTOMER_DELIVERY_TRACKING]: () => <DeliveryTracking />,

  // Mandado - usando pasos que existen (comentados hasta que existan las constantes)
  [FLOW_STEPS.CUSTOMER_MANDADO_DETALLES_MANDADO]: () => <MandadoDetails />,
  // [FLOW_STEPS.CUSTOMER_MANDADO_SEARCHING]: () => <MandadoSearching />,
  // [FLOW_STEPS.CUSTOMER_MANDADO_COMMS_AND_CONFIRM]: () => <MandadoCommsAndConfirm />,
  // [FLOW_STEPS.CUSTOMER_MANDADO_PRICE_AND_PAYMENT]: () => <MandadoPriceAndPayment />,
  [FLOW_STEPS.CUSTOMER_MANDADO_FINALIZACION]: () => <MandadoFinalize />,

  // Envío - usando pasos que existen (comentados hasta que existan las constantes)
  [FLOW_STEPS.CUSTOMER_ENVIO_DETALLES_ENVIO]: () => <EnvioDetails />,
  // [FLOW_STEPS.CUSTOMER_ENVIO_PRICING_AND_PAYMENT]: () => <EnvioPricingAndPayment />,
  // [FLOW_STEPS.CUSTOMER_ENVIO_TRACKING]: () => <EnvioTracking />,
  // [FLOW_STEPS.CUSTOMER_ENVIO_DELIVERY_CONFIRM]: () => <EnvioDeliveryConfirm />,
};

// Crear la función renderStep usando el helper type-safe
const renderStep = createTypeSafeRenderStep(STEP_COMPONENTS);

// Función para renderizar pasos sin logging (para uso en UnifiedFlowWrapper)
const quietRenderStep = (step: MapFlowStep) => {
  return renderStep(step);
};

const SimulationControls: React.FC = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [animationValue] = React.useState(new Animated.Value(0));
  const realtime = useRealtimeStore();
  const devStore = useDevStore();
  const ui = useUI();
  const { map } = useMapFlowContext();

  React.useEffect(() => {
    Animated.spring(animationValue, {
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [isExpanded]);

  React.useEffect(() => {
  }, [devStore.developerMode, devStore.networkBypass, devStore.wsBypass]);

  return (
    <View
      style={{
        position: "absolute",
        top: 120,
        right: 16,
        zIndex: 2000,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      {isExpanded && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: -120,
            left: -1000,
            right: -1000,
            bottom: -1000,
            zIndex: -1,
          }}
          onPress={() => setIsExpanded(false)}
          activeOpacity={1}
        />
      )}
      <View className="relative">
        <Button
          variant="primary"
          title={isExpanded ? "✕" : "🔧"}
          onPress={() => setIsExpanded(!isExpanded)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full w-14 h-14 shadow-lg border-2 border-white/20"
        />
        {devStore.developerMode && (
          <View className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border border-white" />
        )}
      </View>

      {isExpanded && (
        <Reanimated.View
          className="mt-2 bg-white/95 dark:bg-brand-primaryDark rounded-xl shadow-lg border border-gray-200/50 overflow-hidden min-w-[280px] max-w-[320px]"
          style={{
            opacity: animationValue,
            transform: [
              {
                scale: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }}
        >
          <View className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-4 py-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-JakartaBold text-sm text-white">
                ⚙️ Simulation Controls
              </Text>
              <View className="flex-row items-center space-x-1">
                <View
                  className={`w-2 h-2 rounded-full ${
                    devStore.developerMode
                      ? "bg-emerald-300"
                      : devStore.networkBypass
                        ? "bg-orange-300"
                        : devStore.wsBypass
                          ? "bg-red-300"
                          : "bg-gray-400"
                  }`}
                />
                <Text className="text-white text-xs font-JakartaMedium">
                  {devStore.developerMode
                    ? "DEV ON"
                    : devStore.networkBypass
                      ? "MOCK"
                      : devStore.wsBypass
                        ? "WS OFF"
                        : "LIVE"}
                </Text>
              </View>
            </View>
          </View>

          <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center justify-between">
              <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                WebSocket Status
              </Text>
              <WebSocketStatus />
            </View>
          </View>

          <DevModeIndicator />
          <NotificationSettings />
          <VenezuelanPaymentSelector />
          <DriverFlowControls />
          <RideStatusControls />
          <WebSocketTestingControls />
          <PerformanceMetrics />
          <BaseSimulationControls />
        </Reanimated.View>
      )}
    </View>
  );
};

const WebSocketTestingControls: React.FC = () => {
  const { rideId, matchedDriver } = useMapFlow() as any;
  const { showSuccess, showError } = useUI();

  const simulateRideAccepted = () => {
    if (!rideId || !matchedDriver) {
      showError("Error", "No hay rideId o conductor seleccionado");
      return;
    }
    websocketService.simulateRideAccepted(rideId, matchedDriver.id, 5);
    showSuccess("Simulado", "Ride accepted enviado");
  };

  const simulateRideRejected = () => {
    if (!rideId || !matchedDriver) {
      showError("Error", "No hay rideId o conductor seleccionado");
      return;
    }
    websocketService.simulateRideRejected(
      rideId,
      matchedDriver.id,
      "Conductor ocupado",
    );
    showSuccess("Simulado", "Ride rejected enviado");
  };

  const simulateDriverArrived = () => {
    if (!rideId) {
      showError("Error", "No hay rideId");
      return;
    }
    websocketService.simulateRideArrived(rideId, 456);
    showSuccess("Simulado", "Driver arrived enviado");
  };

  const simulateRideStarted = () => {
    if (!rideId) {
      showError("Error", "No hay rideId");
      return;
    }
    websocketService.simulateRideStarted(rideId, 456);
    showSuccess("Simulado", "Ride started enviado");
  };

  const simulateRideCompleted = () => {
    if (!rideId) {
      showError("Error", "No hay rideId");
      return;
    }
    websocketService.simulateRideCompleted(rideId, 456);
    showSuccess("Simulado", "Ride completed enviado");
  };

  const simulateRideCancelled = () => {
    if (!rideId) {
      showError("Error", "No hay rideId");
      return;
    }
    websocketService.simulateRideCancelled(rideId, 456);
    showSuccess("Simulado", "Ride cancelled enviado");
  };

  const simulateDriverRequest = () => {
    if (!rideId) {
      showError("Error", "No hay rideId");
      return;
    }
    websocketService.simulateDriverRideRequest(
      rideId,
      123,
      "Dirección de prueba",
    );
    showSuccess("Simulado", "Driver ride request enviado");
  };

  return (
    <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
      <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 mb-2">
        🔌 WebSocket Testing (New Events)
      </Text>
      <View className="space-y-1">
        <Button
          variant="success"
          title="✅ Ride Accepted"
          onPress={simulateRideAccepted}
          className="px-3 py-2"
        />
        <Button
          variant="primary"
          title="📍 Driver Arrived"
          onPress={simulateDriverArrived}
          className="px-3 py-2 bg-blue-500"
        />
        <Button
          variant="primary"
          title="▶️ Ride Started"
          onPress={simulateRideStarted}
          className="px-3 py-2 bg-purple-500"
        />
        <Button
          variant="primary"
          title="✅ Ride Completed"
          onPress={simulateRideCompleted}
          className="px-3 py-2 bg-indigo-500"
        />
        <Button
          variant="secondary"
          title="❌ Ride Cancelled"
          onPress={simulateRideCancelled}
          className="px-3 py-2"
        />
        <Button
          variant="danger"
          title="🚫 Ride Rejected"
          onPress={simulateRideRejected}
          className="px-3 py-2"
        />
        <Button
          variant="secondary"
          title="👨‍🚗 Driver Request"
          onPress={simulateDriverRequest}
          className="px-3 py-2"
        />
        <View className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            Ride ID: {rideId || "N/A"}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            Driver ID: {matchedDriver?.id || "N/A"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const UnifiedFlowDemo: React.FC = () => {
  const {
    startWithCustomerStep,
    step,
    isActive,
    confirmedOrigin,
    confirmedDestination,
  } = useMapFlow();
  const hasInitialized = React.useRef(false);
  const realtime = useRealtimeStore();
  const ui = useUI();

  React.useEffect(() => {
    const initializeFlow = async () => {
      if (!hasInitialized.current) {
        try {
          const config = startWithCustomerStep(FLOW_STEPS.SELECCION_SERVICIO);
          if (config) {
          }
          hasInitialized.current = true;
        } catch (error) {
        }
      }
    };
    initializeFlow();
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Flujo Unificado Demo"
        subtitle="Sistema de navegación modular"
        showHamburgerMenu={true}
      />
      
      <UnifiedFlowWrapper role="customer" renderStep={quietRenderStep}>
        <SimulationControls />
      </UnifiedFlowWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

export default function UnifiedFlowDemoExport() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <UnifiedFlowDemo />
    </>
  );
}