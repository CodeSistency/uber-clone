import { useMemo } from 'react';
import { Easing } from 'react-native';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store';

interface MapFlowAnimationConfigReturn {
  animationConfig: {
    duration: number;
    easing: any;
  };
  transitionType: string;
  transitionDuration: number;
}

export const useMapFlowAnimationConfig = (step?: MapFlowStep): MapFlowAnimationConfigReturn => {
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
  
  return {
    animationConfig,
    transitionType: transition?.type || 'none',
    transitionDuration: transition?.duration || 0,
  };
};
