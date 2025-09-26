import { renderHook } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import {
  useMapCenter,
  useBusinessMapCenter,
  useDriverMapCenter
} from '../../hooks/useMapCenter';

describe('useMapCenter', () => {
  const mockDimensions = {
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
  };

  beforeAll(() => {
    // Mock Dimensions
    jest.spyOn(Dimensions, 'get').mockImplementation((dimension: 'window' | 'screen') => {
      return mockDimensions;
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    test('returns null when user location is not provided', () => {
      const { result } = renderHook(() =>
        useMapCenter(null, null)
      );

      expect(result.current).toBeNull();
    });

    test('returns user location when only user coordinates provided', () => {
      const { result } = renderHook(() =>
        useMapCenter(40.7128, -74.0060)
      );

      expect(result.current).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        latitudeDelta: expect.any(Number),
        longitudeDelta: expect.any(Number),
      });
    });

    test('calculates center between user and destination', () => {
      const { result } = renderHook(() =>
        useMapCenter(40.7128, -74.0060, 40.7589, -73.9851)
      );

      expect(result.current).toEqual({
        latitude: (40.7128 + 40.7589) / 2, // Center latitude
        longitude: (-74.0060 + -73.9851) / 2, // Center longitude
        latitudeDelta: expect.any(Number),
        longitudeDelta: expect.any(Number),
      });
    });
  });

  describe('Options Handling', () => {
    test('uses default options when none provided', () => {
      const { result } = renderHook(() =>
        useMapCenter(40.7128, -74.0060)
      );

      expect(result.current?.latitudeDelta).toBeGreaterThan(0);
      expect(result.current?.longitudeDelta).toBeGreaterThan(0);
    });

    test('respects bottomSheetHeight option', () => {
      const { result: result1 } = renderHook(() =>
        useMapCenter(40.7128, -74.0060, undefined, undefined, { bottomSheetHeight: 20 })
      );

      const { result: result2 } = renderHook(() =>
        useMapCenter(40.7128, -74.0060, undefined, undefined, { bottomSheetHeight: 60 })
      );

      // Different bottom sheet heights should result in different deltas
      expect(result1.current?.latitudeDelta).not.toBe(result2.current?.latitudeDelta);
    });

    test('handles floating elements', () => {
      const { result: result1 } = renderHook(() =>
        useMapCenter(40.7128, -74.0060, undefined, undefined, {
          floatingElements: []
        })
      );

      const { result: result2 } = renderHook(() =>
        useMapCenter(40.7128, -74.0060, undefined, undefined, {
          floatingElements: [{ height: 50, position: 'top' }]
        })
      );

      // Floating elements should affect the delta calculation
      expect(result1.current?.latitudeDelta).not.toBe(result2.current?.latitudeDelta);
    });

    test('respects side offset', () => {
      const { result: result1 } = renderHook(() =>
        useMapCenter(40.7128, -74.0060, undefined, undefined, { sideOffset: 10 })
      );

      const { result: result2 } = renderHook(() =>
        useMapCenter(40.7128, -74.0060, undefined, undefined, { sideOffset: 50 })
      );

      // Different side offsets should result in different longitude deltas
      expect(result1.current?.longitudeDelta).not.toBe(result2.current?.longitudeDelta);
    });
  });

  describe('Memoization', () => {
    test('returns same reference for same inputs', () => {
      const { result, rerender } = renderHook(
        (props: { lat: number; lng: number }) => useMapCenter(props.lat, props.lng),
        { initialProps: { lat: 40.7128, lng: -74.0060 } }
      );

      const firstResult = result.current;

      rerender({ lat: 40.7128, lng: -74.0060 });

      expect(result.current).toBe(firstResult); // Same reference due to memoization
    });

    test('returns new reference when inputs change', () => {
      const { result, rerender } = renderHook(
        (props: { lat: number; lng: number }) => useMapCenter(props.lat, props.lng),
        { initialProps: { lat: 40.7128, lng: -74.0060 } }
      );

      const firstResult = result.current;

      rerender({ lat: 40.7589, lng: -73.9851 });

      expect(result.current).not.toBe(firstResult); // New reference due to input change
    });
  });

  describe('Edge Cases', () => {
    test('handles zero coordinates', () => {
      const { result } = renderHook(() =>
        useMapCenter(0, 0)
      );

      expect(result.current).toEqual({
        latitude: 0,
        longitude: 0,
        latitudeDelta: expect.any(Number),
        longitudeDelta: expect.any(Number),
      });
    });

    test('handles extreme coordinates', () => {
      const { result } = renderHook(() =>
        useMapCenter(90, 180)
      );

      expect(result.current).toEqual({
        latitude: 90,
        longitude: 180,
        latitudeDelta: expect.any(Number),
        longitudeDelta: expect.any(Number),
      });
    });

    test('handles same user and destination coordinates', () => {
      const { result } = renderHook(() =>
        useMapCenter(40.7128, -74.0060, 40.7128, -74.0060)
      );

      expect(result.current).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        latitudeDelta: expect.any(Number),
        longitudeDelta: expect.any(Number),
      });
    });
  });

  describe('Performance', () => {
    test('calculates reasonable deltas', () => {
      const { result } = renderHook(() =>
        useMapCenter(40.7128, -74.0060)
      );

      const { latitudeDelta, longitudeDelta } = result.current!;

      // Deltas should be reasonable for map display
      expect(latitudeDelta).toBeGreaterThan(0);
      expect(latitudeDelta).toBeLessThan(1); // Not too zoomed out
      expect(longitudeDelta).toBeGreaterThan(0);
      expect(longitudeDelta).toBeLessThan(1);
    });

    test('minimum delta of 0.01', () => {
      const { result } = renderHook(() =>
        useMapCenter(40.7128, -74.0060, 40.7129, -74.0061) // Very close points
      );

      const { latitudeDelta, longitudeDelta } = result.current!;

      expect(latitudeDelta).toBeGreaterThanOrEqual(0.01);
      expect(longitudeDelta).toBeGreaterThanOrEqual(0.01);
    });
  });
});

