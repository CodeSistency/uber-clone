import { routeCalculator } from '@/lib/map/routeCalculator';
import { RouteErrorCode } from '@/types/map';

// Mock fetch globally
global.fetch = jest.fn();

describe('RouteCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    routeCalculator.clearCache();
  });

  it('should cache routes correctly', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        status: 'OK',
        routes: [{
          legs: [{
            distance: { text: '5.2 km', value: 5200 },
            duration: { text: '15 min', value: 900 },
            start_location: { lat: 40.7128, lng: -74.006 },
            end_location: { lat: 40.7489, lng: -73.9680 },
            steps: []
          }],
          overview_polyline: { points: 'encoded_polyline_string' },
          bounds: {
            northeast: { lat: 40.7489, lng: -73.9680 },
            southwest: { lat: 40.7128, lng: -74.006 }
          }
        }]
      })
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const options = {
      origin: { latitude: 40.7128, longitude: -74.006 },
      destination: { latitude: 40.7489, longitude: -73.9680 },
    };

    const result1 = await routeCalculator.calculateRoute(options);
    const result2 = await routeCalculator.calculateRoute(options);

    expect(result1).toEqual(result2);
    expect(routeCalculator.getCacheSize()).toBe(1);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only called once due to caching
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await routeCalculator.calculateRoute({
      origin: { latitude: 0, longitude: 0 },
      destination: { latitude: 0, longitude: 0 },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe(RouteErrorCode.API_ERROR);
    }
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await routeCalculator.calculateRoute({
      origin: { latitude: 0, longitude: 0 },
      destination: { latitude: 0, longitude: 0 },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe(RouteErrorCode.NETWORK_ERROR);
    }
  });

  it('should handle no routes found', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'ZERO_RESULTS',
        routes: []
      })
    });

    const result = await routeCalculator.calculateRoute({
      origin: { latitude: 0, longitude: 0 },
      destination: { latitude: 0, longitude: 0 },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe(RouteErrorCode.NO_ROUTES_FOUND);
    }
  });

  it('should deduplicate concurrent requests', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        status: 'OK',
        routes: [{
          legs: [{
            distance: { text: '5.2 km', value: 5200 },
            duration: { text: '15 min', value: 900 },
            start_location: { lat: 40.7128, lng: -74.006 },
            end_location: { lat: 40.7489, lng: -73.9680 },
            steps: []
          }],
          overview_polyline: { points: 'encoded_polyline_string' },
          bounds: {
            northeast: { lat: 40.7489, lng: -73.9680 },
            southwest: { lat: 40.7128, lng: -74.006 }
          }
        }]
      })
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const options = {
      origin: { latitude: 40.7128, longitude: -74.006 },
      destination: { latitude: 40.7489, longitude: -73.9680 },
    };

    // Start multiple concurrent requests
    const promises = [
      routeCalculator.calculateRoute(options),
      routeCalculator.calculateRoute(options),
      routeCalculator.calculateRoute(options),
    ];

    const results = await Promise.all(promises);

    // All results should be identical
    expect(results[0]).toEqual(results[1]);
    expect(results[1]).toEqual(results[2]);
    
    // Fetch should only be called once
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
