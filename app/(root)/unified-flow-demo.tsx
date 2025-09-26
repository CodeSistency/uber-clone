import { Stack } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";

import { Button } from "@/components/ui";

import { websocketService } from "@/app/services/websocketService";
import { useDrawer, Drawer } from "@/components/drawer";
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
import ConfirmDestination from "@/components/unified-flow/steps/Client/Viaje/ConfirmDestination";
import ConfirmOrigin from "@/components/unified-flow/steps/Client/Viaje/ConfirmOrigin";
import DriverConfirmationStep from "@/components/unified-flow/steps/Client/Viaje/DriverConfirmationStep";
import DriverMatching from "@/components/unified-flow/steps/Client/Viaje/DriverMatching";
import PaymentMethodology from "@/components/unified-flow/steps/Client/Viaje/PaymentMethodology";
import TransportDefinition from "@/components/unified-flow/steps/Client/Viaje/TransportDefinition";
import TransportVehicleSelection from "@/components/unified-flow/steps/Client/Viaje/TransportVehicleSelection";
import WaitingForAcceptance from "@/components/unified-flow/steps/Client/Viaje/WaitingForAcceptance";
import DriverConfirmation from "@/components/unified-flow/steps/Driver/DriverConfirmation";
import DriverArrived from "@/components/unified-flow/steps/DriverArrived";
import OrderBuilder from "@/components/unified-flow/steps/OrderBuilder";
import RideCancelled from "@/components/unified-flow/steps/RideCancelled";
import RideCompleted from "@/components/unified-flow/steps/RideCompleted";
import RideInProgress from "@/components/unified-flow/steps/RideInProgress";
import RideInProgressAndFinalize from "@/components/unified-flow/steps/RideInProgressAndFinalize";
import UnifiedFlowWrapper from "@/components/unified-flow/UnifiedFlowWrapper";
import { useMapFlowContext } from "@/context/MapFlowContext";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore, useDevStore } from "@/store";
import { FLOW_STEPS, MapFlowStep } from "@/store/mapFlow/mapFlow";

// Ejemplo de cómo usar métodos type-safe para diferentes escenarios
/*
const AlternativeInitializations = () => {
  const {
    startWithTransportStep,
    startWithDeliveryStep,
    startWithMandadoStep,
    startWithDriverStep
  } = useMapFlow();

  // ✅ Type-safe: Solo permite pasos de transporte válidos
  const startTransport = () => {
    startWithTransportStep(FLOW_STEPS.CUSTOMER_TRANSPORT.DEFINICION_VIAJE, 'customer');
  };

  // ✅ Type-safe: Solo permite pasos de delivery válidos
  const startDelivery = () => {
    startWithDeliveryStep(FLOW_STEPS.CUSTOMER_DELIVERY.BUSQUEDA_NEGOCIO, 'customer');
  };

  // ✅ Type-safe: Solo permite pasos de mandado válidos
  const startMandado = () => {
    startWithMandadoStep(FLOW_STEPS.CUSTOMER_MANDADO.DETALLES_MANDADO, 'customer');
  };

  // ✅ Type-safe: Solo permite pasos de driver válidos
  const startDriverView = () => {
    startWithDriverStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD);
  };

  // ❌ Error de TypeScript: paso de driver no válido para customer
  // startWithTransportStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD, 'customer'); // Error!

  return null; // Este componente es solo para ejemplo
};
*/

// Función helper para crear renderStep type-safe
/*
const createTypeSafeRenderStep = (
  stepComponents: Partial<Record<MapFlowStep, React.ComponentType>>
) => {
  return (step: MapFlowStep) => {
    const Component = stepComponents[step];
    if (Component) {
      return <Component />;
    }

    // Fallback para pasos no implementados
    return <DefaultStep step={step} />;
  };
};

// Ejemplo de uso:
/*
const stepComponents = {
  [FLOW_STEPS.SELECCION_SERVICIO]: ServiceSelection,
  [FLOW_STEPS.CUSTOMER_TRANSPORT.DEFINICION_VIAJE]: TransportDefinition,
  [FLOW_STEPS.CUSTOMER_DELIVERY.BUSQUEDA_NEGOCIO]: DeliveryBusinessSearch,
  // ... más mappings
};

const typeSafeRenderStep = createTypeSafeRenderStep(stepComponents);
*/