describe('useBusinessMapCenter', () => {
  test('uses business-specific configuration', () => {
    const { result } = renderHook(() =>
      useBusinessMapCenter(40.7128, -74.0060, 40.7589, -73.9851)
    );

    expect(result.current).toBeTruthy();
    expect(result.current?.latitude).toBeDefined();
    expect(result.current?.longitude).toBeDefined();
  });

  test('returns null when business location not provided', () => {
    const { result } = renderHook(() =>
      useBusinessMapCenter(null, null)
    );

    expect(result.current).toBeNull();
  });
});

describe('useDriverMapCenter', () => {
  test('uses driver-specific configuration', () => {
    const { result } = renderHook(() =>
      useDriverMapCenter(40.7128, -74.0060, 40.7589, -73.9851)
    );

    expect(result.current).toBeTruthy();
    expect(result.current?.latitude).toBeDefined();
    expect(result.current?.longitude).toBeDefined();
  });

  test('prioritizes pickup location over driver location', () => {
    const { result } = renderHook(() =>
      useDriverMapCenter(40.7128, -74.0060, 40.7589, -73.9851)
    );

    // When only pickup is provided (no delivery), should center on pickup
    expect(result.current?.latitude).toBe(40.7589); // Pickup latitude
    expect(result.current?.longitude).toBe(-73.9851); // Pickup longitude
  });

  test('falls back to driver location when no pickup', () => {
    const { result } = renderHook(() =>
      useDriverMapCenter(40.7128, -74.0060)
    );

    expect(result.current?.latitude).toBe(40.7128);
    expect(result.current?.longitude).toBe(-74.0060);
  });

  test('handles complex routing with pickup and delivery', () => {
    const { result } = renderHook(() =>
      useDriverMapCenter(
        40.7128, -74.0060, // Driver
        40.7589, -73.9851, // Pickup
        40.7505, -73.9934  // Delivery
      )
    );

    expect(result.current).toBeTruthy();
    // Should calculate center between pickup and delivery
    const expectedLat = (40.7589 + 40.7505) / 2;
    const expectedLng = (-73.9851 + -73.9934) / 2;
    expect(result.current?.latitude).toBe(expectedLat);
    expect(result.current?.longitude).toBe(expectedLng);
  });
});

