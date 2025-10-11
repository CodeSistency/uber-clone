import { useCallback } from 'react';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import BottomSheet from '@gorhom/bottom-sheet';

export const useBottomSheetCloseAnimation = (
  bottomSheetRef: React.RefObject<BottomSheet>,
  onCloseComplete?: () => void
) => {
  const animating = useSharedValue(false);
  
  const closeWithAnimation = useCallback((duration: number = 300) => {
    if (animating.value) return;
    
    animating.value = true;
    
    // Cerrar el bottom sheet
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
    
    // Ejecutar callback después de la animación
    setTimeout(() => {
      animating.value = false;
      onCloseComplete?.();
    }, duration);
  }, [bottomSheetRef, onCloseComplete, animating]);
  
  return {
    closeWithAnimation,
    isAnimating: animating,
  };
};
