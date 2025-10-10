import React, { useCallback, useMemo, useEffect } from 'react';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store';

// Importar los componentes reales
import ServiceSelection from '@/components/unified-flow/steps/Client/ServiceSelection';
import TransportDefinition from '@/components/unified-flow/steps/Client/Viaje/TransportDefinition';
import ConfirmOrigin from '@/components/unified-flow/steps/Client/Viaje/ConfirmOrigin';
import ConfirmDestination from '@/components/unified-flow/steps/Client/Viaje/ConfirmDestination';
import TransportVehicleSelection from '@/components/unified-flow/steps/Client/Viaje/TransportVehicleSelection';
import PaymentMethodology from '@/components/unified-flow/steps/Client/Viaje/PaymentMethodology';
import DriverMatching from '@/components/unified-flow/steps/Client/Viaje/DriverMatching';
import WaitingForAcceptance from '@/components/unified-flow/steps/Client/Viaje/WaitingForAcceptance';
import DriverConfirmation from '@/components/unified-flow/steps/Driver/DriverConfirmation';
import DriverArrived from '@/components/unified-flow/steps/DriverArrived';
import RideInProgressAndFinalize from '@/components/unified-flow/steps/DriverArrived';
import RideInProgress from '@/components/unified-flow/steps/RideInProgress';
import RideCompleted from '@/components/unified-flow/steps/RideCompleted';
import RideCancelled from '@/components/unified-flow/steps/RideCancelled';
import ChooseDriver from '@/components/unified-flow/steps/Client/ChooseDriver';
import DriverConfirmationStep from '@/components/unified-flow/steps/Client/Viaje/DriverConfirmationStep';
import DeliveryBusinessSearch from '@/components/unified-flow/steps/Client/Delivery/DeliveryBusinessSearch';
import DeliveryCheckout from '@/components/unified-flow/steps/Client/Delivery/DeliveryCheckout';
import DeliveryTracking from '@/components/unified-flow/steps/Client/Delivery/DeliveryTracking';
import OrderBuilder from '@/components/unified-flow/steps/OrderBuilder';
import MandadoDetails from '@/components/unified-flow/steps/Client/Mandado/MandadoDetails';
import MandadoPriceAndPayment from '@/components/unified-flow/steps/Client/Mandado/MandadoPriceAndPayment';
import MandadoSearching from '@/components/unified-flow/steps/Client/Mandado/MandadoSearching';
import MandadoCommsAndConfirm from '@/components/unified-flow/steps/Client/Mandado/MandadoCommsAndConfirm';
import MandadoFinalize from '@/components/unified-flow/steps/Client/Mandado/MandadoFinalize';
import EnvioDetails from '@/components/unified-flow/steps/Client/Envio/EnvioDetails';
import EnvioPricingAndPayment from '@/components/unified-flow/steps/Client/Envio/EnvioPricingAndPayment';
import EnvioTracking from '@/components/unified-flow/steps/Client/Envio/EnvioTracking';
import EnvioDeliveryConfirm from '@/components/unified-flow/steps/Client/Envio/EnvioDeliveryConfirm';

// Configuración de pasos para PagerView (extendiendo STEP_COMPONENTS)
interface PagerStepConfig {
  component: () => React.ReactNode;
  pagerConfig?: {
    enableSwipe: boolean;
    showProgress: boolean;
    allowSkip: boolean;
    canNavigateBack: boolean;
    canNavigateForward: boolean;
    progressStyle: 'dots' | 'bar' | 'steps';
    progressColor: string;
    required: boolean;
  };
}

// Función para crear componentes con configuración de PagerView
const createPagerStepConfig = (
  component: () => any,
  pagerConfig: {
    enableSwipe: boolean;
    showProgress: boolean;
    allowSkip: boolean;
    canNavigateBack: boolean;
    canNavigateForward: boolean;
    progressStyle: 'dots' | 'bar' | 'steps';
    progressColor: string;
    required: boolean;
  }
): PagerStepConfig => ({
  component,
  pagerConfig,
});

