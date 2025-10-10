import { MarkerGenerator } from '@/lib/map/markerGenerator';
import type { Driver } from '@/types/driver';
import type { Coordinates } from '@/types/map';

describe('MarkerGenerator', () => {
  const mockDrivers: Driver[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      profileImageUrl: 'https://example.com/john.jpg',
      carImageUrl: 'https://example.com/car1.jpg',
      carSeats: 4,
      rating: 4.8,
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      profileImageUrl: 'https://example.com/jane.jpg',
      carImageUrl: 'https://example.com/car2.jpg',
      carSeats: 6,
      rating: 4.9,
    },
  ];

  const mockUserLocation: Coordinates = {
    latitude: 40.7128,
    longitude: -74.006,
  };

  describe('generateDriverMarkers', () => {
    it('should generate markers for all drivers', () => {
      const markers = MarkerGenerator.generateDriverMarkers(mockDrivers, mockUserLocation);

      expect(markers).toHaveLength(2);
      expect(markers[0].type).toBe('driver');
      expect(markers[1].type).toBe('driver');
    });

    it('should set correct driver IDs', () => {
      const markers = MarkerGenerator.generateDriverMarkers(mockDrivers, mockUserLocation);

      expect(markers[0].driverId).toBe(1);
      expect(markers[1].driverId).toBe(2);
    });

    it('should set correct titles', () => {
      const markers = MarkerGenerator.generateDriverMarkers(mockDrivers, mockUserLocation);

      expect(markers[0].title).toBe('John Doe');
      expect(markers[1].title).toBe('Jane Smith');
    });

    it('should set correct descriptions', () => {
      const markers = MarkerGenerator.generateDriverMarkers(mockDrivers, mockUserLocation);

      expect(markers[0].description).toBe('Rating: 4.8 • 4 seats');
      expect(markers[1].description).toBe('Rating: 4.9 • 6 seats');
    });

    it('should preserve driver data', () => {
      const markers = MarkerGenerator.generateDriverMarkers(mockDrivers, mockUserLocation);

      expect(markers[0].firstName).toBe('John');
      expect(markers[0].lastName).toBe('Doe');
      expect(markers[0].profileImageUrl).toBe('https://example.com/john.jpg');
      expect(markers[0].carImageUrl).toBe('https://example.com/car1.jpg');
      expect(markers[0].carSeats).toBe(4);
      expect(markers[0].rating).toBe(4.8);

      expect(markers[1].firstName).toBe('Jane');
      expect(markers[1].lastName).toBe('Smith');
      expect(markers[1].profileImageUrl).toBe('https://example.com/jane.jpg');
      expect(markers[1].carImageUrl).toBe('https://example.com/car2.jpg');
      expect(markers[1].carSeats).toBe(6);
      expect(markers[1].rating).toBe(4.9);
    });

    it('should generate coordinates near user location', () => {
      const markers = MarkerGenerator.generateDriverMarkers(mockDrivers, mockUserLocation);

      // Check that coordinates are within reasonable range of user location
      markers.forEach(marker => {
        expect(Math.abs(marker.latitude - mockUserLocation.latitude)).toBeLessThan(0.01);
        expect(Math.abs(marker.longitude - mockUserLocation.longitude)).toBeLessThan(0.01);
      });
    });

    it('should generate different coordinates for each marker', () => {
      const markers = MarkerGenerator.generateDriverMarkers(mockDrivers, mockUserLocation);

      // Coordinates should be different (though they might be very close)
      const coords1 = { lat: markers[0].latitude, lng: markers[0].longitude };
      const coords2 = { lat: markers[1].latitude, lng: markers[1].longitude };

      // They should be different (though might be very close due to random offset)
      const isDifferent = coords1.lat !== coords2.lat || coords1.lng !== coords2.lng;
      expect(isDifferent).toBe(true);
    });

    it('should handle empty drivers array', () => {
      const markers = MarkerGenerator.generateDriverMarkers([], mockUserLocation);

      expect(markers).toHaveLength(0);
    });

    it('should handle single driver', () => {
      const singleDriver = [mockDrivers[0]];
      const markers = MarkerGenerator.generateDriverMarkers(singleDriver, mockUserLocation);

      expect(markers).toHaveLength(1);
      expect(markers[0].driverId).toBe(1);
      expect(markers[0].title).toBe('John Doe');
    });
  });
});
