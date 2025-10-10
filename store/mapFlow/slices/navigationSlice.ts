import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { MapFlowStep, VariantState } from '../types';
import { mapFlowLogger } from '../logger';

/**
 * Slice para manejar estado de navegación del MapFlow
 * Responsabilidades:
 * - Estado del PagerView (variant)
 * - Navegación entre páginas
 * - Configuración de animaciones
 * - Estados de transición
 */
export interface NavigationSlice {
  // Estado
  variant: VariantState;
  
  // Actions de PagerView
  setUsePagerView: (usePagerView: boolean) => void;
  setPagerSteps: (steps: MapFlowStep[]) => void;
  resetVariant: () => void;
  setCurrentPageIndex: (pageIndex: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPagerStep: (step: MapFlowStep) => void;
  navigateToPage: (pageIndex: number, validate?: boolean) => void;
  
  // Actions de configuración
  setNavigationConfig: (config: {
    enableSwipe?: boolean;
    showProgress?: boolean;
    allowSkip?: boolean;
    canNavigateBack?: boolean;
    canNavigateForward?: boolean;
  }) => void;
  
  setVisualConfig: (config: {
    progressColor?: string;
    progressSize?: number;
    progressStyle?: 'dots' | 'bar' | 'numbers';
  }) => void;
  
  setAnimationConfig: (config: {
    transitionDuration?: number;
    animationType?: 'slide' | 'fade' | 'scale';
    enableAnimations?: boolean;
  }) => void;
  
  setValidationConfig: (config: {
    requiredSteps?: MapFlowStep[];
  }) => void;
  
  // Actions de estado
  setTransitioning: (isTransitioning: boolean) => void;
  markStepCompleted: (step: MapFlowStep) => void;
  markStepSkipped: (step: MapFlowStep) => void;
  setRequiredSteps: (steps: MapFlowStep[]) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
  
  // Selectors
  getVariantState: () => VariantState;
  isPagerViewActive: () => boolean;
  getCurrentPageIndex: () => number;
  getTotalPages: () => number;
  isTransitioning: () => boolean;
  hasError: () => boolean;
  getError: () => string | null;
  getCompletedSteps: () => MapFlowStep[];
  getSkippedSteps: () => MapFlowStep[];
  getRequiredSteps: () => MapFlowStep[];
}

export const useNavigationSlice = create<NavigationSlice>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    variant: {
      usePagerView: false,
      currentPageIndex: 0,
      totalPages: 0,
      isTransitioning: false,
      pagerSteps: [],
      currentStepIndex: 0,
      enableSwipe: true,
      showProgress: true,
      allowSkip: false,
      canNavigateBack: true,
      canNavigateForward: true,
      progressColor: '#0286FF',
      progressSize: 8,
      progressStyle: 'dots',
      completedSteps: [],
      requiredSteps: [],
      skippedSteps: [],
      transitionDuration: 300,
      animationType: 'slide',
      enableAnimations: true,
      hasError: false,
      errorMessage: null,
      retryCount: 0,
    },
    
    // Actions de PagerView
    setUsePagerView: (usePagerView: boolean) => {
      mapFlowLogger('debug', 'setUsePagerView', { usePagerView });
      
      set((state) => ({
        variant: {
          ...state.variant,
          usePagerView,
          // Resetear estado cuando se desactiva
          ...(usePagerView ? {} : {
            currentPageIndex: 0,
            totalPages: 0,
            isTransitioning: false,
            pagerSteps: [],
            currentStepIndex: 0,
            completedSteps: [],
            skippedSteps: [],
            hasError: false,
            errorMessage: null,
            retryCount: 0,
          })
        }
      }));
    },
    
    setPagerSteps: (steps: MapFlowStep[]) => {
      mapFlowLogger('debug', 'setPagerSteps', { steps });
      
      set((state) => ({
        variant: {
          ...state.variant,
          pagerSteps: steps,
          totalPages: steps.length,
          currentPageIndex: Math.min(state.variant.currentPageIndex, steps.length - 1),
        }
      }));
    },
    
