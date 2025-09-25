import * as Location from "expo-location";
import { driverTransportService } from "./driverTransportService";
import { useDriverStateStore } from "@/store/driverState/driverState";
import { useLocationStore } from "@/store/location/location";
import { useRealtimeStore } from "@/store";

// Location service for drivers
export class DriverLocationService {
  private static instance: DriverLocationService;
  private watchId: Location.LocationSubscription | null = null;
  private isTracking = false;
  private currentRideId: number | null = null;
  private lastLocation: Location.LocationObject | null = null;
  private locationUpdateInterval = 5000; // 5 seconds
  private minDistanceChange = 10; // 10 meters minimum distance change
  private locationTimeout: NodeJS.Timeout | null = null;

  static getInstance(): DriverLocationService {
    if (!DriverLocationService.instance) {
      DriverLocationService.instance = new DriverLocationService();
    }
    return DriverLocationService.instance;
  }

  /**
   * Start tracking location for a specific ride
   */
  // Start tracking for available drivers (no active ride)
  async startAvailabilityTracking(): Promise<void> {
    console.log("[DriverLocationService] 🚀 Starting availability tracking (no ride)");

    if (this.isTracking) {
      console.log("[DriverLocationService] Already tracking, stopping first");
      await this.stopTracking();
    }

    this.currentRideId = null; // No ride ID for availability tracking
    this.isTracking = true;

    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission denied");
      }

      console.log("[DriverLocationService] ✅ Location permissions granted for availability tracking");

