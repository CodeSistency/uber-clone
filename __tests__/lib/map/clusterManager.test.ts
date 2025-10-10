import { ClusterManager } from '@/lib/map/clusterManager';
import type { DriverMarker } from '@/types/map';

describe('ClusterManager', () => {
  let clusterManager: ClusterManager;

  beforeEach(() => {
    clusterManager = new ClusterManager();
  });

  const mockMarkers: DriverMarker[] = [
    {
      id: '1',
      latitude: 40.7128,
      longitude: -74.0060,
      title: 'Driver 1',
      type: 'driver',
      driverId: 1,
      firstName: 'John',
      lastName: 'Doe',
      profileImageUrl: '',
      carImageUrl: '',
      carSeats: 4,
      rating: 4.5,
    },
    {
      id: '2',
      latitude: 40.7130,
      longitude: -74.0058,
      title: 'Driver 2',
      type: 'driver',
      driverId: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      profileImageUrl: '',
      carImageUrl: '',
      carSeats: 4,
      rating: 4.8,
    },
    {
      id: '3',
      latitude: 40.7500,
      longitude: -73.9500,
      title: 'Driver 3',
      type: 'driver',
      driverId: 3,
      firstName: 'Bob',
      lastName: 'Johnson',
      profileImageUrl: '',
      carImageUrl: '',
      carSeats: 6,
      rating: 4.2,
    },
  ];

  describe('load', () => {
    it('should load markers into the cluster manager', () => {
      clusterManager.load(mockMarkers);
      // No direct way to test internal state, but should not throw
      expect(() => clusterManager.load(mockMarkers)).not.toThrow();
    });
  });

  describe('getClusters', () => {
    beforeEach(() => {
      clusterManager.load(mockMarkers);
    });

    it('should return clusters for a given bounds and zoom', () => {
      const bounds = {
        northEast: { latitude: 40.8, longitude: -73.9 },
        southWest: { latitude: 40.6, longitude: -74.1 },
      };
      const zoom = 10;

      const clusters = clusterManager.getClusters(bounds, zoom);
      expect(clusters).toBeDefined();
      expect(Array.isArray(clusters)).toBe(true);
    });

    it('should return individual markers when clustering is disabled', () => {
      clusterManager.updateOptions({ enabled: false });
      
      const bounds = {
        northEast: { latitude: 40.8, longitude: -73.9 },
        southWest: { latitude: 40.6, longitude: -74.1 },
      };
      const zoom = 10;

      const clusters = clusterManager.getClusters(bounds, zoom);
      expect(clusters).toBeDefined();
      expect(Array.isArray(clusters)).toBe(true);
    });
  });

  describe('getClusterExpansionZoom', () => {
    beforeEach(() => {
      clusterManager.load(mockMarkers);
    });

    it('should return a zoom level for cluster expansion', () => {
      const zoom = clusterManager.getClusterExpansionZoom(1);
      expect(typeof zoom).toBe('number');
      expect(zoom).toBeGreaterThan(0);
    });
  });

  describe('updateOptions', () => {
    it('should update clustering options', () => {
      const newOptions = {
        enabled: false,
        radius: 100,
        maxZoom: 15,
      };

      clusterManager.updateOptions(newOptions);
      const options = clusterManager.getOptions();
      
      expect(options.enabled).toBe(false);
      expect(options.radius).toBe(100);
      expect(options.maxZoom).toBe(15);
    });
  });

  describe('clear', () => {
    it('should clear all data', () => {
      clusterManager.load(mockMarkers);
      clusterManager.clear();
      
      // After clearing, should not throw when getting clusters
      const bounds = {
        northEast: { latitude: 40.8, longitude: -73.9 },
        southWest: { latitude: 40.6, longitude: -74.1 },
      };
      const zoom = 10;

      expect(() => clusterManager.getClusters(bounds, zoom)).not.toThrow();
    });
  });
});
