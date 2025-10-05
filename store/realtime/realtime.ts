import { create } from "zustand";
import { ConnectionStatus, LocationData } from "@/types/type";
import { ExtendedConnectionStatus } from "@/lib/connectivity";
import { 
  type ExtendedRide, 
  type RideStatus as ExtendedRideStatus, 
  type RideWithPassenger,
  type RideWithDriver,
  type RideWithBoth,
  isExtendedRide,
  hasPassenger,
  hasDriver
} from "@/types/ride";

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
  activeRide: ExtendedRide | null; // ✅ Type-safe ride
  driverLocation: LocationData | null;
  rideStatus: ExtendedRideStatus; // ✅ Type-safe status
  isTracking: boolean;
  simulationEnabled: boolean;
  rideSummary: RideSummary | null;

  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateRideStatus: (rideId: number, status: ExtendedRideStatus) => void; // ✅ Type-safe
  updateDriverLocation: (location: LocationData) => void;
  startTracking: (rideId: number) => void;
  stopTracking: () => void;
  setActiveRide: (ride: ExtendedRide | null) => void; // ✅ Type-safe
  setSimulationEnabled: (enabled: boolean) => void;
  setRideSummary: (summary: RideSummary) => void;
}

export const useRealtimeStore = create<RealtimeStore>((set, get) => ({
  connectionStatus: {
    isConnected: false,
    connectionType: "none",
    connectionSpeed: 0,
    isInternetReachable: false,
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

  updateRideStatus: (rideId: number, status: ExtendedRideStatus) => { // ✅ Type-safe
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

  setActiveRide: (ride: ExtendedRide | null) => { // ✅ Type-safe
    set(() => ({ activeRide: ride }));
  },

  setSimulationEnabled: (enabled: boolean) => {
    set(() => ({ simulationEnabled: enabled }));
  },

  setRideSummary: (summary: RideSummary) => {
    set(() => ({ rideSummary: summary }));
  },
}));
