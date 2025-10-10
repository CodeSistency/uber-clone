import { useMemo } from 'react';
import { useMapFlowStore } from '../store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store';

interface CriticalConfigReturn {
  // Configuraciones críticas
  isNoHandleStep: boolean;
  isNoDragStep: boolean;
  isNoBottomSheetStep: boolean;
  
  // Configuraciones especiales
  isSearchingDriverStep: boolean;
  isConfirmationStep: boolean;
  isRatingStep: boolean;
  
  // Mapeo de props críticas
  handleComponent: any;
  enableHandlePanningGesture: boolean;
  enableContentPanningGesture: boolean;
  enableOverDrag: boolean;
  enablePanDownToClose: boolean;
  index: number;
}

export const useMapFlowCriticalConfig = (step?: MapFlowStep): CriticalConfigReturn => {
  const stepConfig = useMapFlowStore(state => state.steps[step || 'idle']);
  const flow = useMapFlowStore(); // Usar todo el store como useMapFlow()
  const { bottomSheet } = stepConfig;
  
  // 🔍 LOG: Verificar estado del flow
  console.log('[useMapFlowCriticalConfig] Flow state:', {
    flowBottomSheetVisible: flow.bottomSheetVisible,
    flowIsActive: flow.isActive,
    flowStep: flow.step,
    stepConfigVisible: bottomSheet.visible
  });
  
  // Identificar pasos críticos
  const isNoHandleStep = useMemo(() => {
    const noHandleSteps: MapFlowStep[] = [
      'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR',
      'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION',
      'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO'
    ];
    return step ? noHandleSteps.includes(step) : false;
  }, [step]);
  
  const isNoDragStep = useMemo(() => {
    const noDragSteps: MapFlowStep[] = [
      'confirm_origin',
      'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR',
      'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION',
      'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION',
      'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO',
      'DRIVER_FINALIZACION_RATING'
    ];
    return step ? noDragSteps.includes(step) : false;
  }, [step]);
  
  const isNoBottomSheetStep = useMemo(() => {
    const noBottomSheetSteps: MapFlowStep[] = [
      'idle',
      'CUSTOMER_TRANSPORT_CONFIRM_ORIGIN',
      'CUSTOMER_TRANSPORT_CONFIRM_DESTINATION'
    ];
    return step ? noBottomSheetSteps.includes(step) : false;
  }, [step]);
  
  // Configuraciones especiales
  const isSearchingDriverStep = step === 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR';
  const isConfirmationStep = step === 'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION';
  const isRatingStep = step === 'DRIVER_FINALIZACION_RATING';
  
  // Mapeo de props críticas
  const handleComponent = useMemo(() => {
    if (isNoHandleStep || !bottomSheet.showHandle) {
      return null;
    }
    return undefined; // Usar handle por defecto
  }, [isNoHandleStep, bottomSheet.showHandle]);
  
  const enableHandlePanningGesture = useMemo(() => {
    if (isNoDragStep || !bottomSheet.allowDrag) {
      return false;
    }
    
    // Configuración específica por paso
    switch (step) {
      case 'confirm_origin':
      case 'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION':
        // Pasos de confirmación - drag limitado
        return true;
      case 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR':
        // Búsqueda de conductor - sin drag
        return false;
      case 'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION':
      case 'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO':
        // Pasos de espera - drag limitado
        return true;
      case 'DRIVER_FINALIZACION_RATING':
        // Rating - drag completo
        return true;
      default:
        return bottomSheet.allowDrag;
    }
  }, [isNoDragStep, bottomSheet.allowDrag, step]);
  
  const enableContentPanningGesture = useMemo(() => {
    if (isNoDragStep || !bottomSheet.allowDrag) {
      return false;
    }
    
    // Configuración específica por paso
    switch (step) {
      case 'confirm_origin':
      case 'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION':
        // Pasos de confirmación - drag limitado
        return true;
      case 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR':
        // Búsqueda de conductor - sin drag
        return false;
      case 'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION':
      case 'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO':
        // Pasos de espera - drag limitado
        return true;
      case 'DRIVER_FINALIZACION_RATING':
        // Rating - drag completo
        return true;
      default:
        return bottomSheet.allowDrag;
    }
  }, [isNoDragStep, bottomSheet.allowDrag, step]);
  
  const enableOverDrag = useMemo(() => {
    if (isNoDragStep || !bottomSheet.allowDrag) {
      return false;
    }
    return true;
  }, [isNoDragStep, bottomSheet.allowDrag]);
  
  const enablePanDownToClose = useMemo(() => {
    if (isNoDragStep || !bottomSheet.allowDrag) {
      return false;
    }
    return true;
  }, [isNoDragStep, bottomSheet.allowDrag]);
  
  const index = useMemo(() => {
    console.log('[useMapFlowCriticalConfig] Calculating index:', {
      step,
      isNoBottomSheetStep,
      flowVisible: flow.bottomSheetVisible,
      stepConfigVisible: bottomSheet.visible,
      bottomSheetConfig: {
        visible: bottomSheet.visible,
        minHeight: bottomSheet.minHeight,
        maxHeight: bottomSheet.maxHeight,
        initialHeight: bottomSheet.initialHeight
      }
    });
    
    // Si es un paso que no debe tener bottom sheet, retornar -1
    if (isNoBottomSheetStep) {
      console.log('[useMapFlowCriticalConfig] No bottom sheet step, returning -1');
      return -1;
    }
    
    // 🔍 LOG: Verificar condiciones específicas
    console.log('[useMapFlowCriticalConfig] Condition check:', {
      'flow.bottomSheetVisible': flow.bottomSheetVisible,
      'typeof flow.bottomSheetVisible': typeof flow.bottomSheetVisible,
      'flow.bottomSheetVisible === true': flow.bottomSheetVisible === true,
      'step': step
    });
    
    // Si el flow dice que es visible, retornar 0
    if (flow.bottomSheetVisible) {
      console.log('[useMapFlowCriticalConfig] Flow visible, returning 0');
      return 0;
    }
    
    // Si no es visible, retornar -1
    console.log('[useMapFlowCriticalConfig] Not visible, returning -1');
    return -1;
  }, [isNoBottomSheetStep, flow.bottomSheetVisible, step, bottomSheet.visible]);
  
  return {
    isNoHandleStep,
    isNoDragStep,
    isNoBottomSheetStep,
    isSearchingDriverStep,
    isConfirmationStep,
    isRatingStep,
    handleComponent,
    enableHandlePanningGesture,
    enableContentPanningGesture,
    enableOverDrag,
    enablePanDownToClose,
    index,
  };
};