    resetVariant: () => {
      mapFlowLogger('debug', 'resetVariant');
      
      set((state) => ({
        variant: {
          ...state.variant,
          usePagerView: false,
          currentPageIndex: 0,
          totalPages: 0,
          isTransitioning: false,
          pagerSteps: [],
          currentStepIndex: 0,
          enableSwipe: true,
          showProgress: true,
          allowSkip: false,
          canNavigateBack: true,
          canNavigateForward: true,
          progressColor: '#0286FF',
          progressSize: 8,
          progressStyle: 'dots',
          completedSteps: [],
          requiredSteps: [],
          skippedSteps: [],
          transitionDuration: 300,
          animationType: 'slide',
          enableAnimations: true,
          hasError: false,
          errorMessage: null,
          retryCount: 0,
        }
      }));
    },
    
    setCurrentPageIndex: (pageIndex: number) => {
      mapFlowLogger('debug', 'setCurrentPageIndex', { pageIndex });
      
      set((state) => {
        const { variant } = state;
        
        if (pageIndex < 0 || pageIndex >= variant.totalPages) {
          mapFlowLogger('warn', 'Invalid page index', pageIndex);
          return state;
        }
        
        const step = variant.pagerSteps[pageIndex];
        if (!step) {
          mapFlowLogger('warn', 'No step found for page index', pageIndex);
          return state;
        }
        
        return {
          variant: {
            ...variant,
            currentPageIndex: pageIndex,
            currentStepIndex: pageIndex,
            isTransitioning: true,
          }
        };
      });
      
      // Limpiar estado de transición después de un tiempo
      setTimeout(() => {
        set((state) => ({
          variant: {
            ...state.variant,
            isTransitioning: false,
          }
        }));
      }, 300);
    },
    
    goToNextPage: () => {
      mapFlowLogger('debug', 'goToNextPage');
      
      const state = get();
      const { variant } = state;
      
      if (variant.currentPageIndex < variant.totalPages - 1) {
        get().setCurrentPageIndex(variant.currentPageIndex + 1);
      }
    },
    
    goToPreviousPage: () => {
      mapFlowLogger('debug', 'goToPreviousPage');
      
      const state = get();
      const { variant } = state;
      
      if (variant.currentPageIndex > 0) {
        get().setCurrentPageIndex(variant.currentPageIndex - 1);
      }
    },
    
    goToPagerStep: (step: MapFlowStep) => {
      mapFlowLogger('debug', 'goToPagerStep', { step });
      
      const state = get();
      const { variant } = state;
      
      const stepIndex = variant.pagerSteps.findIndex((s) => s === step);
      if (stepIndex !== -1) {
        get().setCurrentPageIndex(stepIndex);
      } else {
        mapFlowLogger('warn', 'Step not found in pager steps', step);
      }
    },
    
    navigateToPage: (pageIndex: number, validate: boolean = true) => {
      mapFlowLogger('debug', 'navigateToPage', { pageIndex, validate });
      
      const state = get();
      const { variant } = state;
      
      if (validate) {
        if (pageIndex < 0 || pageIndex >= variant.totalPages) {
          mapFlowLogger('warn', 'Cannot navigate to page', pageIndex);
          return;
        }
      }
      
      get().setCurrentPageIndex(pageIndex);
    },
    
    // Actions de configuración
    setNavigationConfig: (config) => {
      mapFlowLogger('debug', 'setNavigationConfig', config);
      
      set((state) => ({
        variant: {
          ...state.variant,
          enableSwipe: config.enableSwipe ?? state.variant.enableSwipe,
          showProgress: config.showProgress ?? state.variant.showProgress,
          allowSkip: config.allowSkip ?? state.variant.allowSkip,
          canNavigateBack: config.canNavigateBack ?? state.variant.canNavigateBack,
          canNavigateForward: config.canNavigateForward ?? state.variant.canNavigateForward,
        }
      }));
    },
    
    setVisualConfig: (config) => {
      mapFlowLogger('debug', 'setVisualConfig', config);
      
      set((state) => ({
        variant: {
          ...state.variant,
          progressColor: config.progressColor ?? state.variant.progressColor,
          progressSize: config.progressSize ?? state.variant.progressSize,
          progressStyle: config.progressStyle ?? state.variant.progressStyle,
        }
      }));
    },
    
