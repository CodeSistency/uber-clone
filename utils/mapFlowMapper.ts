import { StepConfig } from '@/store/mapFlow';
import { Dimensions } from 'react-native';

export const mapMapFlowToGorhom = (mapFlowConfig: StepConfig) => {
  const { bottomSheet } = mapFlowConfig;
  
  // Mapeo de visibilidad
  const index = bottomSheet.visible ? 0 : -1;
  
  // Mapeo de snap points
  const snapPoints = calculateSnapPoints(
    bottomSheet.minHeight,
    bottomSheet.initialHeight,
    bottomSheet.maxHeight
  );
  
  // Mapeo de gestos
  const enableHandlePanningGesture = bottomSheet.allowDrag;
  const enableContentPanningGesture = bottomSheet.allowDrag;
  
  // Mapeo de handle
  const handleComponent = bottomSheet.showHandle ? undefined : null;
  
  return {
    index,
    snapPoints,
    enableHandlePanningGesture,
    enableContentPanningGesture,
    handleComponent,
  };
};

const calculateSnapPoints = (
  minHeight: number,
  initialHeight: number,
  maxHeight: number
): string[] => {
  const screenHeight = Dimensions.get('window').height;
  
  const minPercent = Math.round((minHeight / screenHeight) * 100);
  const initialPercent = Math.round((initialHeight / screenHeight) * 100);
  const maxPercent = Math.round((maxHeight / screenHeight) * 100);
  
  const points = [minPercent, initialPercent, maxPercent]
    .filter((height, index, arr) => arr.indexOf(height) === index)
    .sort((a, b) => a - b);
  
  return points.map(point => `${point}%`);
};