// Mapeo extendido de STEP_COMPONENTS con configuración de PagerView
const STEP_COMPONENTS_WITH_PAGER: Partial<Record<MapFlowStep, PagerStepConfig>> = {
  // Service selection
  SELECCION_SERVICIO: createPagerStepConfig(
    () => ServiceSelection({}),
    {
      enableSwipe: true,
      showProgress: true,
      allowSkip: false,
      canNavigateBack: true,
      canNavigateForward: true,
      progressStyle: 'bar',      // 🆕 Cambiar a barra
      progressColor: '#0286FF',
      required: true,
    }
  ),
  
  // Transport steps
  CUSTOMER_TRANSPORT_DEFINICION_VIAJE: createPagerStepConfig(
    () => TransportDefinition({}),
    {
      enableSwipe: true,
      showProgress: true,
      allowSkip: false,
      canNavigateBack: true,
      canNavigateForward: true,
      progressStyle: 'bar',      // 🆕 Cambiar a barra
      progressColor: '#0286FF',
      required: true,
    }
  ),
  
  CUSTOMER_TRANSPORT_CONFIRM_ORIGIN: createPagerStepConfig(
    () => ConfirmOrigin({
      onConfirm: (location) => {
        console.log("[PagerView] Origin confirmed:", location);
      },
      onBack: (location) => {
        console.log("[PagerView] Origin back:", location);
      },
    }),
    {
      enableSwipe: true,
      showProgress: true,
      allowSkip: false,
      canNavigateBack: true,
      canNavigateForward: true,
      progressStyle: 'bar',      // 🆕 Cambiar a barra
      progressColor: '#0286FF',
      required: true,
    }
  ),
  
  CUSTOMER_TRANSPORT_CONFIRM_DESTINATION: createPagerStepConfig(
    () => ConfirmDestination({
      onConfirm: (location) => {
        console.log("[PagerView] Destination confirmed:", location);
      },
      onBack: (location) => {
        console.log("[PagerView] Destination back:", location);
      },
    }),
    {
      enableSwipe: true,
      showProgress: true,
      allowSkip: false,
      canNavigateBack: true,
      canNavigateForward: true,
      progressStyle: 'bar',      // 🆕 Cambiar a barra
      progressColor: '#0286FF',
      required: true,
    }
  ),
  
  CUSTOMER_TRANSPORT_SELECCION_VEHICULO: createPagerStepConfig(
    () => TransportVehicleSelection({}),
    {
      enableSwipe: true,
      showProgress: true,
      allowSkip: false,
      canNavigateBack: true,
      canNavigateForward: true,
      progressStyle: 'bar',      // 🆕 Cambiar a barra
      progressColor: '#0286FF',
      required: true,
    }
  ),
  
  CUSTOMER_TRANSPORT_METODOLOGIA_PAGO: createPagerStepConfig(
    () => PaymentMethodology({}),
    {
      enableSwipe: true,
      showProgress: true,
      allowSkip: false,
      canNavigateBack: true,
      canNavigateForward: true,
      progressStyle: 'bar',      // 🆕 Cambiar a barra
      progressColor: '#0286FF',
      required: true,
    }
  ),
  
  CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR: createPagerStepConfig(
    () => DriverMatching({}),
    {
      enableSwipe: false,        // No permitir swipe durante búsqueda
      showProgress: true,
      allowSkip: false,
      canNavigateBack: false,    // No permitir volver durante búsqueda
      canNavigateForward: false, // No permitir avanzar hasta encontrar conductor
      progressStyle: 'bar',      // 🆕 Cambiar a barra
      progressColor: '#00FF88',
      required: true,
    }
  ),
  
  CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION: createPagerStepConfig(
    () => WaitingForAcceptance({}),
    {
      enableSwipe: false,        // No permitir swipe durante espera
      showProgress: true,
      allowSkip: false,
      canNavigateBack: false,
      canNavigateForward: false,
      progressStyle: 'bar',      // ✅ Ya estaba en barra
      progressColor: '#FFE014',
      required: true,
    }
  ),
  
  CUSTOMER_TRANSPORT_GESTION_CONFIRMACION: createPagerStepConfig(
    () => DriverConfirmation({}),
    {
      enableSwipe: false,        // No permitir swipe en confirmación
      showProgress: true,
      allowSkip: false,
      canNavigateBack: true,
      canNavigateForward: false, // No permitir avanzar hasta confirmar
      progressStyle: 'bar',      // 🆕 Cambiar a barra
      progressColor: '#0286FF',
      required: true,
    }
  ),
  
  CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO: createPagerStepConfig(
    () => DriverArrived({
      onReady: () => {
        console.log("[PagerView] Driver arrived - ready clicked");
      },
      onCallDriver: () => {
        console.log("[PagerView] Call driver clicked");
      },
    }),
    {
      enableSwipe: false,        // No permitir swipe cuando conductor llegó
      showProgress: true,
      allowSkip: false,
      canNavigateBack: false,
      canNavigateForward: false,
      progressStyle: 'bar',      // 🆕 Cambiar a barra
      progressColor: '#10B981',
      required: true,
    }
  ),
  
  CUSTOMER_TRANSPORT_DURANTE_FINALIZACION: createPagerStepConfig(
    () => RideInProgressAndFinalize({
      onReady: () => {
        console.log("[PagerView] Ride in progress - ready clicked");
      },
      onCallDriver: () => {
        console.log("[PagerView] Call driver clicked");
      },
    }),
    {
      enableSwipe: false,        // No permitir swipe en rating
      showProgress: true,
      allowSkip: false,
      canNavigateBack: false,
      canNavigateForward: false,
      progressStyle: 'bar',      // 🆕 Cambiar a barra
      progressColor: '#F59E0B',
      required: true,
    }
  ),
};

