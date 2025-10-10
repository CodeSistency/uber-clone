import { useState, useEffect, useCallback } from 'react';
import { LatLng } from 'react-native-maps';
import { routeCalculator } from '@/lib/map/routeCalculator';
import type { CalculatedRoute, Coordinates } from '@/types/map';

export const useMapRoutes = (
  origin: Coordinates | null,
  destination: Coordinates | null
) => {
  const [route, setRoute] = useState<CalculatedRoute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(async () => {
    if (!origin || !destination) {
      setRoute(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await routeCalculator.calculateRoute({
      origin,
      destination,
    });

    if (result.success) {
      setRoute(result.data);
    } else {
      setError(result.error);
      setRoute(null);
    }

    setIsLoading(false);
  }, [origin, destination]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  return {
    route,
    isLoading,
    error,
    recalculate: calculateRoute,
  };
};
