import { Stack } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

import { Button } from "@/components/ui";
import { useDrawer, Drawer } from "@/components/drawer";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import DriverAvailability from "@/components/unified-flow/steps/Client/Delivery/DriverAvailability";
import DriverDeliveryConfirmFinish from "@/components/unified-flow/steps/Driver/Delivery/DriverDeliveryConfirmFinish";
import DriverDeliveryNavigateToBusiness from "@/components/unified-flow/steps/Driver/Delivery/DriverDeliveryNavigateToBusiness";
import DriverDeliveryPickupOrder from "@/components/unified-flow/steps/Driver/Delivery/DriverDeliveryPickupOrder";
import DriverDeliveryToCustomer from "@/components/unified-flow/steps/Driver/Delivery/DriverDeliveryToCustomer";
import DriverFinalizationRating from "@/components/unified-flow/steps/Driver/DriverFinalizationRating";
import DriverIncomingRequest from "@/components/unified-flow/steps/Driver/DriverIncomingRequest";
import DriverTransportEarnings from "@/components/unified-flow/steps/Driver/DriverTransportEarnings";
import DriverTransportRating from "@/components/unified-flow/steps/Driver/DriverTransportRating";
import DriverEnvioDeliveryConfirm from "@/components/unified-flow/steps/Driver/Envio/DriverEnvioDeliveryConfirm";
import DriverEnvioNavigateToDestination from "@/components/unified-flow/steps/Driver/Envio/DriverEnvioNavigateToDestination";
import DriverEnvioNavigateToOrigin from "@/components/unified-flow/steps/Driver/Envio/DriverEnvioNavigateToOrigin";
import DriverEnvioPickupPackage from "@/components/unified-flow/steps/Driver/Envio/DriverEnvioPickupPackage";
import DriverMandadoFinish from "@/components/unified-flow/steps/Driver/Mandado/DriverMandadoFinish";
import DriverMandadoManage from "@/components/unified-flow/steps/Driver/Mandado/DriverMandadoManage";
import DriverMandadoNavigateToDestination from "@/components/unified-flow/steps/Driver/Mandado/DriverMandadoNavigateToDestination";
import DriverMandadoNavigateToOriginChat from "@/components/unified-flow/steps/Driver/Mandado/DriverMandadoNavigateToOriginChat";
import DriverTransportAcceptReject from "@/components/unified-flow/steps/Driver/Viaje/DriverTransportAcceptReject";
import DriverTransportArrivedAtOrigin from "@/components/unified-flow/steps/Driver/Viaje/DriverTransportArrivedAtOrigin";
import DriverTransportEndPayment from "@/components/unified-flow/steps/Driver/Viaje/DriverTransportEndPayment";
import DriverTransportInProgress from "@/components/unified-flow/steps/Driver/Viaje/DriverTransportInProgress";
import DriverTransportNavigateToOrigin from "@/components/unified-flow/steps/Driver/Viaje/DriverTransportNavigateToOrigin";
import UnifiedFlowWrapper from "@/components/unified-flow/UnifiedFlowWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";
import { MapFlowStep } from "@/store/mapFlow/mapFlow";

const DefaultStep: React.FC<{ step: MapFlowStep }> = ({ step }) => {
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
};

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

