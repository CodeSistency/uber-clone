import { LatLng } from 'react-native-maps';
import { endpoints } from '@/lib/endpoints';
import type { 
  CalculatedRoute, 
  RouteOptions, 
  RouteCalculationResult,
  GoogleDirectionsResponse,
  RouteErrorCode,
  AlternativeRoute,
  AlternativeRoutesResult
} from '@/types/map';

class RouteCalculator {
  private cache = new Map<string, CalculatedRoute>();
  private pendingRequests = new Map<string, Promise<RouteCalculationResult>>();

  /**
   * Calcula ruta entre dos puntos con caché y deduplicación
   */
  async calculateRoute(options: RouteOptions): Promise<RouteCalculationResult> {
    const cacheKey = this.getCacheKey(options);

    // Retornar desde caché si existe
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    // Deduplicar requests simultáneos
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending;
    }

    const request = this.fetchRoute(options);
    this.pendingRequests.set(cacheKey, request);

    try {
      const result = await request;
      if (result.success) {
        this.cache.set(cacheKey, result.data);
      }
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchRoute(options: RouteOptions): Promise<RouteCalculationResult> {
    try {
      const { origin, destination, mode = 'driving' } = options;

      const response = await fetch(
        endpoints.googleMaps.directions('json', {
          origin: `${origin.latitude},${origin.longitude}`,
          destination: `${destination.latitude},${destination.longitude}`,
          mode,
        })
      );

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error: ${response.status}`,
          code: RouteErrorCode.API_ERROR,
        };
      }

      const data: GoogleDirectionsResponse = await response.json();

      if (data.status !== 'OK' || !data.routes?.[0]) {
        return {
          success: false,
          error: `No routes found: ${data.status}`,
          code: RouteErrorCode.NO_ROUTES_FOUND,
        };
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        success: true,
        data: {
          polyline: this.decodePolyline(route.overview_polyline.points),
          distance: leg.distance.value,
          duration: leg.duration.value,
          distanceText: leg.distance.text,
          durationText: leg.duration.text,
          bounds: {
            northeast: {
              latitude: route.bounds.northeast.lat,
              longitude: route.bounds.northeast.lng,
            },
            southwest: {
              latitude: route.bounds.southwest.lat,
              longitude: route.bounds.southwest.lng,
            },
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: RouteErrorCode.NETWORK_ERROR,
      };
    }
  }

  private decodePolyline(encoded: string): LatLng[] {
    const points: LatLng[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte: number;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      points.push({
        latitude: lat / 100000,
        longitude: lng / 100000,
      });
    }

    return points;
  }

  private getCacheKey(options: RouteOptions): string {
    return `${options.origin.latitude},${options.origin.longitude}-${options.destination.latitude},${options.destination.longitude}-${options.mode || 'driving'}`;
  }

  /**
   * Calcula rutas alternativas entre dos puntos
   */
  async calculateAlternativeRoutes(
    options: RouteOptions & { maxAlternatives?: number }
  ): Promise<AlternativeRoutesResult> {
    try {
      const { origin, destination, mode = 'driving', maxAlternatives = 3 } = options;

      const response = await fetch(
        endpoints.googleMaps.directions('json', {
          origin: `${origin.latitude},${origin.longitude}`,
          destination: `${destination.latitude},${destination.longitude}`,
          mode,
          alternatives: true,
        })
      );

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error: ${response.status}`,
          code: RouteErrorCode.API_ERROR,
        };
      }

      const data: GoogleDirectionsResponse = await response.json();

      if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
        return {
          success: false,
          error: `No routes found: ${data.status}`,
          code: RouteErrorCode.NO_ROUTES_FOUND,
        };
      }

      // Procesar múltiples rutas
      const routes: AlternativeRoute[] = data.routes
        .slice(0, maxAlternatives)
        .map((route, index) => {
          const leg = route.legs[0];
          const baseRoute = {
            polyline: this.decodePolyline(route.overview_polyline.points),
            distance: leg.distance.value,
            duration: leg.duration.value,
            distanceText: leg.distance.text,
            durationText: leg.duration.text,
            bounds: {
              northeast: {
                latitude: route.bounds.northeast.lat,
                longitude: route.bounds.northeast.lng,
              },
              southwest: {
                latitude: route.bounds.southwest.lat,
                longitude: route.bounds.southwest.lng,
              },
            },
          };

          // Determinar características de la ruta
          const durations = data.routes.map(r => r.legs[0].duration.value);
          const distances = data.routes.map(r => r.legs[0].distance.value);

          return {
            ...baseRoute,
            routeIndex: index,
            isFastest: leg.duration.value === Math.min(...durations),
            isShortest: leg.distance.value === Math.min(...distances),
            trafficLevel: this.estimateTraffic(leg.duration.value, leg.distance.value),
            tollsCount: 0, // Se puede calcular desde la respuesta detallada
          };
        });

      return { success: true, data: routes };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: RouteErrorCode.NETWORK_ERROR,
      };
    }
  }

  /**
   * Estima el nivel de tráfico basado en duración y distancia
   */
  private estimateTraffic(duration: number, distance: number): 'low' | 'medium' | 'high' {
    const speed = (distance / 1000) / (duration / 3600); // km/h
    if (speed > 50) return 'low';
    if (speed > 30) return 'medium';
    return 'high';
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const routeCalculator = new RouteCalculator();
