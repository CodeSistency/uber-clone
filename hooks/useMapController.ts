import { useRef } from 'react';
import { Region, LatLng } from 'react-native-maps';
import { MapHandle } from '@/components/Map';

export const useMapController = () => {
  const mapRef = useRef<MapHandle | null>(null);

  const setRef = (ref: MapHandle | null) => {
    mapRef.current = ref;
  };

  const zoomTo = (center: LatLng, delta: number, duration = 500) => {
    const region: Region = {
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
    mapRef.current?.animateToRegion(region, duration);
  };

  const panTo = (center: LatLng, duration = 500) => {
    mapRef.current?.animateToCoordinate(center, duration);
  };

  const fitBounds = (coords: LatLng[], padding = { top: 40, right: 40, bottom: 40, left: 40 }) => {
    mapRef.current?.fitToCoordinates(coords, { edgePadding: padding, animated: true });
  };

  const setCamera = (config: any) => {
    mapRef.current?.setCamera(config);
  };

  return {
    setRef,
    zoomTo,
    panTo,
    fitBounds,
    setCamera,
  };
};


