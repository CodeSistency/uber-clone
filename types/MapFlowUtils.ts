import { StepConfig } from '@/store/mapFlow';

export interface MapFlowMapperReturn {
  index: number;
  snapPoints: string[];
  enableHandlePanningGesture: boolean;
  enableContentPanningGesture: boolean;
  handleComponent: any;
}

export const mapMapFlowToGorhom = (mapFlowConfig: StepConfig): MapFlowMapperReturn => {
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
    enableHandlePanningGesture: enableHandlePanningGesture ?? true,
    enableContentPanningGesture: enableContentPanningGesture ?? true,
    handleComponent,
  };
};

export const calculateSnapPoints = (
  minHeight: number,
  initialHeight: number,
  maxHeight: number
): string[] => {
  const screenHeight = 800; // Default screen height
  
  const minPercent = Math.round((minHeight / screenHeight) * 100);
  const initialPercent = Math.round((initialHeight / screenHeight) * 100);
  const maxPercent = Math.round((maxHeight / screenHeight) * 100);
  
  const points = [minPercent, initialPercent, maxPercent]
    .filter((height, index, arr) => arr.indexOf(height) === index)
    .sort((a, b) => a - b);
  
  return points.map(point => `${point}%`);
};
