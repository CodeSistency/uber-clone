import { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { MapFlowStep } from '@/store';

interface MapFlowFooterReturn {
  footerStyle: any;
  bottomBar: React.ReactNode;
  bottomBarHeight: number;
  showBottomBarAt: number;
}

export const useMapFlowFooter = (step?: MapFlowStep): MapFlowFooterReturn => {
  const stepConfig = useMapFlowStore(state => step ? state.steps[step] : undefined);
  const { bottomSheet } = stepConfig || { 
    bottomSheet: { 
      bottomBar: null, 
      bottomBarHeight: 0, 
      showBottomBarAt: 0,
      minHeight: 0,
      maxHeight: 500
    } 
  };
  
  const footerStyle = useAnimatedStyle(() => {
    if (!bottomSheet.bottomBar) return {};
    
    return {
      opacity: 1,
      transform: [{ translateY: 0 }],
    };
  });
  
  return {
    footerStyle,
    bottomBar: bottomSheet.bottomBar,
    bottomBarHeight: bottomSheet.bottomBarHeight ?? 0,
    showBottomBarAt: bottomSheet.showBottomBarAt ?? 0,
  };
};
