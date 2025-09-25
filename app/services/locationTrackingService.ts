import { useRealtimeStore, useLocationStore } from "@/store";

class LocationTrackingService {
  private static instance: LocationTrackingService;
  private watchId: any = null;
  private intervalId: any = null;
  private currentRideId: number | null = null;
  private websocketUpdateCallback?: (rideId: number, location: any) => void;

  static getInstance(): LocationTrackingService {
    if (!LocationTrackingService.instance) {
      LocationTrackingService.instance = new LocationTrackingService();
    }
    return LocationTrackingService.instance;
  }

  setWebSocketUpdateCallback(
    callback: (rideId: number, location: any) => void,
  ) {
    this.websocketUpdateCallback = callback;
  }

  async start(rideId: number) {
    console.log("[LocationTrackingService] 🚀 Starting location tracking:", {
      rideId,
      previousRideId: this.currentRideId,
      timestamp: new Date().toISOString()
    });

    this.currentRideId = rideId;

    // Try to use expo-location if available, else fallback to store-based interval
    try {
      const ExpoLocation = require("expo-location");
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("[LocationTrackingService] ⚠️ Permission not granted, using fallback");
        this.startFallbackInterval();
        return;
      }
      console.log("[LocationTrackingService] ✅ GPS permissions granted, using high-accuracy tracking");
      // Start watching position
      this.watchId = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (position: any) => {
          try {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            console.log("[LocationTrackingService] 📍 GPS position update:", {
              latitude: lat,
              longitude: lng,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              rideId: this.currentRideId,
              timestamp: new Date().toISOString()
            });

            // Update realtime store
            useRealtimeStore.getState().updateDriverLocation({
              latitude: lat,
              longitude: lng,
              timestamp: new Date(),
            } as any);

            // Use callback to update websocket if available
            if (this.websocketUpdateCallback && this.currentRideId) {
              console.log("[LocationTrackingService] 🌐 Sending WebSocket location update");
              this.websocketUpdateCallback(this.currentRideId, {
                latitude: lat,
                longitude: lng,
                timestamp: new Date(),
              } as any);
            } else {
              console.log("[LocationTrackingService] ⚠️ No WebSocket callback or rideId available");
            }
          } catch (error) {
            console.error("[LocationTrackingService] ❌ Error in GPS position callback:", error);
          }
        },
      );
    } catch (e) {
      console.warn(
        "[LocationTracking] expo-location not available, fallback interval",
      );
      this.startFallbackInterval();
    }
  }

  private startFallbackInterval() {
    console.log("[LocationTrackingService] 🔄 Starting fallback interval tracking");
    this.stop();
    this.intervalId = setInterval(() => {
      try {
        const { userLatitude, userLongitude } = useLocationStore.getState();
        const rideId =
          this.currentRideId ||
          (useRealtimeStore.getState().activeRide as any)?.ride_id ||
          0;

        console.log("[LocationTrackingService] ⏰ Fallback interval tick:", {
          rideId,
          userLatitude,
          userLongitude,
          hasValidLocation: !!(rideId && userLatitude && userLongitude),
          timestamp: new Date().toISOString()
        });

        if (rideId && userLatitude && userLongitude) {
          // Update realtime store
          useRealtimeStore.getState().updateDriverLocation({
            latitude: userLatitude,
            longitude: userLongitude,
            timestamp: new Date(),
          } as any);

          // Use callback to update websocket if available
          if (this.websocketUpdateCallback) {
            console.log("[LocationTrackingService] 🌐 Sending WebSocket location update (fallback)");
            this.websocketUpdateCallback(rideId, {
              latitude: userLatitude,
              longitude: userLongitude,
              timestamp: new Date(),
            } as any);
          }
        } else {
          console.log("[LocationTrackingService] ⚠️ Skipping fallback update - invalid data");
        }
      } catch (error) {
        console.error("[LocationTrackingService] ❌ Error in fallback interval:", error);
      }
    }, 5000);
  }

  stop() {
    console.log("[LocationTrackingService] 🛑 Stopping location tracking:", {
      hadWatchId: !!this.watchId,
      hadIntervalId: !!this.intervalId,
      currentRideId: this.currentRideId,
      timestamp: new Date().toISOString()
    });

    try {
      if (this.watchId && this.watchId.remove) {
        console.log("[LocationTrackingService] 🗑️ Removing GPS watch");
        this.watchId.remove();
      }
    } catch (error) {
      console.error("[LocationTrackingService] ❌ Error removing GPS watch:", error);
    }

    this.watchId = null;

    if (this.intervalId) {
      console.log("[LocationTrackingService] 🗑️ Clearing fallback interval");
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.currentRideId = null;
    console.log("[LocationTrackingService] ✅ Location tracking stopped");
  }
}

export const locationTrackingService = LocationTrackingService.getInstance();
