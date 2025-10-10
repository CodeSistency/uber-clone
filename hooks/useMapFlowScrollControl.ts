import { useCallback, useState } from 'react';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store';

interface MapFlowScrollControlReturn {
  scrollEnabled: boolean;
  handlePanningEnabled: boolean;
  contentPanningEnabled: boolean;
  enableScroll: () => void;
  disableScroll: () => void;
  enableHandlePanning: () => void;
  disableHandlePanning: () => void;
  enableContentPanning: () => void;
  disableContentPanning: () => void;
}

export const useMapFlowScrollControl = (step?: MapFlowStep): MapFlowScrollControlReturn => {
  const stepConfig = useMapFlowStore(state => step ? state.steps[step] : undefined);
  const { bottomSheet } = stepConfig || { bottomSheet: { allowDrag: true } };
  
  const [scrollEnabled, setScrollEnabled] = useState(bottomSheet.allowDrag ?? true);
  const [handlePanningEnabled, setHandlePanningEnabled] = useState(bottomSheet.allowDrag ?? true);
  const [contentPanningEnabled, setContentPanningEnabled] = useState(bottomSheet.allowDrag ?? true);
  
  const enableScroll = useCallback(() => {
    setScrollEnabled(true);
    setHandlePanningEnabled(true);
    setContentPanningEnabled(true);
  }, []);
  
  const disableScroll = useCallback(() => {
    setScrollEnabled(false);
    setHandlePanningEnabled(false);
    setContentPanningEnabled(false);
  }, []);
  
  const enableHandlePanning = useCallback(() => {
    setHandlePanningEnabled(true);
  }, []);
  
  const disableHandlePanning = useCallback(() => {
    setHandlePanningEnabled(false);
  }, []);
  
  const enableContentPanning = useCallback(() => {
    setContentPanningEnabled(true);
  }, []);
  
  const disableContentPanning = useCallback(() => {
    setContentPanningEnabled(false);
  }, []);
  
  return {
    scrollEnabled,
    handlePanningEnabled,
    contentPanningEnabled,
    enableScroll,
    disableScroll,
    enableHandlePanning,
    disableHandlePanning,
    enableContentPanning,
    disableContentPanning,
  };
};
