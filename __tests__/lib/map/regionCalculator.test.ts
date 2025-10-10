import { RegionCalculator } from '@/lib/map/regionCalculator';
import type { Coordinates } from '@/types/map';

describe('RegionCalculator', () => {
  describe('calculateRegion', () => {
    it('should return default region for empty points', () => {
      const result = RegionCalculator.calculateRegion([]);
      
      expect(result).toEqual({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    });

    it('should return single point region for one point', () => {
      const point: Coordinates = { latitude: 40.7128, longitude: -74.006 };
      const result = RegionCalculator.calculateRegion([point]);
      
      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    });

    it('should calculate region for multiple points', () => {
      const points: Coordinates[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7589, longitude: -73.9851 },
      ];
      
      const result = RegionCalculator.calculateRegion(points);
      
      expect(result.latitude).toBeCloseTo(40.73585, 5);
      expect(result.longitude).toBeCloseTo(-73.99555, 5);
      expect(result.latitudeDelta).toBeGreaterThan(0);
      expect(result.longitudeDelta).toBeGreaterThan(0);
    });

    it('should apply minimum delta for very close points', () => {
      const points: Coordinates[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7129, longitude: -74.0061 },
      ];
      
      const result = RegionCalculator.calculateRegion(points);
      
      expect(result.latitudeDelta).toBeGreaterThanOrEqual(0.002);
      expect(result.longitudeDelta).toBeGreaterThanOrEqual(0.002);
    });

    it('should apply padding multiplier', () => {
      const points: Coordinates[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7589, longitude: -73.9851 },
      ];
      
      const result = RegionCalculator.calculateRegion(points);
      
      // Should be larger than the actual distance due to padding
      const actualLatDelta = Math.abs(40.7589 - 40.7128);
      const actualLngDelta = Math.abs(-73.9851 - (-74.006));
      
      expect(result.latitudeDelta).toBeGreaterThan(actualLatDelta);
      expect(result.longitudeDelta).toBeGreaterThan(actualLngDelta);
    });
  });

  describe('calculateRouteRegion', () => {
    it('should return default region when both points are null', () => {
      const result = RegionCalculator.calculateRouteRegion(null, null);
      
      expect(result).toEqual({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    });

    it('should return single point region when only origin is provided', () => {
      const origin: Coordinates = { latitude: 40.7128, longitude: -74.006 };
      const result = RegionCalculator.calculateRouteRegion(origin, null);
      
      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    });

    it('should return single point region when only destination is provided', () => {
      const destination: Coordinates = { latitude: 40.7589, longitude: -73.9851 };
      const result = RegionCalculator.calculateRouteRegion(null, destination);
      
      expect(result).toEqual({
        latitude: 40.7589,
        longitude: -73.9851,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    });

    it('should calculate region for both origin and destination', () => {
      const origin: Coordinates = { latitude: 40.7128, longitude: -74.006 };
      const destination: Coordinates = { latitude: 40.7589, longitude: -73.9851 };
      
      const result = RegionCalculator.calculateRouteRegion(origin, destination);
      
      expect(result.latitude).toBeCloseTo(40.73585, 5);
      expect(result.longitude).toBeCloseTo(-73.99555, 5);
      expect(result.latitudeDelta).toBeGreaterThan(0);
      expect(result.longitudeDelta).toBeGreaterThan(0);
    });
  });
});