// Ejemplo de componente que demuestra el uso type-safe
/*
const TypeSafeFlowExample: React.FC = () => {
  const {
    startWithCustomerStep,
    startWithDriverStep,
    startWithTransportStep,
    startWithDeliveryStep,
    startWithMandadoStep,
    startWithEnvioStep
  } = useMapFlow();

  // ✅ Type-safe: Solo permite pasos válidos para customer
  const handleCustomerTransport = () => {
    startWithTransportStep(FLOW_STEPS.CUSTOMER_TRANSPORT.DEFINICION_VIAJE, 'customer');
  };

  const handleCustomerDelivery = () => {
    startWithDeliveryStep(FLOW_STEPS.CUSTOMER_DELIVERY.BUSQUEDA_NEGOCIO, 'customer');
  };

  const handleCustomerMandado = () => {
    startWithMandadoStep(FLOW_STEPS.CUSTOMER_MANDADO.DETALLES_MANDADO, 'customer');
  };

  const handleCustomerEnvio = () => {
    startWithEnvioStep(FLOW_STEPS.CUSTOMER_ENVIO.DETALLES_ENVIO, 'customer');
  };

  // ✅ Type-safe: Solo permite pasos válidos para driver
  const handleDriverTransport = () => {
    startWithTransportStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD, 'driver');
  };

  const handleDriverDelivery = () => {
    startWithDeliveryStep(FLOW_STEPS.DRIVER_DELIVERY.RECIBIR_SOLICITUD, 'driver');
  };

  // ✅ Type-safe: Métodos específicos por rol
  const handleServiceSelection = () => {
    startWithCustomerStep(FLOW_STEPS.SELECCION_SERVICIO);
  };

  const handleDriverView = () => {
    startWithDriverStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Type-Safe Flow Navigation
      </Text>

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Customer Flows:
      </Text>

      <TouchableOpacity
        style={{ backgroundColor: 'blue', padding: 10, marginBottom: 10, borderRadius: 5 }}
        onPress={handleCustomerTransport}
      >
        <Text style={{ color: 'white' }}>🚗 Start Transport</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: 'green', padding: 10, marginBottom: 10, borderRadius: 5 }}
        onPress={handleCustomerDelivery}
      >
        <Text style={{ color: 'white' }}>🍕 Start Delivery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: 'orange', padding: 10, marginBottom: 10, borderRadius: 5 }}
        onPress={handleCustomerMandado}
      >
        <Text style={{ color: 'white' }}>📦 Start Mandado</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: 'purple', padding: 10, marginBottom: 20, borderRadius: 5 }}
        onPress={handleCustomerEnvio}
      >
        <Text style={{ color: 'white' }}>📬 Start Envío</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Driver Flows:
      </Text>

      <TouchableOpacity
        style={{ backgroundColor: 'red', padding: 10, marginBottom: 10, borderRadius: 5 }}
        onPress={handleDriverTransport}
      >
        <Text style={{ color: 'white' }}>👨‍🚗 Driver Transport</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: 'brown', padding: 10, marginBottom: 20, borderRadius: 5 }}
        onPress={handleDriverDelivery}
      >
        <Text style={{ color: 'white' }}>🏪 Driver Delivery</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        General:
      </Text>

      <TouchableOpacity
        style={{ backgroundColor: 'gray', padding: 10, marginBottom: 10, borderRadius: 5 }}
        onPress={handleServiceSelection}
      >
        <Text style={{ color: 'white' }}>🎯 Service Selection</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: 'black', padding: 10, marginBottom: 10, borderRadius: 5 }}
        onPress={handleDriverView}
      >
        <Text style={{ color: 'white' }}>🚕 Driver View</Text>
      </TouchableOpacity>
    </View>
  );
};
*/

