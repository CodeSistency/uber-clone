import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { MapFlowStep, StepConfig } from '../types';
import { DEFAULT_CONFIG } from '../config';
import { mapFlowLogger } from '../logger';

/**
 * Slice para manejar configuración de pasos del MapFlow
 * Responsabilidades:
 * - Configuración estática de pasos (DEFAULT_CONFIG)
 * - Actualización de configuración en runtime
 * - Selectors para configuración específica
 */
export interface ConfigSlice {
  // Estado
  stepConfig: Record<MapFlowStep, StepConfig>;
  
  // Actions
  updateStepConfig: (step: MapFlowStep, config: Partial<StepConfig>) => void;
  updateStepBottomSheet: (step: MapFlowStep, bottomSheet: Partial<StepConfig['bottomSheet']>) => void;
  updateStepMapInteraction: (step: MapFlowStep, mapInteraction: StepConfig['mapInteraction']) => void;
  updateStepTransition: (step: MapFlowStep, transition: Partial<NonNullable<StepConfig['transition']>>) => void;
  resetStepConfig: (step: MapFlowStep) => void;
  resetAllConfigs: () => void;
  
  // Selectors
  getStepConfig: (step: MapFlowStep) => StepConfig;
  getStepBottomSheet: (step: MapFlowStep) => StepConfig['bottomSheet'];
  getStepMapInteraction: (step: MapFlowStep) => StepConfig['mapInteraction'];
  getStepTransition: (step: MapFlowStep) => StepConfig['transition'];
}

export const useConfigSlice = create<ConfigSlice>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    stepConfig: DEFAULT_CONFIG,
    
    // Actions
    updateStepConfig: (step: MapFlowStep, config: Partial<StepConfig>) => {
      mapFlowLogger('debug', 'updateStepConfig', { step, config });
      
      set((state) => ({
        stepConfig: {
          ...state.stepConfig,
          [step]: {
            ...state.stepConfig[step],
            ...config,
          },
        },
      }));
    },
    
    updateStepBottomSheet: (step: MapFlowStep, bottomSheet: Partial<StepConfig['bottomSheet']>) => {
      mapFlowLogger('debug', 'updateStepBottomSheet', { step, bottomSheet });
      
      set((state) => ({
        stepConfig: {
          ...state.stepConfig,
          [step]: {
            ...state.stepConfig[step],
            bottomSheet: {
              ...state.stepConfig[step].bottomSheet,
              ...bottomSheet,
            },
          },
        },
      }));
    },
    
    updateStepMapInteraction: (step: MapFlowStep, mapInteraction: StepConfig['mapInteraction']) => {
      mapFlowLogger('debug', 'updateStepMapInteraction', { step, mapInteraction });
      
      set((state) => ({
        stepConfig: {
          ...state.stepConfig,
          [step]: {
            ...state.stepConfig[step],
            mapInteraction,
          },
        },
      }));
    },
    
    updateStepTransition: (step: MapFlowStep, transition: Partial<NonNullable<StepConfig['transition']>>) => {
      mapFlowLogger('debug', 'updateStepTransition', { step, transition });
      
      set((state) => {
        const currentConfig = state.stepConfig[step];
        const currentTransition = currentConfig.transition || { type: 'none', duration: 0 };
        
        return {
          stepConfig: {
            ...state.stepConfig,
            [step]: {
              ...currentConfig,
              transition: {
                ...currentTransition,
                ...transition,
              },
            },
          },
        };
      });
    },
    
    resetStepConfig: (step: MapFlowStep) => {
      mapFlowLogger('debug', 'resetStepConfig', { step });
      
      set((state) => ({
        stepConfig: {
          ...state.stepConfig,
          [step]: DEFAULT_CONFIG[step],
        },
      }));
    },
    
    resetAllConfigs: () => {
      mapFlowLogger('debug', 'resetAllConfigs');
      
      set(() => ({
        stepConfig: DEFAULT_CONFIG,
      }));
    },
    
    // Selectors
    getStepConfig: (step: MapFlowStep) => {
      return get().stepConfig[step];
    },
    
    getStepBottomSheet: (step: MapFlowStep) => {
      return get().stepConfig[step].bottomSheet;
    },
    
    getStepMapInteraction: (step: MapFlowStep) => {
      return get().stepConfig[step].mapInteraction;
    },
    
    getStepTransition: (step: MapFlowStep) => {
      return get().stepConfig[step].transition;
    },
  }))
);

// Selectors optimizados para componentes
export const useStepConfig = (step: MapFlowStep) => 
  useConfigSlice((state) => state.stepConfig[step]);

export const useStepBottomSheet = (step: MapFlowStep) => 
  useConfigSlice((state) => state.stepConfig[step].bottomSheet);

export const useStepMapInteraction = (step: MapFlowStep) => 
  useConfigSlice((state) => state.stepConfig[step].mapInteraction);

export const useStepTransition = (step: MapFlowStep) => 
  useConfigSlice((state) => state.stepConfig[step].transition);
