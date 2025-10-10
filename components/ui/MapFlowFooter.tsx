import React from 'react';
import { Animated } from 'react-native';
import { useMapFlowStore } from '@/store/mapFlow';
import { useMapFlowFooter } from '@/hooks/useMapFlowFooter';
import { MapFlowStep } from '@/store/mapFlow';

interface MapFlowFooterProps {
  step?: MapFlowStep;
  bottomBar?: React.ReactNode;
  bottomBarHeight?: number;
  showBottomBarAt?: number;
}

const MapFlowFooter: React.FC<MapFlowFooterProps> = ({
  step,
  bottomBar,
  bottomBarHeight,
  showBottomBarAt,
}) => {
  const footer = useMapFlowFooter(step);
  
  return (
    <Animated.View
      style={[
        footer.footerStyle,
        { height: bottomBarHeight || footer.bottomBarHeight }
      ]}
    >
      {bottomBar || footer.bottomBar}
    </Animated.View>
  );
};

export default MapFlowFooter;


