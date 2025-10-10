import { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store';

interface MapFlowHeightsReturn {
  // Snap points calculados
  snapPoints: string[];
  
  // Alturas específicas
  minHeight: number;
  maxHeight: number;
  initialHeight: number;
  
  // Porcentajes calculados
  minPercent: number;
  maxPercent: number;
  initialPercent: number;
  
  // Categorías de altura
  isSmallHeight: boolean; // 100-120px
  isMediumHeight: boolean; // 140-200px
  isLargeHeight: boolean; // 300-500px
  isVeryLargeHeight: boolean; // 500-700px
  
  // Configuraciones especiales
  isSearchingDriverHeight: boolean; // 300-700px
  isConfirmationHeight: boolean; // 100-260px
  isRatingHeight: boolean; // 260-640px
}

export const useMapFlowHeights = (step?: MapFlowStep): MapFlowHeightsReturn => {
  const stepConfig = useMapFlowStore(state => step ? state.steps[step] : undefined);
  const { bottomSheet } = stepConfig || { bottomSheet: { minHeight: 100, initialHeight: 200, maxHeight: 500 } };
  
  const screenHeight = Dimensions.get('window').height;
  
  // Calcular porcentajes
  const minPercent = Math.round((bottomSheet.minHeight / screenHeight) * 100);
  const initialPercent = Math.round((bottomSheet.initialHeight / screenHeight) * 100);
  const maxPercent = Math.round((bottomSheet.maxHeight / screenHeight) * 100);
  
  // Calcular snap points con variación por paso
  const snapPoints = useMemo(() => {
    // Snap points específicos por tipo de paso
    const getSnapPointsForStep = (step: MapFlowStep) => {
      switch (step) {
        case 'confirm_origin':
        case 'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION':
          // Pasos de confirmación - altura pequeña
          return [minPercent, Math.min(initialPercent + 10, maxPercent)]
            .filter(point => point > 0)
            .sort((a, b) => a - b);
            
        case 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR':
          // Búsqueda de conductor - altura grande
          return [minPercent, initialPercent, maxPercent]
            .filter(point => point > 0)
            .sort((a, b) => a - b);
            
        case 'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION':
        case 'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO':
          // Pasos de espera - altura media
          return [minPercent, Math.min(initialPercent + 15, maxPercent)]
            .filter(point => point > 0)
            .sort((a, b) => a - b);
            
        case 'DRIVER_FINALIZACION_RATING':
          // Rating - altura variable
          return [minPercent, initialPercent, maxPercent]
            .filter(point => point > 0)
            .sort((a, b) => a - b);
            
        default:
          // Pasos por defecto
          return [minPercent, initialPercent, maxPercent]
            .filter(point => point > 0)
            .sort((a, b) => a - b);
      }
    };
    
    const points = getSnapPointsForStep(step || 'idle');
    
    // Asegurar que siempre hay al menos un snap point válido
    if (points.length === 0) {
      return ['25%']; // Snap point por defecto
    }
    
    return points.map(point => `${point}%`);
  }, [minPercent, initialPercent, maxPercent, step]);
  
  // Categorías de altura
  const isSmallHeight = bottomSheet.minHeight >= 100 && bottomSheet.minHeight <= 120;
  const isMediumHeight = bottomSheet.minHeight >= 140 && bottomSheet.minHeight <= 200;
  const isLargeHeight = bottomSheet.minHeight >= 300 && bottomSheet.minHeight <= 500;
  const isVeryLargeHeight = bottomSheet.minHeight >= 500 && bottomSheet.minHeight <= 700;
  
  // Configuraciones especiales
  const isSearchingDriverHeight = step === 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR';
  const isConfirmationHeight = step === 'confirm_origin' || step === 'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION';
  const isRatingHeight = step === 'DRIVER_FINALIZACION_RATING';
  
  return {
    snapPoints,
    minHeight: bottomSheet.minHeight,
    maxHeight: bottomSheet.maxHeight,
    initialHeight: bottomSheet.initialHeight,
    minPercent,
    maxPercent,
    initialPercent,
    isSmallHeight,
    isMediumHeight,
    isLargeHeight,
    isVeryLargeHeight,
    isSearchingDriverHeight,
    isConfirmationHeight,
    isRatingHeight,
  };
};
