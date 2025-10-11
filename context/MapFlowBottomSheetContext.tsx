import React, { createContext, useContext } from 'react';

interface MapFlowBottomSheetContextValue {
  closeBottomSheet: () => void;
  isCloseable: boolean;
  mode: 'back' | 'close';
  isConnected: boolean;
}

const MapFlowBottomSheetContext = createContext<MapFlowBottomSheetContextValue | null>(null);

export const MapFlowBottomSheetProvider = MapFlowBottomSheetContext.Provider;

export const useMapFlowBottomSheet = () => {
  const context = useContext(MapFlowBottomSheetContext);
  if (!context) {
    // Retornar valores por defecto si no está en el contexto
    return {
      closeBottomSheet: () => console.warn('closeBottomSheet called outside provider'),
      isCloseable: false,
      mode: 'back' as const,
      isConnected: false,
    };
  }
  return context;
};
