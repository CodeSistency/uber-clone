import { useState, useEffect, useMemo } from 'react';
import { useFetch } from '@/lib/fetch';
import { MarkerGenerator } from '@/lib/map/markerGenerator';
import type { Driver } from '@/types/driver';
import type { DriverMarker, Coordinates } from '@/types/map';

export const useMapMarkers = (userLocation: Coordinates | null) => {
  const { data: drivers, loading, error } = useFetch<Driver[]>('driver');
  const [markers, setMarkers] = useState<DriverMarker[]>([]);

  useEffect(() => {
    if (!drivers || !userLocation) {
      setMarkers([]);
      return;
    }

    const driversArray = Array.isArray(drivers) ? drivers : [];
    const newMarkers = MarkerGenerator.generateDriverMarkers(
      driversArray,
      userLocation
    );
    setMarkers(newMarkers);
  }, [drivers, userLocation]);

  return {
    markers,
    loading,
    error,
  };
};