// Componente para pasos por defecto con navegación hacia atrás
const DefaultStep: React.FC<{ step: MapFlowStep }> = ({ step }) => {
  const { back } = useMapFlow();

  return (
    <View className="flex-1">
      <FlowHeader title="Paso en Desarrollo" onBack={back} />

      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-6xl mb-6">🚧</Text>
        <Text className="font-JakartaBold text-xl text-gray-800 mb-3 text-center">
          Funcionalidad Próximamente
        </Text>
        <Text className="font-Jakarta text-base text-gray-600 text-center mb-4">
          Este paso aún no está implementado pero puedes navegar hacia atrás
          para continuar con tu flujo.
        </Text>
        <Text className="font-Jakarta text-sm text-gray-500 text-center bg-gray-50 px-4 py-2 rounded-lg">
          Paso actual: {step.replace(/_/g, " ").toLowerCase()}
        </Text>
      </View>
    </View>
  );
};

// Función helper para crear un renderStep completamente type-safe
// ✅ Ventajas:
// - Parámetro step es de tipo MapFlowStep (no string genérico)
// - Autocompletado completo para las keys del mapeo
// - Error de TypeScript si intentas mapear un paso que no existe
// - Validación automática de que todos los componentes existen
const createTypeSafeRenderStep = (
  stepMappings: Partial<Record<MapFlowStep, () => React.ReactNode>>,
) => {
  return (step: MapFlowStep) => {
    const renderFn = stepMappings[step];
    if (renderFn) {
      return renderFn();
    }

    // Fallback para pasos no implementados
    return <DefaultStep step={step} />;
  };
};

