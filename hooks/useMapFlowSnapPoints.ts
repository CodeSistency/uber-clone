import { useCallback, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store';

interface MapFlowSnapPointsReturn {
  snapPoints: string[];
  calculateSnapPoints: () => string[];
}

export const useMapFlowSnapPoints = (step?: MapFlowStep): MapFlowSnapPointsReturn => {
  const stepConfig = useMapFlowStore(state => step ? state.steps[step] : undefined);
  const { bottomSheet } = stepConfig || { bottomSheet: { minHeight: 100, initialHeight: 200, maxHeight: 500 } };
  
  const calculateSnapPoints = useCallback(() => {
    const screenHeight = Dimensions.get('window').height;
    
    const minPercent = Math.round((bottomSheet.minHeight / screenHeight) * 100);
    const initialPercent = Math.round((bottomSheet.initialHeight / screenHeight) * 100);
    const maxPercent = Math.round((bottomSheet.maxHeight / screenHeight) * 100);
    
    const points = [minPercent, initialPercent, maxPercent]
      .filter((height, index, arr) => arr.indexOf(height) === index)
      .sort((a, b) => a - b);
    
    return points.map(point => `${point}%`);
  }, [bottomSheet]);
  
  const snapPoints = useMemo(() => calculateSnapPoints(), [calculateSnapPoints]);
  
  return {
    snapPoints,
    calculateSnapPoints,
  };
};