      // Start watching position
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 seconds for availability (less frequent than active rides)
          distanceInterval: 10, // 10 meters
        },
        async (location) => {
          try {
            // Update local stores
            useDriverStateStore.getState().updateLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              accuracy: location.coords.accuracy || 0,
            });

            // Update location store for polling and other components
            useLocationStore.getState().setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              address: "", // Address will be resolved separately if needed
            });

            // Send to backend - general driver location update for matching
            console.log("[DriverLocationService] 📍 Updating availability location:", {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              accuracy: location.coords.accuracy,
            });

            await driverTransportService.updateDriverLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              accuracy: location.coords.accuracy || 0,
              speed: location.coords.speed || 0,
            });

            console.log("[DriverLocationService] ✅ Availability location updated");
          } catch (error) {
            console.error("[DriverLocationService] ❌ Error updating availability location:", error);
          }
        },
      );

      console.log("[DriverLocationService] ✅ Availability tracking started");
    } catch (error) {
      console.error("[DriverLocationService] ❌ Error starting availability tracking:", error);
      this.isTracking = false;
      throw error;
    }
  }

  async startTracking(rideId: number): Promise<void> {
    if (this.isTracking) {
      console.log("[DriverLocationService] Already tracking, stopping first");
      await this.stopTracking();
    }

    console.log(
      "[DriverLocationService] Starting location tracking for ride:",
      rideId,
    );

    this.currentRideId = rideId;
    this.isTracking = true;

    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission denied");
      }

      // Configure location options for better accuracy during rides
      const locationOptions: Location.LocationOptions = {
        accuracy: Location.Accuracy.High,
        timeInterval: this.locationUpdateInterval,
        distanceInterval: this.minDistanceChange,
        mayShowUserSettingsDialog: true,
      };

      // Start watching position
      this.watchId = await Location.watchPositionAsync(
        locationOptions,
        this.handleLocationUpdate.bind(this),
      );

      // Update driver state
      useDriverStateStore.getState().setAvailable(true);

      console.log(
        "[DriverLocationService] Location tracking started successfully",
      );
    } catch (error) {
      console.error(
        "[DriverLocationService] Failed to start location tracking:",
        error,
      );
      this.isTracking = false;
      throw error;
    }
  }

  /**
   * Stop tracking location
   */
  async stopTracking(): Promise<void> {
    console.log("[DriverLocationService] Stopping location tracking");

    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }

    if (this.locationTimeout) {
      clearTimeout(this.locationTimeout);
      this.locationTimeout = null;
    }

    this.isTracking = false;
    this.currentRideId = null;
    this.lastLocation = null;

    // Update driver state
    useDriverStateStore.getState().setAvailable(false);

    console.log("[DriverLocationService] Location tracking stopped");
  }

  /**
   * Handle location updates
   */
  private async handleLocationUpdate(
    location: Location.LocationObject,
  ): Promise<void> {
    if (!this.isTracking || !this.currentRideId) {
      return;
    }

    try {
      // Check if location has changed significantly
      const shouldUpdate = this.shouldUpdateLocation(location);

      if (shouldUpdate) {
        this.lastLocation = location;

        // Update local store
        useDriverStateStore.getState().updateLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy || 0,
        });

        // Send to backend - use appropriate endpoint based on ride status
        console.log("[DriverLocationService] 🔄 Processing location update:", {
          hasRide: !!this.currentRideId,
          currentRideId: this.currentRideId,
          location: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy,
            speed: location.coords.speed,
          },
          timestamp: new Date().toISOString()
        });

        if (this.currentRideId) {
          // During active ride - use ride-specific location update
          console.log("[DriverLocationService] 🚗 Updating location for active ride:", this.currentRideId);
          await driverTransportService.updateLocation(this.currentRideId, {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            speed: location.coords.speed || 0,
          });
          console.log("[DriverLocationService] ✅ Ride location update completed for ride:", this.currentRideId);
        } else {
          // No active ride - use general driver location update for matching
          console.log("[DriverLocationService] 🚖 Updating general driver location for matching");
          await driverTransportService.updateDriverLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            speed: location.coords.speed || 0,
          });
          console.log("[DriverLocationService] ✅ General driver location update completed");
        }

        console.log("[DriverLocationService] 📍 Location update cycle completed:", {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy,
          speed: location.coords.speed,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("[DriverLocationService] Error updating location:", error);
      // Continue tracking even if one update fails
    }
  }

  /**
   * Check if location should be updated based on distance and time
   */
  private shouldUpdateLocation(newLocation: Location.LocationObject): boolean {
    if (!this.lastLocation) {
      return true; // Always update first location
    }

    // Calculate distance
    const distance = this.calculateDistance(
      this.lastLocation.coords.latitude,
      this.lastLocation.coords.longitude,
      newLocation.coords.latitude,
      newLocation.coords.longitude,
    );

    // Update if distance changed significantly or enough time has passed
    const timeDiff = newLocation.timestamp - this.lastLocation.timestamp;
    const shouldUpdateByDistance = distance >= this.minDistanceChange;
    const shouldUpdateByTime = timeDiff >= this.locationUpdateInterval;

    return shouldUpdateByDistance || shouldUpdateByTime;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Get current location (one-time)
   */
  async getCurrentLocation(): Promise<Location.LocationObject> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission denied");
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return location;
  }

  /**
   * Update driver availability status
   */
  async updateAvailability(available: boolean): Promise<void> {
    console.log("[DriverLocationService] Updating availability:", available);

    const driverState = useDriverStateStore.getState();

    if (available) {
      // When going online, get current location and send to backend for matching
      const location = await this.getCurrentLocation();

      // Update local state
      driverState.updateLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
      });

      // Send initial location to backend for driver matching
      await driverTransportService.updateDriverLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        speed: location.coords.speed || 0,
      });

      console.log("[DriverLocationService] Initial location sent for matching:", {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    }

    driverState.setAvailable(available);
  }

  /**
   * Get tracking status
   */
  getTrackingStatus(): {
    isTracking: boolean;
    currentRideId: number | null;
    hasLocation: boolean;
    lastLocation: Location.LocationObject | null;
  } {
    return {
      isTracking: this.isTracking,
      currentRideId: this.currentRideId,
      hasLocation: !!this.lastLocation,
      lastLocation: this.lastLocation,
    };
  }

  /**
   * Emergency location sharing
   */
  async shareEmergencyLocation(): Promise<Location.LocationObject> {
    console.log("[DriverLocationService] Sharing emergency location");

    const location = await this.getCurrentLocation();

    // Update store with emergency flag
    useDriverStateStore.getState().updateLocation({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy || 0,
    });

    return location;
  }

  /**
   * Cleanup on app close
   */
  cleanup(): void {
    console.log("[DriverLocationService] Cleaning up");
    this.stopTracking();
  }
}

// Export singleton instance
export const driverLocationService = DriverLocationService.getInstance();