// Mapeo type-safe de pasos a componentes
// ✅ Ventajas del mapeo type-safe:
// - Las keys deben ser de tipo MapFlowStep (no strings arbitrarios)
// - TypeScript valida que FLOW_STEPS.* existe y es válido
// - Autocompletado inteligente al escribir las keys
// - Error inmediato si un paso deja de existir
const STEP_COMPONENTS: Partial<Record<MapFlowStep, () => React.ReactNode>> = {
  // Selection - Paso inicial
  [FLOW_STEPS.SELECCION_SERVICIO]: () => <ServiceSelection />,

  // Customer Transport - Flujo de transporte del cliente
  [FLOW_STEPS.CUSTOMER_TRANSPORT.DEFINICION_VIAJE]: () => (
    <TransportDefinition />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRM_ORIGIN]: () => (
    <ConfirmOrigin
      onConfirm={(location) => {
        console.log("[Demo] Origin confirmed:", location);
      }}
      onBack={(location) => {
        console.log("[Demo] Origin back:", location);
      }}
    />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRM_DESTINATION]: () => (
    <ConfirmDestination
      onConfirm={(location) => {
        console.log("[Demo] Destination confirmed:", location);
      }}
      onBack={(location) => {
        console.log("[Demo] Destination back:", location);
      }}
    />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.SELECCION_VEHICULO]: () => (
    <TransportVehicleSelection />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.METODOLOGIA_PAGO]: () => (
    <PaymentMethodology />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.BUSCANDO_CONDUCTOR]: () => <DriverMatching />,
  [FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRMAR_CONDUCTOR]: () => (
    <DriverConfirmationStep />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.ESPERANDO_ACEPTACION]: () => (
    <WaitingForAcceptance />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.ELECCION_CONDUCTOR]: () => <ChooseDriver />,
  [FLOW_STEPS.CUSTOMER_TRANSPORT.GESTION_CONFIRMACION]: () => (
    <DriverConfirmation />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.DURANTE_FINALIZACION]: () => (
    <RideInProgressAndFinalize />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.CONDUCTOR_LLEGO]: () => (
    <DriverArrived
      driverName="Carlos Rodriguez"
      vehicleInfo="Toyota Camry Negro"
      onReady={() => {
        console.log("[Demo] Driver arrived - ready clicked");
        // Simulate ride started
        websocketService.simulateRideStarted(123, 456);
      }}
      onCallDriver={() => {
        console.log("[Demo] Call driver clicked");
        // TODO: Implement call functionality
      }}
    />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.VIAJE_EN_CURSO]: () => (
    <RideInProgress
      driverName="Carlos Rodriguez"
      destination="Centro Histórico, Bogotá"
      estimatedTime={15}
      onCallDriver={() => {
        console.log("[Demo] Call driver clicked");
        // TODO: Implement call functionality
      }}
      onEmergency={() => {
        console.log("[Demo] Emergency clicked");
        // TODO: Implement emergency functionality
      }}
    />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.VIAJE_COMPLETADO]: () => (
    <RideCompleted
      driverName="Carlos Rodriguez"
      fare={18.5}
      distance={12.5}
      duration={25}
      onRateDriver={() => {
        console.log("[Demo] Rate driver clicked");
        // TODO: Navigate to rating screen
      }}
      onNewRide={() => {
        console.log("[Demo] New ride clicked");
        // Navigate back to service selection
        const { startWithCustomerStep } = useMapFlow();
        startWithCustomerStep(FLOW_STEPS.SELECCION_SERVICIO);
      }}
    />
  ),
  [FLOW_STEPS.CUSTOMER_TRANSPORT.VIAJE_CANCELADO]: () => (
    <RideCancelled
      reason="El conductor canceló el viaje por motivos personales"
      canRebook={true}
      onRebook={() => {
        console.log("[Demo] Rebook clicked");
        // Navigate back to service selection
        const { startWithCustomerStep } = useMapFlow();
        startWithCustomerStep(FLOW_STEPS.SELECCION_SERVICIO);
      }}
      onGoHome={() => {
        console.log("[Demo] Go home clicked");
        // TODO: Navigate to home
      }}
    />
  ),

  // Customer Delivery - Flujo de delivery del cliente
  [FLOW_STEPS.CUSTOMER_DELIVERY.BUSQUEDA_NEGOCIO]: () => (
    <DeliveryBusinessSearch />
  ),
  [FLOW_STEPS.CUSTOMER_DELIVERY.ARMADO_PEDIDO]: () => <OrderBuilder />,
  [FLOW_STEPS.CUSTOMER_DELIVERY.CHECKOUT_CONFIRMACION]: () => (
    <DeliveryCheckout />
  ),
  [FLOW_STEPS.CUSTOMER_DELIVERY.SEGUIMIENTO_DELIVERY]: () => (
    <DeliveryTracking />
  ),

  // Customer Mandado - Flujo de mandado del cliente
  [FLOW_STEPS.CUSTOMER_MANDADO.DETALLES_MANDADO]: () => <MandadoDetails />,
  [FLOW_STEPS.CUSTOMER_MANDADO.PRECIO_PAGO]: () => <MandadoPriceAndPayment />,
  [FLOW_STEPS.CUSTOMER_MANDADO.BUSCANDO_CONDUCTOR]: () => <MandadoSearching />,
  [FLOW_STEPS.CUSTOMER_MANDADO.COMUNICACION_CONFIRMACION]: () => (
    <MandadoCommsAndConfirm />
  ),
  [FLOW_STEPS.CUSTOMER_MANDADO.FINALIZACION]: () => <MandadoFinalize />,
  // Customer Envío - Flujo de envío de paquetes
  [FLOW_STEPS.CUSTOMER_ENVIO.DETALLES_ENVIO]: () => <EnvioDetails />,
  [FLOW_STEPS.CUSTOMER_ENVIO.CALCULAR_PRECIO]: () => <EnvioPricingAndPayment />,
  [FLOW_STEPS.CUSTOMER_ENVIO.SEGUIMIENTO_PAQUETE]: () => <EnvioTracking />,
  [FLOW_STEPS.CUSTOMER_ENVIO.CONFIRMACION_ENTREGA]: () => (
    <EnvioDeliveryConfirm />
  ),

  // ❌ Ejemplos de errores que TypeScript detecta:
  // ['CUSTOMER_TRANSPORT_DEFINICION_VIAJE']: () => <TransportDefinition />, // Error: debe usar FLOW_STEPS
  // [FLOW_STEPS.CUSTOMER_TRANSPORT.PASO_INVENTADO]: () => <SomeComponent />, // Error: paso no existe
  // ['paso_que_no_existe']: () => <SomeComponent />, // Error: no es MapFlowStep

  // ✅ Ejemplos de pasos adicionales que podríamos agregar fácilmente:
  // [FLOW_STEPS.CUSTOMER_TRANSPORT.ELECCION_CONDUCTOR]: () => <DriverSelection />,
  // [FLOW_STEPS.CUSTOMER_DELIVERY.ARMADO_PEDIDO]: () => <OrderBuilder />,
  // [FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD]: () => <DriverRequest />,
};

