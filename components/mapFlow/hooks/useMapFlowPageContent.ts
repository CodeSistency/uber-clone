import { useState, useCallback, useEffect } from 'react';
import { MapFlowStep } from '@/store';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';

interface MapFlowPageContentState {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}

export const useMapFlowPageContent = (step: MapFlowStep) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { stepConfig, setCurrentStep } = useMapFlowStore();

  // Obtener configuración del paso
  const stepConfigData = stepConfig[step];

  // Simular carga de contenido
  useEffect(() => {
    setIsLoading(true);
    setIsReady(false);
    setError(null);

    // Simular tiempo de carga basado en el tipo de paso
    const loadTime = getLoadTimeForStep(step);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsReady(true);
    }, loadTime);

    return () => clearTimeout(timer);
  }, [step]);

  // Manejar acciones del contenido
  const handleAction = useCallback((action: string, data?: any) => {
    console.log('[useMapFlowPageContent] Action:', { step, action, data });
    
    switch (action) {
      case 'next':
        // Navegar al siguiente paso
        const nextStep = getNextStep(step);
        if (nextStep) {
          setCurrentStep(nextStep);
        }
        break;
        
      case 'prev':
        // Navegar al paso anterior
        const prevStep = getPrevStep(step);
        if (prevStep) {
          setCurrentStep(prevStep);
        }
        break;
        
      case 'complete':
        // Completar el paso actual
        console.log('[useMapFlowPageContent] Step completed:', step);
        break;
        
      case 'cancel':
        // Cancelar el flujo
        setCurrentStep('idle');
        break;
        
      case 'retry':
        // Reintentar el paso actual
        setIsLoading(true);
        setIsReady(false);
        break;
        
      default:
        console.log('[useMapFlowPageContent] Unknown action:', action);
    }
  }, [step, setCurrentStep]);

  // Obtener información del estado
  const contentState: MapFlowPageContentState = {
    isLoading,
    isReady,
    error
  };

  return {
    ...contentState,
    handleAction,
    stepConfig: stepConfigData,
    // Helpers adicionales
    canNavigate: !isLoading && isReady,
    hasError: !!error,
  };
};

// Helper para obtener tiempo de carga según el paso
const getLoadTimeForStep = (step: MapFlowStep): number => {
  const loadTimes: Partial<Record<MapFlowStep, number>> = {
    'idle': 0,
    'confirm_origin': 500,
    'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR': 1000,
    'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION': 800,
    'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION': 600,
    'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO': 400,
    'DRIVER_FINALIZACION_RATING': 300,
  };
  
  return loadTimes[step] || 500;
};

// Helper para obtener el siguiente paso
const getNextStep = (currentStep: MapFlowStep): MapFlowStep | null => {
  const stepFlow: Partial<Record<MapFlowStep, MapFlowStep | null>> = {
    'idle': 'confirm_origin',
    'confirm_origin': 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR',
    'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR': 'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION',
    'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION': 'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION',
    'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION': 'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO',
    'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO': 'DRIVER_FINALIZACION_RATING',
    'DRIVER_FINALIZACION_RATING': null,
  };
  
  return stepFlow[currentStep] || null;
};

// Helper para obtener el paso anterior
const getPrevStep = (currentStep: MapFlowStep): MapFlowStep | null => {
  const stepFlow: Partial<Record<MapFlowStep, MapFlowStep | null>> = {
    'idle': null,
    'confirm_origin': 'idle',
    'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR': 'confirm_origin',
    'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION': 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR',
    'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION': 'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION',
    'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO': 'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION',
    'DRIVER_FINALIZACION_RATING': 'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO',
  };
  
  return stepFlow[currentStep] || null;
};
