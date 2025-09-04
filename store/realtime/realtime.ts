import { create } from "zustand";
import { ConnectionStatus, Ride, RideStatus, LocationData } from "@/types/type";

// Real-time Store Interface
interface RealtimeStore {
  connectionStatus: ConnectionStatus;
  activeRide: Ride | null;
  driverLocation: LocationData | null;
  rideStatus: RideStatus;
  isTracking: boolean;

  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateRideStatus: (rideId: number, status: RideStatus) => void;
  updateDriverLocation: (location: LocationData) => void;
  startTracking: (rideId: number) => void;
  stopTracking: () => void;
  setActiveRide: (ride: Ride | null) => void;
}

export const useRealtimeStore = create<RealtimeStore>((set, get) => ({
  connectionStatus: {
    isConnected: false,
    connectionType: "none",
    websocketConnected: false,
    lastPing: new Date(),
  },
  activeRide: null,
  driverLocation: null,
  rideStatus: "requested",
  isTracking: false,

  setConnectionStatus: (status: ConnectionStatus) => {
    set(() => ({ connectionStatus: status }));
  },

  updateRideStatus: (rideId: number, status: RideStatus) => {
    set((state) => ({
      rideStatus: status,
      // Update active ride if it matches
      activeRide:
        state.activeRide?.ride_id === rideId
          ? { ...state.activeRide, status }
          : state.activeRide,
    }));
  },

  updateDriverLocation: (location: LocationData) => {
    set(() => ({ driverLocation: location }));
  },

  startTracking: (rideId: number) => {
    set(() => ({ isTracking: true }));
  },

  stopTracking: () => {
    set(() => ({
      isTracking: false,
      driverLocation: null,
    }));
  },

  setActiveRide: (ride: Ride | null) => {
    set(() => ({ activeRide: ride }));
  },
}));
