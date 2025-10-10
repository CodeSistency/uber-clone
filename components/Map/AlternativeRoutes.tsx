import React, { memo } from 'react';
import { Polyline } from 'react-native-maps';
import type { AlternativeRoute } from '@/types/map';

interface AlternativeRoutesProps {
  routes: AlternativeRoute[];
  selectedIndex: number;
  onRoutePress: (index: number) => void;
}

const AlternativeRoutes: React.FC<AlternativeRoutesProps> = memo(({
  routes,
  selectedIndex,
  onRoutePress,
}) => {
  return (
    <>
      {routes.map((route, index) => {
        const isSelected = index === selectedIndex;
        
        return (
          <Polyline
            key={`route-${index}`}
            coordinates={route.polyline}
            strokeColor={isSelected ? '#4285F4' : '#B0BEC5'}
            strokeWidth={isSelected ? 5 : 3}
            lineDashPattern={isSelected ? [0] : [5, 5]}
            tappable
            onPress={() => onRoutePress(index)}
            zIndex={isSelected ? 2 : 1}
          />
        );
      })}
    </>
  );
});

AlternativeRoutes.displayName = 'AlternativeRoutes';

export default AlternativeRoutes;
