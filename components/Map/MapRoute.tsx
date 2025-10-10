import React, { memo } from 'react';
import { Polyline } from 'react-native-maps';
import type { LatLng } from 'react-native-maps';

interface MapRouteProps {
  polyline: LatLng[];
  color?: string;
  width?: number;
}

const MapRoute: React.FC<MapRouteProps> = memo(({
  polyline,
  color = '#4285F4',
  width = 4,
}) => {
  if (polyline.length === 0) return null;

  return (
    <Polyline
      coordinates={polyline}
      strokeColor={color}
      strokeWidth={width}
      lineDashPattern={[0]}
    />
  );
});

MapRoute.displayName = 'MapRoute';

export default MapRoute;