// Crear la función renderStep usando el helper type-safe
const renderStep = createTypeSafeRenderStep(STEP_COMPONENTS);

// Función renderStep con menos logging para evitar ruido
const quietRenderStep = (step: MapFlowStep) => {
  const renderFn = STEP_COMPONENTS[step];
  return renderFn ? renderFn() : <DefaultStep step={step} />;
};

// Función para manejar errores de flujo
const handleFlowError = (error: Error, context: string) => {
  console.error(`[UnifiedFlowDemo] Error in ${context}:`, error);
  return <ErrorBoundaryStep error={error.message} />;
};

// Función para transiciones de carga
const renderLoadingState = (message: string) => {
  return <LoadingTransition message={message} />;
};

// Hook personalizado para manejar estados de error
const useFlowErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAsync = async <T,>(
    asyncFn: () => Promise<T>,
    loadingMessage: string = "Cargando...",
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFn();
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      console.error("[useFlowErrorHandler] Error:", errorObj);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    error,
    isLoading,
    handleAsync,
    clearError,
    errorComponent: error ? <ErrorBoundaryStep error={error.message} /> : null,
    loadingComponent: isLoading ? (
      <LoadingTransition message="Procesando..." />
    ) : null,
  };
};

// Ejemplo de componente completamente type-safe
/*
const TypeSafeUnifiedFlow: React.FC = () => {
  const {
    startWithCustomerStep,
    startWithDriverStep,
    step: currentStep
  } = useMapFlow();

  // Función helper type-safe para inicializar flujos
  const initializeFlow = (flowType: 'customer' | 'driver', service?: 'transport' | 'delivery' | 'mandado') => {
    if (flowType === 'customer') {
      if (service === 'transport') {
        return startWithCustomerStep(FLOW_STEPS.CUSTOMER_TRANSPORT.DEFINICION_VIAJE);
      } else if (service === 'delivery') {
        return startWithCustomerStep(FLOW_STEPS.CUSTOMER_DELIVERY.BUSQUEDA_NEGOCIO);
      } else if (service === 'mandado') {
        return startWithCustomerStep(FLOW_STEPS.CUSTOMER_MANDADO.DETALLES_MANDADO);
      } else {
        return startWithCustomerStep(FLOW_STEPS.SELECCION_SERVICIO);
      }
    } else {
      return startWithDriverStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD);
    }
  };

  // Render type-safe que usa el mapeo definido arriba
  const safeRenderStep = (step: MapFlowStep) => {
    return STEP_COMPONENTS[step]?.() ?? <DefaultStep step={step} />;
  };

  React.useEffect(() => {
    // Inicializar con service selection
    initializeFlow('customer');
  }, []);

  return (
    <UnifiedFlowWrapper
      role="customer"
      renderStep={safeRenderStep} // ✅ Type-safe: paso debe ser MapFlowStep
    />
  );
};
*/

