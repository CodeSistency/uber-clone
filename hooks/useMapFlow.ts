import { useCallback } from "react";
import {
  useMapFlowStore,
  MapFlowRole,
  MapFlowStep,
  ServiceType,
  FlowRole,
  CustomerFlowStep,
  DriverFlowStep,
  CustomerTransportStep,
  DriverTransportStep,
  CustomerDeliveryStep,
  DriverDeliveryStep,
  CustomerMandadoStep,
  DriverMandadoStep,
  CustomerEnvioStep,
  DriverEnvioStep,
} from "@/store/mapFlow/mapFlow";
import { useVehicleTiersStore } from "@/store";

/**
 * Hook para controlar el flujo de mapas con navegación type-safe
 *
 * @example
 * ```typescript
 * import { FLOW_STEPS } from '@/store/mapFlow/mapFlow';
 *
 * const { startWithCustomerStep, startWithTransportStep } = useMapFlow();
 *
 * // ✅ Type-safe: Autocompletado y validación en tiempo de compilación
 * startWithCustomerStep(FLOW_STEPS.SELECCION_SERVICIO);
 * startWithCustomerStep(FLOW_STEPS.CUSTOMER_TRANSPORT.DEFINICION_VIAJE);
 * startWithTransportStep(FLOW_STEPS.CUSTOMER_TRANSPORT.SELECCION_VEHICULO, 'customer');
 * startWithTransportStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD, 'driver');
 *
 * // ❌ Error de TypeScript - paso no válido para customer
 * startWithCustomerStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD); // Error!
 *
 * // Métodos disponibles:
 * // - startWithCustomerStep(step: CustomerFlowStep)
 * // - startWithDriverStep(step: DriverFlowStep)
 * // - startWithTransportStep(step: CustomerTransportStep | DriverTransportStep, role: FlowRole)
 * // - startWithDeliveryStep(step: CustomerDeliveryStep | DriverDeliveryStep, role: FlowRole)
 * // - startWithMandadoStep(step: CustomerMandadoStep | DriverMandadoStep, role: FlowRole)
 * // - startWithEnvioStep(step: CustomerEnvioStep | DriverEnvioStep, role: FlowRole)
 *
 * // Ejemplo completo:
 * const MyComponent = () => {
 *   const {
 *     startWithCustomerStep,
 *     startWithTransportStep,
 *     startWithDeliveryStep
 *   } = useMapFlow();
 *
 *   const handleStartTransport = () => {
 *     // ✅ Type-safe: solo permite pasos de transporte válidos
 *     startWithTransportStep(FLOW_STEPS.CUSTOMER_TRANSPORT.DEFINICION_VIAJE, 'customer');
 *   };
 *
 *   const handleStartDelivery = () => {
 *     // ✅ Type-safe: solo permite pasos de delivery válidos
 *     startWithDeliveryStep(FLOW_STEPS.CUSTOMER_DELIVERY.BUSQUEDA_NEGOCIO, 'customer');
 *   };
 *
 *   const handleStartDriverView = () => {
 *     // ✅ Type-safe: solo permite pasos de driver válidos
 *     startWithTransportStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD, 'driver');
 *   };
 *
 *   return (
 *     <View>
 *       <TouchableOpacity onPress={handleStartTransport}>
 *         <Text>🚗 Iniciar Transporte</Text>
 *       </TouchableOpacity>
 *       <TouchableOpacity onPress={handleStartDelivery}>
 *         <Text>🍕 Iniciar Delivery</Text>
 *       </TouchableOpacity>
 *       <TouchableOpacity onPress={handleStartDriverView}>
 *         <Text>👨‍🚗 Vista Conductor</Text>
 *       </TouchableOpacity>
 *     </View>
 *   );
 * };
 * ```
 */
export const useMapFlow = () => {
  const state = useMapFlowStore();

  const start = useCallback(
    (role: MapFlowRole) => {
      state.start(role);
    },
    [state],
  );

  const startService = useCallback(
    async (service: ServiceType, role?: FlowRole) => {
      // Pre-load vehicle tiers when starting transport service
      if (service === "transport") {
        const tiersStore = useVehicleTiersStore.getState();

        // First try to load from AsyncStorage
        const storedTiers = await tiersStore.loadTiersFromStorage();

        if (!storedTiers) {
          // If not in storage, fetch from API
          await tiersStore.fetchTiers();
        }
      }

      state.startService(service, role);
    },
    [state],
  );

  const stop = useCallback(() => state.stop(), [state]);
  const reset = useCallback(() => state.reset(), [state]);
  const next = useCallback(() => state.next(), [state]);
  const back = useCallback(() => state.back(), [state]);
  const goTo = useCallback((step: MapFlowStep) => state.goTo(step), [state]);
  const goToStep = useCallback(
    (stepName: string) => state.goToStep(stepName),
    [state],
  );

  // Helper methods
  const getInitialStepConfig = useCallback(
    (step: MapFlowStep) => state.getInitialStepConfig(step),
    [state],
  );
  const startWithConfig = useCallback(
    (step: MapFlowStep, role?: MapFlowRole) =>
      state.startWithConfig(step, role),
    [state],
  );

  // Type-safe helper methods
  const startWithCustomerStep = useCallback(
    (step: CustomerFlowStep) => state.startWithCustomerStep(step),
    [state],
  );
  const startWithDriverStep = useCallback(
    (step: DriverFlowStep) => state.startWithDriverStep(step),
    [state],
  );
  const startWithTransportStep = useCallback(
    (step: CustomerTransportStep | DriverTransportStep, role: FlowRole) =>
      state.startWithTransportStep(step, role),
    [state],
  );
  const startWithDeliveryStep = useCallback(
    (step: CustomerDeliveryStep | DriverDeliveryStep, role: FlowRole) =>
      state.startWithDeliveryStep(step, role),
    [state],
  );
  const startWithMandadoStep = useCallback(
    (step: CustomerMandadoStep | DriverMandadoStep, role: FlowRole) =>
      state.startWithMandadoStep(step, role),
    [state],
  );
  const startWithEnvioStep = useCallback(
    (step: CustomerEnvioStep | DriverEnvioStep, role: FlowRole) =>
      state.startWithEnvioStep(step, role),
    [state],
  );

  return {
    // Include all state properties and functions from the store
    ...state,
    // Override with custom functions
    start,
    startService,
    stop,
    reset,
    next,
    back,
    goTo,
    goToStep,
    getInitialStepConfig,
    startWithConfig,
    // Type-safe helper methods
    startWithCustomerStep,
    startWithDriverStep,
    startWithTransportStep,
    startWithDeliveryStep,
    startWithMandadoStep,
    startWithEnvioStep,
  };
};
