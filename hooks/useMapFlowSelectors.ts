import { useCallback } from 'react';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { useMapFlowSelector } from '@/hooks/useMapFlow';
import { 
  useCurrentStep, 
  useCurrentRole, 
  useCurrentService,
  useIsStepActive,
  useRideId,
  useIsMatching,
  useMatchedDriver,
  useRideType,
  useConfirmedOrigin,
  useConfirmedDestination,
  useEstimatedPrice,
  useRouteInfo
} from '@/store/mapFlow/slices';

/**
 * Selectors optimizados para componentes del MapFlow
 * Proporciona selectors específicos para evitar re-renders innecesarios
 */

// Selectors básicos del flow
export const useFlowSelectors = () => {
  const step = useCurrentStep();
  const role = useCurrentRole();
  const service = useCurrentService();
  
  return { step, role, service };
};

// Selector para estado de navegación
export const useNavigationSelectors = () => {
  const step = useCurrentStep();
  const role = useCurrentRole();
  const service = useCurrentService();
  
  return { step, role, service };
};

// Selector para estado de viaje
export const useRideSelectors = () => {
  const rideId = useRideId();
  const isMatching = useIsMatching();
  const matchedDriver = useMatchedDriver();
  const rideType = useRideType();
  const confirmedOrigin = useConfirmedOrigin();
  const confirmedDestination = useConfirmedDestination();
  const estimatedPrice = useEstimatedPrice();
  const routeInfo = useRouteInfo();
  
  return {
    rideId,
    isMatching,
    matchedDriver,
    rideType,
    confirmedOrigin,
    confirmedDestination,
    estimatedPrice,
    routeInfo,
  };
};

// Selector para estado de bottom sheet
export const useBottomSheetSelectors = () => {
  const bottomSheetVisible = useMapFlowSelector((state) => state.bottomSheetVisible);
  const bottomSheetMinHeight = useMapFlowSelector((state) => state.bottomSheetMinHeight);
  const bottomSheetMaxHeight = useMapFlowSelector((state) => state.bottomSheetMaxHeight);
  const bottomSheetInitialHeight = useMapFlowSelector((state) => state.bottomSheetInitialHeight);
  const bottomSheetAllowDrag = useMapFlowSelector((state) => state.bottomSheetAllowDrag);
  const bottomSheetAllowClose = useMapFlowSelector((state) => state.bottomSheetAllowClose);
  // const bottomSheetShowHandle = useMapFlowSelector((state) => state.bottomSheetShowHandle);
  // const bottomSheetUseGradient = useMapFlowSelector((state) => state.bottomSheetUseGradient);
  // const bottomSheetUseBlur = useMapFlowSelector((state) => state.bottomSheetUseBlur);
  // const bottomSheetBottomBar = useMapFlowSelector((state) => state.bottomSheetBottomBar);
  
  return {
    bottomSheetVisible,
    bottomSheetMinHeight,
    bottomSheetMaxHeight,
    bottomSheetInitialHeight,
    bottomSheetAllowDrag,
    bottomSheetAllowClose,
    // bottomSheetShowHandle,
    // bottomSheetUseGradient,
    // bottomSheetUseBlur,
    // bottomSheetBottomBar,
  };
};

// Selector para estado de PagerView
export const usePagerSelectors = () => {
  const usePagerView = useMapFlowSelector((state) => state.variant.usePagerView);
  const currentPageIndex = useMapFlowSelector((state) => state.variant.currentPageIndex);
  const totalPages = useMapFlowSelector((state) => state.variant.totalPages);
  const isTransitioning = useMapFlowSelector((state) => state.variant.isTransitioning);
  const pagerSteps = useMapFlowSelector((state) => state.variant.pagerSteps);
  const enableSwipe = useMapFlowSelector((state) => state.variant.enableSwipe);
  const showProgress = useMapFlowSelector((state) => state.variant.showProgress);
  const canNavigateBack = useMapFlowSelector((state) => state.variant.canNavigateBack);
  const canNavigateForward = useMapFlowSelector((state) => state.variant.canNavigateForward);
  
  return {
    usePagerView,
    currentPageIndex,
    totalPages,
    isTransitioning,
    pagerSteps,
    enableSwipe,
    showProgress,
    canNavigateBack,
    canNavigateForward,
  };
};

// Selector para estado de configuración
export const useConfigSelectors = () => {
  const mapInteraction = useMapFlowSelector((state) => state.mapInteraction);
  const transitionType = useMapFlowSelector((state) => state.transitionType);
  const transitionDuration = useMapFlowSelector((state) => state.transitionDuration);
  
  return {
    mapInteraction,
    transitionType,
    transitionDuration,
  };
};

// Selector combinado para componentes que necesitan múltiples estados
export const useUnifiedFlowSelectors = () => {
  const flow = useFlowSelectors();
  const ride = useRideSelectors();
  const bottomSheet = useBottomSheetSelectors();
  const pager = usePagerSelectors();
  const config = useConfigSelectors();
  
  return {
    flow,
    ride,
    bottomSheet,
    pager,
    config,
  };
};

// Selector para componentes que solo necesitan información básica
export const useBasicFlowSelectors = () => {
  const step = useCurrentStep();
  const role = useCurrentRole();
  const service = useCurrentService();
  const bottomSheetVisible = useMapFlowSelector((state) => state.bottomSheetVisible);
  
  return {
    step,
    role,
    service,
    bottomSheetVisible,
  };
};

// Selector para componentes de debug
export const useDebugSelectors = () => {
  const step = useCurrentStep();
  const role = useCurrentRole();
  const service = useCurrentService();
  const rideId = useRideId();
  const isMatching = useIsMatching();
  const matchedDriver = useMatchedDriver();
  const bottomSheetVisible = useMapFlowSelector((state) => state.bottomSheetVisible);
  const usePagerView = useMapFlowSelector((state) => state.variant.usePagerView);
  const currentPageIndex = useMapFlowSelector((state) => state.variant.currentPageIndex);
  const totalPages = useMapFlowSelector((state) => state.variant.totalPages);
  
  return {
    step,
    role,
    service,
    rideId,
    isMatching,
    matchedDriver,
    bottomSheetVisible,
    usePagerView,
    currentPageIndex,
    totalPages,
  };
};

// Hook para verificar si un paso específico está activo
export const useIsSpecificStepActive = (targetStep: string) => {
  return useIsStepActive(targetStep as any);
};

// Hook para obtener información de un paso específico
export const useStepInfo = (step: string) => {
  const isActive = useIsStepActive(step as any);
  const currentStep = useCurrentStep();
  const isCurrentStep = currentStep === step;
  
  return {
    isActive,
    isCurrentStep,
    step,
  };
};

// Hook para obtener estado de navegación
export const useNavigationState = () => {
  const step = useCurrentStep();
  const role = useCurrentRole();
  const service = useCurrentService();
  const usePagerView = useMapFlowSelector((state) => state.variant.usePagerView);
  const currentPageIndex = useMapFlowSelector((state) => state.variant.currentPageIndex);
  const totalPages = useMapFlowSelector((state) => state.variant.totalPages);
  
  return {
    step,
    role,
    service,
    usePagerView,
    currentPageIndex,
    totalPages,
    canNavigate: totalPages > 0,
  };
};