// Componente wrapper que maneja la inicialización del flujo
const UnifiedFlowDemoContentInner: React.FC<{
  drawer: ReturnType<typeof useDrawer>;
}> = ({ drawer }) => {
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
  const errorHandler = useFlowErrorHandler();
  // Inicializar con el paso de selección de servicio cuando se monta
  React.useEffect(() => {
    const initializeFlow = async () => {
      if (!hasInitialized.current) {
        console.log("[UnifiedFlowDemo] Initializing with SELECCION_SERVICIO");

        try {
          // ✅ Type-safe: FLOW_STEPS.SELECCION_SERVICIO es de tipo SelectionStep
          // Esto garantiza que solo podemos pasar pasos válidos para customer
          const config = startWithCustomerStep(FLOW_STEPS.SELECCION_SERVICIO);

          if (config) {
            console.log("[UnifiedFlowDemo] Started with config:", {
              bottomSheetVisible: config.bottomSheetVisible ?? false,
              bottomSheetMinHeight: config.bottomSheetMinHeight ?? 0,
              bottomSheetMaxHeight: config.bottomSheetMaxHeight ?? 0,
              bottomSheetInitialHeight: config.bottomSheetInitialHeight ?? 0,
              mapInteraction: config.mapInteraction ?? "default",
              transitionType: config.transitionType ?? "default",
            });
          }

          hasInitialized.current = true;
        } catch (error) {
          console.error("[UnifiedFlowDemo] Failed to initialize flow:", error);
        }
      }
    };

    initializeFlow();
  }, []); // Dependencia vacía para ejecutar solo una vez al montar

  // Renderizar componentes de error o loading si es necesario
  if (errorHandler.error) {
    return errorHandler.errorComponent;
  }

  if (errorHandler.isLoading) {
    return errorHandler.loadingComponent;
  }

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
          Flujo Unificado Demo
        </Text>
        <View className="w-10" />
      </View>

      <UnifiedFlowWrapper role="customer" renderStep={quietRenderStep}>
        <SimulationControls />
      </UnifiedFlowWrapper>
    </>
  );
};

