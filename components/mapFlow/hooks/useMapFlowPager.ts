import { useState, useCallback, useMemo, useEffect } from 'react';
import { MapFlowStep } from '@/store';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';

interface MapFlowPagerState {
  currentPageIndex: number;
  totalPages: number;
  isTransitioning: boolean;
  canNavigate: (direction: 'prev' | 'next') => boolean;
}

export const useMapFlowPager = (steps: MapFlowStep[], currentStep: MapFlowStep) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { stepConfig } = useMapFlowStore();

  // Encontrar el índice del paso actual
  const currentStepIndex = useMemo(() => {
    return steps.findIndex(step => step === currentStep);
  }, [steps, currentStep]);

  // Sincronizar índice de página con paso actual
  useEffect(() => {
    if (currentStepIndex !== -1 && currentStepIndex !== currentPageIndex) {
      setCurrentPageIndex(currentStepIndex);
    }
  }, [currentStepIndex, currentPageIndex]);

  // Navegar a una página específica
  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < steps.length && pageIndex !== currentPageIndex) {
      console.log('[useMapFlowPager] Navigating to page:', { from: currentPageIndex, to: pageIndex });
      
      setIsTransitioning(true);
      setCurrentPageIndex(pageIndex);
      
      // Simular transición
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  }, [currentPageIndex, steps.length]);

  // Navegar a un paso específico
  const goToStep = useCallback((step: MapFlowStep) => {
    const stepIndex = steps.findIndex(s => s === step);
    if (stepIndex !== -1) {
      goToPage(stepIndex);
    }
  }, [steps, goToPage]);

  // Validar si se puede navegar en una dirección
  const canNavigate = useCallback((direction: 'prev' | 'next') => {
    const currentStep = steps[currentPageIndex];
    const stepConfig = useMapFlowStore.getState().stepConfig[currentStep];
    
    // Verificar si el paso actual permite navegación
    const canSwipe = stepConfig?.bottomSheet?.allowDrag ?? true;
    
    if (!canSwipe) {
      return false;
    }

    if (direction === 'prev') {
      return currentPageIndex > 0;
    } else {
      return currentPageIndex < steps.length - 1;
    }
  }, [currentPageIndex, steps.length]);

  // Obtener configuración del paso actual
  const currentStepConfig = useMemo(() => {
    const step = steps[currentPageIndex];
    return step ? stepConfig[step] : null;
  }, [currentPageIndex, steps, stepConfig]);

  // Obtener información del estado del pager
  const pagerState: MapFlowPagerState = useMemo(() => ({
    currentPageIndex,
    totalPages: steps.length,
    isTransitioning,
    canNavigate
  }), [currentPageIndex, steps.length, isTransitioning, canNavigate]);

  return {
    ...pagerState,
    goToPage,
    goToStep,
    currentStepConfig,
    // Helpers adicionales
    isFirstPage: currentPageIndex === 0,
    isLastPage: currentPageIndex === steps.length - 1,
    canGoPrev: canNavigate('prev'),
    canGoNext: canNavigate('next'),
  };
};
