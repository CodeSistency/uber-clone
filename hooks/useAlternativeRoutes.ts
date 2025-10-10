import { useState, useCallback } from 'react';
import { routeCalculator } from '@/lib/map/routeCalculator';
import type { AlternativeRoute, Coordinates } from '@/types/map';

export const useAlternativeRoutes = () => {
  const [routes, setRoutes] = useState<AlternativeRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoutes = useCallback(async (
    origin: Coordinates,
    destination: Coordinates,
    maxAlternatives: number = 3
  ) => {
    setIsLoading(true);
    setError(null);

    const result = await routeCalculator.calculateAlternativeRoutes({
      origin,
      destination,
      maxAlternatives,
    });

    if (result.success) {
      setRoutes(result.data);
      // Seleccionar la ruta más rápida por defecto
      const fastestIndex = result.data.findIndex(r => r.isFastest);
      setSelectedRouteIndex(fastestIndex >= 0 ? fastestIndex : 0);
    } else {
      setError(result.error);
      setRoutes([]);
    }

    setIsLoading(false);
  }, []);

  const selectRoute = useCallback((index: number) => {
    if (index >= 0 && index < routes.length) {
      setSelectedRouteIndex(index);
    }
  }, [routes.length]);

  const clearRoutes = useCallback(() => {
    setRoutes([]);
    setSelectedRouteIndex(0);
    setError(null);
  }, []);

  return {
    routes,
    selectedRoute: routes[selectedRouteIndex] || null,
    selectedRouteIndex,
    selectRoute,
    calculateRoutes,
    clearRoutes,
    isLoading,
    error,
  };
};
