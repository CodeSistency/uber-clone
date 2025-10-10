import type { Driver } from '@/types/driver';
import type { DriverMarker, Coordinates } from '@/types/map';

export class MarkerGenerator {
  /**
   * Genera marcadores de conductores con offsets aleatorios
   */
  static generateDriverMarkers(
    drivers: Driver[],
    userLocation: Coordinates
  ): DriverMarker[] {
    return drivers.map((driver, index) => ({
      type: 'driver',
      id: driver.id,
      driverId: driver.id,
      latitude: userLocation.latitude + this.getRandomOffset(),
      longitude: userLocation.longitude + this.getRandomOffset(),
      title: `${driver.firstName} ${driver.lastName}`,
      description: `Rating: ${driver.rating} • ${driver.carSeats} seats`,
      firstName: driver.firstName,
      lastName: driver.lastName,
      profileImageUrl: driver.profileImageUrl,
      carImageUrl: driver.carImageUrl,
      carSeats: driver.carSeats,
      rating: driver.rating,
    }));
  }

  private static getRandomOffset(): number {
    return (Math.random() - 0.5) * 0.01; // ±0.005 degrees
  }
}
