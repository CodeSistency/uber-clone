import { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store';

interface MapFlowBackgroundReturn {
  useGradient: boolean;
  useBlur: boolean;
  gradientColors: string[];
  blurIntensity: number;
  blurTint: 'light' | 'dark' | 'default';
  gradientBackground: any;
  blurBackground: any;
}

export const useMapFlowBackground = (step?: MapFlowStep): MapFlowBackgroundReturn => {
  const stepConfig = useMapFlowStore(state => step ? state.steps[step] : undefined);
  const { bottomSheet } = stepConfig || { 
    bottomSheet: { 
      useGradient: false, 
      useBlur: false, 
      gradientColors: [], 
      blurIntensity: 0, 
      blurTint: 'default',
      minHeight: 0,
      maxHeight: 500
    } 
  };
  
  // Background con gradient
  const gradientBackground = useAnimatedStyle(() => {
    if (!bottomSheet.useGradient) return {};
    
    return {
      opacity: 1,
    };
  });
  
  // Background con blur
  const blurBackground = useAnimatedStyle(() => {
    if (!bottomSheet.useBlur) return {};
    
    return {
      opacity: 1,
    };
  });
  
  return {
    useGradient: bottomSheet.useGradient ?? false,
    useBlur: bottomSheet.useBlur ?? false,
    gradientColors: bottomSheet.gradientColors ?? [],
    blurIntensity: bottomSheet.blurIntensity ?? 0,
    blurTint: bottomSheet.blurTint ?? 'default',
    gradientBackground,
    blurBackground,
  };
};