    setAnimationConfig: (config) => {
      mapFlowLogger('debug', 'setAnimationConfig', config);
      
      set((state) => ({
        variant: {
          ...state.variant,
          transitionDuration: config.transitionDuration ?? state.variant.transitionDuration,
          animationType: config.animationType ?? state.variant.animationType,
          enableAnimations: config.enableAnimations ?? state.variant.enableAnimations,
        }
      }));
    },
    
    setValidationConfig: (config) => {
      mapFlowLogger('debug', 'setValidationConfig', config);
      
      set((state) => ({
        variant: {
          ...state.variant,
          requiredSteps: config.requiredSteps ?? state.variant.requiredSteps,
        }
      }));
    },
    
    // Actions de estado
    setTransitioning: (isTransitioning: boolean) => {
      mapFlowLogger('debug', 'setTransitioning', isTransitioning);
      
      set((state) => ({
        variant: {
          ...state.variant,
          isTransitioning,
        }
      }));
    },
    
    markStepCompleted: (step: MapFlowStep) => {
      mapFlowLogger('debug', 'markStepCompleted', step);
      
      set((state) => {
        const { variant } = state;
        const completedSteps = [...variant.completedSteps];
        
        if (!completedSteps.includes(step)) {
          completedSteps.push(step);
        }
        
        return {
          variant: {
            ...variant,
            completedSteps,
          }
        };
      });
    },
    
    markStepSkipped: (step: MapFlowStep) => {
      mapFlowLogger('debug', 'markStepSkipped', step);
      
      set((state) => {
        const { variant } = state;
        const skippedSteps = [...variant.skippedSteps];
        
        if (!skippedSteps.includes(step)) {
          skippedSteps.push(step);
        }
        
        return {
          variant: {
            ...variant,
            skippedSteps,
          }
        };
      });
    },
    
    setRequiredSteps: (steps: MapFlowStep[]) => {
      mapFlowLogger('debug', 'setRequiredSteps', steps);
      
      set((state) => ({
        variant: {
          ...state.variant,
          requiredSteps: steps,
        }
      }));
    },
    
    setError: (error: string | null) => {
      mapFlowLogger('debug', 'setError', error);
      
      set((state) => ({
        variant: {
          ...state.variant,
          hasError: !!error,
          errorMessage: error,
        }
      }));
    },
    
    clearError: () => {
      mapFlowLogger('debug', 'clearError');
      
      set((state) => ({
        variant: {
          ...state.variant,
          hasError: false,
          errorMessage: null,
          retryCount: 0,
        }
      }));
    },
    
    incrementRetryCount: () => {
      mapFlowLogger('debug', 'incrementRetryCount');
      
      set((state) => ({
        variant: {
          ...state.variant,
          retryCount: state.variant.retryCount + 1,
        }
      }));
    },
    
    resetRetryCount: () => {
      mapFlowLogger('debug', 'resetRetryCount');
      
      set((state) => ({
        variant: {
          ...state.variant,
          retryCount: 0,
        }
      }));
    },
    
    // Selectors
    getVariantState: () => get().variant,
    isPagerViewActive: () => get().variant.usePagerView,
    getCurrentPageIndex: () => get().variant.currentPageIndex,
    getTotalPages: () => get().variant.totalPages,
    isTransitioning: () => get().variant.isTransitioning,
    hasError: () => get().variant.hasError,
    getError: () => get().variant.errorMessage,
    getCompletedSteps: () => get().variant.completedSteps,
    getSkippedSteps: () => get().variant.skippedSteps,
    getRequiredSteps: () => get().variant.requiredSteps,
  }))
);

// Selectors optimizados para componentes
export const useVariantState = () => 
  useNavigationSlice((state) => state.variant);

export const useIsPagerViewActive = () => 
  useNavigationSlice((state) => state.variant.usePagerView);

export const useCurrentPageIndex = () => 
  useNavigationSlice((state) => state.variant.currentPageIndex);

export const useTotalPages = () => 
  useNavigationSlice((state) => state.variant.totalPages);

export const useIsTransitioning = () => 
  useNavigationSlice((state) => state.variant.isTransitioning);

export const useHasError = () => 
  useNavigationSlice((state) => state.variant.hasError);

export const useCompletedSteps = () => 
  useNavigationSlice((state) => state.variant.completedSteps);
