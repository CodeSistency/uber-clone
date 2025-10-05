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
    

    this.currentRideId = rideId;

    // Try to use expo-location if available, else fallback to store-based interval
    try {
      const ExpoLocation = require("expo-location");
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        
        this.startFallbackInterval();
        return;
      }
      
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

            

            // Update realtime store
            useRealtimeStore.getState().updateDriverLocation({
              latitude: lat,
              longitude: lng,
              timestamp: new Date(),
            } as any);

            // Use callback to update websocket if available
            if (this.websocketUpdateCallback && this.currentRideId) {
              
              this.websocketUpdateCallback(this.currentRideId, {
                latitude: lat,
                longitude: lng,
                timestamp: new Date(),
              } as any);
            } else {
              
            }
          } catch (error) {
            
          }
        },
      );
    } catch (e) {
      
      this.startFallbackInterval();
    }
  }

  private startFallbackInterval() {
    
    this.stop();
    this.intervalId = setInterval(() => {
      try {
        const { userLatitude, userLongitude } = useLocationStore.getState();
        const rideId =
          this.currentRideId ||
          (useRealtimeStore.getState().activeRide as any)?.ride_id ||
          0;

        

        if (rideId && userLatitude && userLongitude) {
          // Update realtime store
          useRealtimeStore.getState().updateDriverLocation({
            latitude: userLatitude,
            longitude: userLongitude,
            timestamp: new Date(),
          } as any);

          // Use callback to update websocket if available
          if (this.websocketUpdateCallback) {
            
            this.websocketUpdateCallback(rideId, {
              latitude: userLatitude,
              longitude: userLongitude,
              timestamp: new Date(),
            } as any);
          }
        } else {
          
        }
      } catch (error) {
        
      }
    }, 5000);
  }

  stop() {
    

    try {
      if (this.watchId && this.watchId.remove) {
        
        this.watchId.remove();
      }
    } catch (error) {
      
    }

    this.watchId = null;

    if (this.intervalId) {
      
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.currentRideId = null;
    
  }
}

export const locationTrackingService = LocationTrackingService.getInstance();