const STEP_COMPONENTS: Partial<Record<MapFlowStep, () => React.ReactNode>> = {
  // Driver availability
  [FLOW_STEPS.DRIVER_DISPONIBILIDAD]: () => <DriverAvailability />,

  // Transport
  [FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD]: () => (
    <DriverIncomingRequest />
  ),
  [FLOW_STEPS.DRIVER_TRANSPORT_EN_CAMINO_ORIGEN]: () => (
    <DriverTransportNavigateToOrigin />
  ),
  [FLOW_STEPS.DRIVER_TRANSPORT_EN_ORIGEN]: () => (
    <DriverTransportArrivedAtOrigin />
  ),
  [FLOW_STEPS.DRIVER_TRANSPORT_INICIAR_VIAJE]: () => (
    <DriverTransportInProgress />
  ),
  [FLOW_STEPS.DRIVER_TRANSPORT_EN_VIAJE]: () => <DriverTransportInProgress />,
  [FLOW_STEPS.DRIVER_TRANSPORT_COMPLETAR_VIAJE]: () => (
    <DriverTransportEndPayment />
  ),
  // Rating step for transport rides
  [FLOW_STEPS.DRIVER_FINALIZACION_RATING]: () => <DriverTransportRating />,

  // Delivery
  [FLOW_STEPS.DRIVER_DELIVERY_RECIBIR_SOLICITUD]: () => (
    <DriverIncomingRequest />
  ),
  [FLOW_STEPS.DRIVER_DELIVERY_PREPARAR_PEDIDO]: () => (
    <DriverDeliveryNavigateToBusiness />
  ),
  [FLOW_STEPS.DRIVER_DELIVERY_RECOGER_PEDIDO]: () => (
    <DriverDeliveryPickupOrder />
  ),
  [FLOW_STEPS.DRIVER_DELIVERY_EN_CAMINO_ENTREGA]: () => (
    <DriverDeliveryToCustomer />
  ),
  [FLOW_STEPS.DRIVER_DELIVERY_ENTREGAR_PEDIDO]: () => (
    <DriverDeliveryConfirmFinish />
  ),

  // Mandado
  [FLOW_STEPS.DRIVER_MANDADO_RECIBIR_SOLICITUD]: () => (
    <DriverIncomingRequest />
  ),
  [FLOW_STEPS.DRIVER_MANDADO_EN_CAMINO_ORIGEN]: () => (
    <DriverMandadoNavigateToOriginChat />
  ),
  [FLOW_STEPS.DRIVER_MANDADO_RECOGER_PRODUCTOS]: () => <DriverMandadoManage />,
  [FLOW_STEPS.DRIVER_MANDADO_EN_CAMINO_DESTINO]: () => (
    <DriverMandadoNavigateToDestination />
  ),
  [FLOW_STEPS.DRIVER_MANDADO_ENTREGAR_MANDADO]: () => <DriverMandadoFinish />,

  // Envío
  [FLOW_STEPS.DRIVER_ENVIO_RECIBIR_SOLICITUD]: () => <DriverIncomingRequest />,
  [FLOW_STEPS.DRIVER_ENVIO_EN_CAMINO_ORIGEN]: () => (
    <DriverEnvioNavigateToOrigin />
  ),
  [FLOW_STEPS.DRIVER_ENVIO_RECOGER_PAQUETE]: () => <DriverEnvioPickupPackage />,
  [FLOW_STEPS.DRIVER_ENVIO_EN_CAMINO_DESTINO]: () => (
    <DriverEnvioNavigateToDestination />
  ),
  [FLOW_STEPS.DRIVER_ENVIO_ENTREGAR_PAQUETE]: () => (
    <DriverEnvioDeliveryConfirm />
  ),
};

const renderStep = createTypeSafeRenderStep(STEP_COMPONENTS);

interface DriverUnifiedFlowContentProps {
  drawer: ReturnType<typeof useDrawer>;
}

const DriverUnifiedFlowContent: React.FC<DriverUnifiedFlowContentProps> = ({
  drawer,
}) => {
  const { startWithDriverStep } = useMapFlow();
  const hasInitialized = React.useRef(false);

  React.useEffect(() => {
    if (!hasInitialized.current) {
      startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
      hasInitialized.current = true;
    }
  }, []);

  return (
    <>
      {/* Header con drawer */}
      <View className="flex-row items-center justify-between p-4 bg-brand-primary dark:bg-brand-primaryDark shadow-sm z-10 border-b border-secondary-300 dark:border-secondary-600">
        <Button
          variant="ghost"
          title="☰"
          onPress={drawer.toggle}
          className="p-2 text-secondary-700 dark:text-secondary-300"
        />
        <Text className="text-lg font-JakartaBold text-secondary-700 dark:text-secondary-300">
          Flujo Unificado Conductor
        </Text>
        <View className="w-10" />
      </View>

      <UnifiedFlowWrapper role="driver" renderStep={renderStep} />
    </>
  );
};

// Componente del drawer driver separado para estar encima de todo
const DrawerDriver: React.FC<{
  drawerState?: ReturnType<typeof useDrawer>;
}> = ({ drawerState }) => {
  // Si se proporciona drawerState, úsalo. Si no, crea uno nuevo.
  const drawer = drawerState || useDrawer({ module: "driver" });

  return (
    <Drawer
      config={drawer.config}
      isOpen={drawer.isOpen}
      activeRoute={drawer.activeRoute}
      expandedRoutes={drawer.expandedRoutes}
      currentModule={drawer.currentModule}
      isTransitioning={drawer.isTransitioning}
      onRoutePress={drawer.handleRoutePress}
      onToggleExpanded={drawer.toggleExpanded}
      onClose={drawer.close}
      onModuleChange={drawer.switchModule}
    />
  );
};

// Hook para compartir el estado del drawer entre componentes
const useDriverDrawer = () => {
  return useDrawer({ module: "driver" });
};

// Wrapper para compartir el estado del drawer
const DriverUnifiedFlowDemoContent: React.FC = () => {
  const drawer = useDriverDrawer();

  return (
    <>
      <DriverUnifiedFlowContent drawer={drawer} />
      <DrawerDriver drawerState={drawer} />
    </>
  );
};

export default function DriverUnifiedFlowDemo() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <DriverUnifiedFlowDemoContent />
    </>
  );
}
