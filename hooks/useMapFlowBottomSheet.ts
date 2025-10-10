import { useCallback, useState } from 'react';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store';

interface MapFlowBottomSheetReturn {
  // Métodos de control
  goToSnapPoint: (index: number) => void;
  goToHeight: (height: number) => void;
  scrollUpComplete: () => void;
  scrollDownComplete: () => void;
  
  // Métodos de estado
  getCurrentHeight: () => number;
  isAtMaxHeight: () => boolean;
  isAtMinHeight: () => boolean;
  
  // Control de scroll
  enableScroll: () => void;
  disableScroll: () => void;
  scrollEnabled: boolean;
  
  // Valores animados
  animatedIndex: any;
  animatedPosition: any;
}

export const useMapFlowBottomSheet = (step?: MapFlowStep): MapFlowBottomSheetReturn => {
  const stepConfig = useMapFlowStore(state => step ? state.steps[step] : undefined);
  const { bottomSheet } = stepConfig || { bottomSheet: { allowDrag: true } };
  
  // Mapeo de métodos del InlineBottomSheet (sin useBottomSheet)
  const goToSnapPoint = useCallback((index: number) => {
    console.log('goToSnapPoint:', index);
  }, []);
  
  const goToHeight = useCallback((height: number) => {
    console.log('goToHeight:', height);
  }, []);
  
  const scrollUpComplete = useCallback(() => {
    console.log('scrollUpComplete');
  }, []);
  
  const scrollDownComplete = useCallback(() => {
    console.log('scrollDownComplete');
  }, []);
  
  const getCurrentHeight = useCallback(() => {
    return 200; // Default height
  }, []);
  
  const isAtMaxHeight = useCallback(() => {
    return false;
  }, []);
  
  const isAtMinHeight = useCallback(() => {
    return true;
  }, []);
  
  // Control de scroll
  const [scrollEnabled, setScrollEnabled] = useState(bottomSheet.allowDrag ?? true);
  
  const enableScroll = useCallback(() => {
    setScrollEnabled(true);
  }, []);
  
  const disableScroll = useCallback(() => {
    setScrollEnabled(false);
  }, []);
  
  return {
    goToSnapPoint,
    goToHeight,
    scrollUpComplete,
    scrollDownComplete,
    getCurrentHeight,
    isAtMaxHeight,
    isAtMinHeight,
    enableScroll,
    disableScroll,
    scrollEnabled,
    animatedIndex: { value: 0 },
    animatedPosition: { value: 200 },
  };
};
