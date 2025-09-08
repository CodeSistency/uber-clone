import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import UnifiedFlowWrapper from '@/components/unified-flow/UnifiedFlowWrapper';
import FlowHeader from '@/components/unified-flow/FlowHeader';
import { useMapFlow } from '@/hooks/useMapFlow';
import { FLOW_STEPS, MapFlowStep } from '@/store/mapFlow/mapFlow';

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

// Importar componentes de pasos del flujo unificado
import ServiceSelection from '@/components/unified-flow/steps/ServiceSelection';
import TransportDefinition from '@/components/unified-flow/steps/TransportDefinition';
import TransportVehicleSelection from '@/components/unified-flow/steps/TransportVehicleSelection';
import DeliveryBusinessSearch from '@/components/unified-flow/steps/DeliveryBusinessSearch';
import MandadoDetails from '@/components/unified-flow/steps/MandadoDetails';

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
      <FlowHeader
        title="Paso en Desarrollo"
        onBack={back}
      />

      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-6xl mb-6">🚧</Text>
        <Text className="font-JakartaBold text-xl text-gray-800 mb-3 text-center">
          Funcionalidad Próximamente
        </Text>
        <Text className="font-Jakarta text-base text-gray-600 text-center mb-4">
          Este paso aún no está implementado pero puedes navegar hacia atrás para continuar con tu flujo.
        </Text>
        <Text className="font-Jakarta text-sm text-gray-500 text-center bg-gray-50 px-4 py-2 rounded-lg">
          Paso actual: {step.replace(/_/g, ' ').toLowerCase()}
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
  stepMappings: Partial<Record<MapFlowStep, () => React.ReactNode>>
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
  [FLOW_STEPS.CUSTOMER_TRANSPORT.DEFINICION_VIAJE]: () => <TransportDefinition />,
  [FLOW_STEPS.CUSTOMER_TRANSPORT.SELECCION_VEHICULO]: () => <TransportVehicleSelection />,

  // Customer Delivery - Flujo de delivery del cliente
  [FLOW_STEPS.CUSTOMER_DELIVERY.BUSQUEDA_NEGOCIO]: () => <DeliveryBusinessSearch />,

  // Customer Mandado - Flujo de mandado del cliente
  [FLOW_STEPS.CUSTOMER_MANDADO.DETALLES_MANDADO]: () => <MandadoDetails />,

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
const UnifiedFlowDemoContent: React.FC = () => {
  const { startWithCustomerStep, step, isActive } = useMapFlow();
  const hasInitialized = React.useRef(false);

  // Inicializar con el paso de selección de servicio cuando se monta
  React.useEffect(() => {
    // Solo inicializar una vez y si no está ya en el estado correcto
    if (!hasInitialized.current) {
      console.log('[UnifiedFlowDemo] Initializing with SELECCION_SERVICIO');

      // ✅ Type-safe: FLOW_STEPS.SELECCION_SERVICIO es de tipo SelectionStep
      // Esto garantiza que solo podemos pasar pasos válidos para customer
      const config = startWithCustomerStep(FLOW_STEPS.SELECCION_SERVICIO);

      console.log('[UnifiedFlowDemo] Started with config:', {
        bottomSheetVisible: config.bottomSheetVisible,
        bottomSheetMinHeight: config.bottomSheetMinHeight,
        bottomSheetMaxHeight: config.bottomSheetMaxHeight,
        bottomSheetInitialHeight: config.bottomSheetInitialHeight,
        mapInteraction: config.mapInteraction,
        transitionType: config.transitionType
      });

      hasInitialized.current = true;
    }
  }, []); // Dependencia vacía para ejecutar solo una vez al montar

  return <UnifiedFlowWrapper role="customer" renderStep={quietRenderStep} />;
};

export default function UnifiedFlowDemo() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Flujo Unificado Demo' }} />

      {/* Integración del Flujo Unificado con inicialización */}
      <UnifiedFlowDemoContent />
    </>
  );
}