export const useMapFlowPagerWithSteps = () => {
  const { 
    step, 
    variant, 
    setUsePagerView,
    setPagerSteps,
    setCurrentPageIndex,
    goToNextPage,
    goToPreviousPage,
    goToPagerStep,
    navigateToPage,
    setNavigationConfig,
    setVisualConfig,
    setAnimationConfig,
    setValidationConfig,
    setTransitioning,
    markStepCompleted,
    markStepSkipped,
    setRequiredSteps,
    setError,
    clearError,
    incrementRetryCount,
    resetRetryCount,
  } = useMapFlowStore();
  
  // 🆕 Activar PagerView por defecto si no está configurado
  React.useEffect(() => {
    if (!variant.usePagerView) {
      console.log('[useMapFlowPagerWithSteps] Activating PagerView by default');
      setUsePagerView(true);
    } else {
      console.log('[useMapFlowPagerWithSteps] PagerView already activated');
    }
  }, [variant.usePagerView, setUsePagerView]);
  
  // 🔍 LOG: Estado inicial del hook
  console.log('[useMapFlowPagerWithSteps] Hook initialized:', {
    step,
    variant: {
      usePagerView: variant.usePagerView,
      currentPageIndex: variant.currentPageIndex,
      totalPages: variant.totalPages,
      pagerSteps: variant.pagerSteps.length,
      isTransitioning: variant.isTransitioning
    }
  });
  
  // Obtener configuración de pasos para PagerView
  const getPagerSteps = useCallback(() => {
    // Filtrar pasos que tienen configuración de pager
    const allSteps = Object.keys(STEP_COMPONENTS_WITH_PAGER);
    const steps = allSteps
      .filter(stepKey => {
        const config = STEP_COMPONENTS_WITH_PAGER[stepKey as MapFlowStep];
        const hasPagerConfig = config?.pagerConfig;
        console.log('[useMapFlowPagerWithSteps] Checking step:', {
          stepKey,
          hasConfig: !!config,
          hasPagerConfig,
          hasComponent: !!config?.component
        });
        return hasPagerConfig;
      }) as MapFlowStep[];
    
    console.log('[useMapFlowPagerWithSteps] getPagerSteps:', {
      allSteps,
      availableSteps: steps,
      totalSteps: steps.length,
      stepComponentsKeys: Object.keys(STEP_COMPONENTS_WITH_PAGER)
    });
    
    return steps;
  }, []);
  
  // Obtener configuración de un paso específico
  const getStepPagerConfig = useCallback((step: MapFlowStep) => {
    const config = STEP_COMPONENTS_WITH_PAGER[step];
    const pagerConfig = config?.pagerConfig || null;
    
    console.log('[useMapFlowPagerWithSteps] getStepPagerConfig:', {
      step,
      hasConfig: !!config,
      pagerConfig,
      component: config?.component ? 'available' : 'null'
    });
    
    return pagerConfig;
  }, []);
  
  // Determinar si un paso debe usar PagerView
  const shouldUsePagerForStep = useCallback((step: MapFlowStep) => {
    const config = getStepPagerConfig(step);
    const shouldUse = !!config && variant.usePagerView;
    
    console.log('[useMapFlowPagerWithSteps] shouldUsePagerForStep:', {
      step,
      hasConfig: !!config,
      usePagerView: variant.usePagerView,
      shouldUse
    });
    
    return shouldUse;
  }, [getStepPagerConfig, variant.usePagerView]);
  
  // Obtener pasos ordenados para PagerView
  const getOrderedPagerSteps = useCallback(() => {
    const pagerSteps = getPagerSteps();
    
    // Ordenar pasos según el flujo lógico
    const stepOrder: MapFlowStep[] = [
      'SELECCION_SERVICIO',
      'CUSTOMER_TRANSPORT_DEFINICION_VIAJE',
      'CUSTOMER_TRANSPORT_CONFIRM_ORIGIN',
      'CUSTOMER_TRANSPORT_CONFIRM_DESTINATION',
      'CUSTOMER_TRANSPORT_SELECCION_VEHICULO',
      'CUSTOMER_TRANSPORT_METODOLOGIA_PAGO',
      'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR',
      'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION',
      'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION',
      'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO',
      'CUSTOMER_TRANSPORT_DURANTE_FINALIZACION', // Corregido: usar el paso correcto
    ];
    
    console.log('[useMapFlowPagerWithSteps] getOrderedPagerSteps:', {
      pagerSteps,
      stepOrder,
      filteredSteps: stepOrder.filter(step => pagerSteps.includes(step))
    });
    
    // Filtrar y ordenar según el orden lógico
    const orderedSteps = stepOrder.filter(step => pagerSteps.includes(step));
    console.log('[useMapFlowPagerWithSteps] Final ordered steps:', orderedSteps);
    
    return orderedSteps;
  }, [getPagerSteps]);
  
  // Renderizar componente de paso - SOLO retornar la configuración, no ejecutar el componente
  const getStepComponentConfig = useCallback((step: MapFlowStep) => {
    console.log('[useMapFlowPagerWithSteps] getStepComponentConfig called for step:', step);
    
    const config = STEP_COMPONENTS_WITH_PAGER[step];
    console.log('[useMapFlowPagerWithSteps] Config found:', {
      step,
      hasConfig: !!config,
      hasComponent: !!config?.component,
      hasPagerConfig: !!config?.pagerConfig
    });
    
    if (!config) {
      console.log('[useMapFlowPagerWithSteps] No config found for step:', step);
      return null;
    }
    
    if (!config.component) {
      console.log('[useMapFlowPagerWithSteps] No component function found for step:', step);
      return null;
    }
    
    // Retornar la función del componente, no ejecutarla
    return config.component;
  }, []);
  
  // Obtener configuración de progreso para el paso actual
  const getCurrentProgressConfig = useCallback(() => {
    const config = getStepPagerConfig(step);
    if (!config) {
      return null;
    }
    
    return {
      progressStyle: config.progressStyle,
      progressColor: config.progressColor,
      showProgress: config.showProgress,
    };
  }, [step, getStepPagerConfig]);
  
  // Configurar variante automáticamente según el paso
  useEffect(() => {
    const stepConfig = getStepPagerConfig(step);
    if (stepConfig) {
      // Configurar navegación
      setNavigationConfig({
        enableSwipe: stepConfig.enableSwipe,
        showProgress: stepConfig.showProgress,
        allowSkip: stepConfig.allowSkip,
        canNavigateBack: stepConfig.canNavigateBack,
        canNavigateForward: stepConfig.canNavigateForward,
      });
      
      // Configurar visual
      setVisualConfig({
        progressColor: stepConfig.progressColor,
        progressStyle: stepConfig.progressStyle,
      });
    }
  }, [step, getStepPagerConfig, setNavigationConfig, setVisualConfig]);
  
  // Inicializar pasos del pager si no están configurados
  useEffect(() => {
    if (variant.usePagerView && variant.pagerSteps.length === 0) {
      const orderedSteps = getOrderedPagerSteps();
      setPagerSteps(orderedSteps);
    }
  }, [variant.usePagerView, variant.pagerSteps.length, getOrderedPagerSteps, setPagerSteps]);
  
  // Sincronizar índice de página con el paso actual
  useEffect(() => {
    if (variant.usePagerView && variant.pagerSteps.length > 0) {
      const stepIndex = variant.pagerSteps.findIndex(s => s === step);
      if (stepIndex !== -1 && stepIndex !== variant.currentPageIndex) {
        setCurrentPageIndex(stepIndex);
      }
    }
  }, [step, variant.usePagerView, variant.pagerSteps, variant.currentPageIndex, setCurrentPageIndex]);
  
  // 🔍 LOG: Estado final que se retorna del hook
  const finalState = {
    // Estado
    pagerSteps: variant.pagerSteps.length > 0 ? variant.pagerSteps : getOrderedPagerSteps(),
    currentStepConfig: getStepPagerConfig(step),
    shouldUsePager: shouldUsePagerForStep(step),
    progressConfig: getCurrentProgressConfig(),
    currentPageIndex: variant.currentPageIndex,
    totalPages: variant.totalPages,
    isTransitioning: variant.isTransitioning,
    usePagerView: variant.usePagerView, // 🆕 Agregar propiedad usePagerView
    
    // Acciones
    getStepComponentConfig,
    getStepPagerConfig,
    shouldUsePagerForStep,
    setUsePagerView,
    setPagerSteps,
    setCurrentPageIndex,
    goToNextPage,
    goToPreviousPage,
    goToPagerStep,
    navigateToPage,
    setNavigationConfig,
    setVisualConfig,
    setAnimationConfig,
    setValidationConfig,
    setTransitioning,
    markStepCompleted,
    markStepSkipped,
    setRequiredSteps,
    setError,
    clearError,
    incrementRetryCount,
    resetRetryCount,
    
    // Helpers
    isStepRequired: (step: MapFlowStep) => {
      const config = getStepPagerConfig(step);
      return config?.required || false;
    },
    
    canNavigateToStep: (targetStep: MapFlowStep) => {
      const config = getStepPagerConfig(targetStep);
      if (!config) return false;
      
      // Verificar si se puede navegar según configuración
      return config.canNavigateBack || config.canNavigateForward;
    },
    
    // Validaciones
    canGoNext: variant.currentPageIndex < variant.totalPages - 1,
    canGoPrevious: variant.currentPageIndex > 0,
    isFirstStep: variant.currentPageIndex === 0,
    isLastStep: variant.currentPageIndex === variant.totalPages - 1,
    
    // Estado de error
    hasError: variant.hasError,
    errorMessage: variant.errorMessage,
    retryCount: variant.retryCount,
  };
  
  // 🔍 LOG: Estado final del hook
  console.log('[useMapFlowPagerWithSteps] Final state:', {
    pagerSteps: finalState.pagerSteps.length,
    pagerStepsList: finalState.pagerSteps,
    shouldUsePager: finalState.shouldUsePager,
    currentPageIndex: finalState.currentPageIndex,
    totalPages: finalState.totalPages,
    hasCurrentStepConfig: !!finalState.currentStepConfig,
    hasProgressConfig: !!finalState.progressConfig,
    currentStep: step,
    getStepComponentConfigAvailable: !!finalState.getStepComponentConfig
  });
  
  // 🔍 LOG: Test getStepComponentConfig con el paso actual
  if (finalState.getStepComponentConfig) {
    try {
      const testComponentConfig = finalState.getStepComponentConfig(step);
      console.log('[useMapFlowPagerWithSteps] Test getStepComponentConfig:', {
        step,
        hasComponentConfig: !!testComponentConfig,
        componentType: typeof testComponentConfig
      });
    } catch (error) {
      console.error('[useMapFlowPagerWithSteps] Error testing getStepComponentConfig:', error);
    }
  }
  
  return finalState;
};