const SimulationControls: React.FC = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [animationValue] = React.useState(new Animated.Value(0));
  const realtime = useRealtimeStore();
  const devStore = useDevStore();
  const ui = useUI();
  const { map } = useMapFlowContext();

  // Animación de expansión/colapso
  React.useEffect(() => {
    Animated.spring(animationValue, {
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [isExpanded]);

  // Debug logging para verificar que los estados cambian
  React.useEffect(() => {
    console.log("[SimulationControls] DevStore state changed:", {
      developerMode: devStore.developerMode,
      networkBypass: devStore.networkBypass,
      wsBypass: devStore.wsBypass,
    });
  }, [devStore.developerMode, devStore.networkBypass, devStore.wsBypass]);

  return (
    <View
      style={{
        position: "absolute",
        top: 120, // Aumentado para evitar el header
        right: 16,
        zIndex: 2000,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      {/* Overlay para cerrar al tocar fuera */}
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
      {/* Botón principal de toggle */}
      <View className="relative">
        <Button
          variant="primary"
          title={isExpanded ? "✕" : "🔧"}
          onPress={() => setIsExpanded(!isExpanded)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full w-14 h-14 shadow-lg border-2 border-white/20"
        />
        {/* Indicador de estado activo */}
        {devStore.developerMode && (
          <View className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border border-white" />
        )}
      </View>

      {/* Panel expandible */}
      {isExpanded && (
        <Animated.View
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
          {/* Header */}
          <View className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-4 py-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-JakartaBold text-sm text-white">
                ⚙️ Simulation Controls
              </Text>
              {/* Estado actual del developer mode */}
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

          {/* WebSocket Status */}
          <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center justify-between">
              <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                WebSocket Status
              </Text>
              <WebSocketStatus />
            </View>
          </View>

          {/* Developer Mode Section */}
          <DevModeIndicator />

          {/* Notification Settings */}
          <NotificationSettings />

          {/* Venezuelan Payment System */}
          <VenezuelanPaymentSelector />

          {/* Driver Flow Controls */}
          <DriverFlowControls />

          {/* Ride Status Controls */}
          <RideStatusControls />

          {/* WebSocket Testing Controls */}
          <WebSocketTestingControls />

          {/* Performance Metrics */}
          <PerformanceMetrics />

          {/* Simulation & Map Controls */}
          <BaseSimulationControls />
        </Animated.View>
      )}
    </View>
  );
};

// Componente del drawer customer separado para estar encima de todo
const DrawerCustomer: React.FC<{
  drawerState?: ReturnType<typeof useDrawer>;
}> = ({ drawerState }) => {
  // Si se proporciona drawerState, úsalo. Si no, crea uno nuevo.
  const drawer = drawerState || useDrawer({ module: "customer" });

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
const useCustomerDrawer = () => {
  return useDrawer({ module: "customer" });
};

// Wrapper para compartir el estado del drawer
const UnifiedFlowDemoContent: React.FC = () => {
  const drawer = useCustomerDrawer();

  return (
    <>
      <UnifiedFlowDemoContentInner drawer={drawer} />
      <DrawerCustomer drawerState={drawer} />
    </>
  );
};

// Componente para testing de WebSocket events
const WebSocketTestingControls: React.FC = () => {
  const { rideId, matchedDriver } = useMapFlow() as any;
  const { showSuccess, showError } = useUI();

  const simulateRideAccepted = () => {
    if (!rideId || !matchedDriver) {
      showError("Error", "No hay rideId o conductor seleccionado");
      return;
    }

    console.log("[WebSocketTesting] Simulating ride accepted");
    websocketService.simulateRideAccepted(rideId, matchedDriver.id, 5);
    showSuccess("Simulado", "Ride accepted enviado");
  };

  const simulateRideRejected = () => {
    if (!rideId || !matchedDriver) {
      showError("Error", "No hay rideId o conductor seleccionado");
      return;
    }

    console.log("[WebSocketTesting] Simulating ride rejected");
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

    console.log("[WebSocketTesting] Simulating driver arrived");
    websocketService.simulateRideArrived(rideId, 456);
    showSuccess("Simulado", "Driver arrived enviado");
  };

  const simulateRideStarted = () => {
    if (!rideId) {
      showError("Error", "No hay rideId");
      return;
    }

    console.log("[WebSocketTesting] Simulating ride started");
    websocketService.simulateRideStarted(rideId, 456);
    showSuccess("Simulado", "Ride started enviado");
  };

  const simulateRideCompleted = () => {
    if (!rideId) {
      showError("Error", "No hay rideId");
      return;
    }

    console.log("[WebSocketTesting] Simulating ride completed");
    websocketService.simulateRideCompleted(rideId, 456);
    showSuccess("Simulado", "Ride completed enviado");
  };

  const simulateRideCancelled = () => {
    if (!rideId) {
      showError("Error", "No hay rideId");
      return;
    }

    console.log("[WebSocketTesting] Simulating ride cancelled");
    websocketService.simulateRideCancelled(rideId, 456);
    showSuccess("Simulado", "Ride cancelled enviado");
  };

  const simulateDriverRequest = () => {
    if (!rideId) {
      showError("Error", "No hay rideId");
      return;
    }

    console.log("[WebSocketTesting] Simulating driver ride request");
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

export default function UnifiedFlowDemo() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <UnifiedFlowDemoContent />
    </>
  );
}
