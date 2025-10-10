import { useMemo } from 'react';
import { Easing } from 'react-native';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store';

interface TransitionConfig {
  type: 'slide' | 'fade' | 'none';
  duration: number;
}

interface MapFlowTransitionsReturn {
  // Configuración de animación
  animationConfig: {
    duration: number;
    easing: any;
  };
  
  // Información de transición
  transitionType: string;
  transitionDuration: number;
  
  // Configuraciones específicas por tipo
  isSlideTransition: boolean;
  isFadeTransition: boolean;
  isNoneTransition: boolean;
  
  // Configuraciones específicas por duración
  isQuickTransition: boolean; // 180ms
  isStandardTransition: boolean; // 200ms
  isSmoothTransition: boolean; // 220ms
}

export const useMapFlowTransitions = (step?: MapFlowStep): MapFlowTransitionsReturn => {
  const stepConfig = useMapFlowStore(state => step ? state.steps[step] : undefined);
  const { transition } = stepConfig || { transition: { type: 'none', duration: 0 } };
  
  const animationConfig = useMemo(() => {
    const { type, duration } = transition || { type: 'none', duration: 0 };
    
    switch (type) {
      case 'slide':
        return {
          duration: duration ?? 200,
          easing: Easing.out(Easing.cubic),
        };
      case 'fade':
        return {
          duration: duration ?? 200,
          easing: Easing.inOut(Easing.ease),
        };
      case 'none':
        return {
          duration: 0,
          easing: Easing.linear,
        };
      default:
        return {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        };
    }
  }, [transition]);
  
  // Identificar tipo de transición
  const isSlideTransition = transition?.type === 'slide';
  const isFadeTransition = transition?.type === 'fade';
  const isNoneTransition = transition?.type === 'none';
  
  // Identificar duración de transición
  const isQuickTransition = transition?.duration === 180;
  const isStandardTransition = transition?.duration === 200;
  const isSmoothTransition = transition?.duration === 220;
  
  return {
    animationConfig,
    transitionType: transition?.type || 'none',
    transitionDuration: transition?.duration || 0,
    isSlideTransition,
    isFadeTransition,
    isNoneTransition,
    isQuickTransition,
    isStandardTransition,
    isSmoothTransition,
  };
};
