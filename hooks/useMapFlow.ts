import { useCallback } from 'react';
import { useMapFlowStore, MapFlowRole, MapFlowStep, ServiceType, FlowRole } from '@/store/mapFlow/mapFlow';

export const useMapFlow = () => {
  const state = useMapFlowStore();

  console.log('[useMapFlow] Current state:', {
    step: state.step,
    service: state.service,
    isActive: state.isActive,
    bottomSheetVisible: state.bottomSheetVisible,
    bottomSheetAllowDrag: state.bottomSheetAllowDrag,
    bottomSheetMinHeight: state.bottomSheetMinHeight,
    bottomSheetMaxHeight: state.bottomSheetMaxHeight,
    bottomSheetInitialHeight: state.bottomSheetInitialHeight,
  });

  const start = useCallback((role: MapFlowRole) => {
    console.log('[useMapFlow] Starting flow with role:', role);
    state.start(role);
  }, [state]);

  const startService = useCallback((service: ServiceType) => {
    console.log('[useMapFlow] Starting service flow:', service);
    state.startService(service);
  }, [state]);

  const stop = useCallback(() => state.stop(), [state]);
  const reset = useCallback(() => state.reset(), [state]);
  const next = useCallback(() => state.next(), [state]);
  const back = useCallback(() => state.back(), [state]);
  const goTo = useCallback((step: MapFlowStep) => state.goTo(step), [state]);

  return {
    ...state,
    start,
    startService,
    stop,
    reset,
    next,
    back,
    goTo,
  };
};


