import { create } from "zustand";
import { ConnectionStatus, Ride, RideStatus, LocationData } from "@/types/type";

// Ride Summary Interface
interface RideSummary {
  rideId: number;
  driverId: number;
  driverName: string;
  fare: number;
  distance: number;
  duration: number;
  completedAt: Date;
}

// Real-time Store Interface
interface RealtimeStore {
  connectionStatus: ConnectionStatus;
  activeRide: Ride | null;
  driverLocation: LocationData | null;
  rideStatus: RideStatus;
  isTracking: boolean;
  simulationEnabled: boolean;
  rideSummary: RideSummary | null;

  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateRideStatus: (rideId: number, status: RideStatus) => void;
  updateDriverLocation: (location: LocationData) => void;
  startTracking: (rideId: number) => void;
  stopTracking: () => void;
  setActiveRide: (ride: Ride | null) => void;
  setSimulationEnabled: (enabled: boolean) => void;
  setRideSummary: (summary: RideSummary) => void;
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
  simulationEnabled: true,
  rideSummary: null,

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

  setSimulationEnabled: (enabled: boolean) => {
    set(() => ({ simulationEnabled: enabled }));
  },

  setRideSummary: (summary: RideSummary) => {
    set(() => ({ rideSummary: summary }));
  },
}));
