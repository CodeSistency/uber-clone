import { useMemo } from 'react';
import { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store/mapFlow/types';

interface MapFlowAnimatedValuesReturn {
  animatedIndex: any;
  animatedPosition: any;
  animatedHeight: any;
  animatedOpacity: any;
  animatedTranslateY: any;
}

export const useMapFlowAnimatedValues = (step?: MapFlowStep): MapFlowAnimatedValuesReturn => {
  const stepConfig = useMapFlowStore(state => step ? state.steps[step] : undefined);
  const { bottomSheet } = stepConfig || { bottomSheet: { minHeight: 0, maxHeight: 500 } };
  
  // Valores animados estáticos (sin useBottomSheet)
  const animatedIndex = { value: 0 };
  const animatedPosition = { value: 200 };
  
  // Interpolaciones personalizadas
  const animatedHeight = useAnimatedStyle(() => {
    return {
      height: 200,
    };
  });
  
  const animatedOpacity = useAnimatedStyle(() => {
    return { opacity: 1 };
  });
  
  const animatedTranslateY = useAnimatedStyle(() => {
    return { transform: [{ translateY: 0 }] };
  });
  
  return {
    animatedIndex,
    animatedPosition,
    animatedHeight,
    animatedOpacity,
    animatedTranslateY,
  };
};
