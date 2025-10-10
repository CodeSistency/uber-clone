import type { Coordinates, MapRegion } from '@/types/map';

const DEFAULT_REGION: MapRegion = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const MIN_DELTA = 0.002;
const PADDING_MULTIPLIER = 1.3;

export class RegionCalculator {
  /**
   * Calcula región óptima del mapa para mostrar puntos dados
   */
  static calculateRegion(points: Coordinates[]): MapRegion {
    if (points.length === 0) {
      return DEFAULT_REGION;
    }

    if (points.length === 1) {
      return {
        latitude: points[0].latitude,
        longitude: points[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const latitudes = points.map(p => p.latitude);
    const longitudes = points.map(p => p.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latitudeDelta = Math.max((maxLat - minLat) * PADDING_MULTIPLIER, MIN_DELTA);
    const longitudeDelta = Math.max((maxLng - minLng) * PADDING_MULTIPLIER, MIN_DELTA);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta,
      longitudeDelta,
    };
  }

  /**
   * Calcula región para mostrar origen y destino
   */
  static calculateRouteRegion(
    origin: Coordinates | null,
    destination: Coordinates | null
  ): MapRegion {
    const points: Coordinates[] = [];
    if (origin) points.push(origin);
    if (destination) points.push(destination);

    return this.calculateRegion(points);
  }
}
