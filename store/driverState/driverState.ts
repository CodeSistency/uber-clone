import { create } from "zustand";
import { persist } from "zustand/middleware";

// Driver state interface
interface DriverState {
  // Estado del conductor
  isDriver: boolean;
  status: "online" | "offline" | "busy";
  verificationStatus: "pending" | "approved" | "rejected";

  // Información del conductor
  driverId: number | null;
  firstName: string;
  lastName: string;
  email: string;

  // Ubicación
  currentLocation: {
    lat: number;
    lng: number;
    accuracy: number;
    lastUpdate: Date;
    isActive: boolean;
  } | null;

  // Estado de disponibilidad
  isAvailable: boolean;
  autoAcceptEnabled: boolean;
  autoAcceptRadius: number; // en km

  // Estadísticas rápidas
  todayRides: number;
  todayEarnings: number;
  weeklyRides: number;
  weeklyEarnings: number;

  // Estado de carga
  isLoading: boolean;
  error: string | null;
}

// Driver state store interface
interface DriverStateStore extends DriverState {
  // Actions
  setDriver: (driver: Partial<DriverState>) => void;
  updateStatus: (status: "online" | "offline" | "busy") => void;
  updateLocation: (location: {
    lat: number;
    lng: number;
    accuracy: number;
  }) => void;
  setAvailable: (available: boolean) => void;
  setAutoAccept: (enabled: boolean, radius?: number) => void;
  updateStats: (stats: {
    rides: number;
    earnings: number;
    period: "today" | "week";
  }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Helpers
  isOnline: () => boolean;
  canReceiveRides: () => boolean;
  getFullName: () => string;
}

const initialState: DriverState = {
  isDriver: false,
  status: "offline",
  verificationStatus: "pending",
  driverId: null,
  firstName: "",
  lastName: "",
  email: "",
  currentLocation: null,
  isAvailable: false,
  autoAcceptEnabled: false,
  autoAcceptRadius: 5,
  todayRides: 0,
  todayEarnings: 0,
  weeklyRides: 0,
  weeklyEarnings: 0,
  isLoading: false,
  error: null,
};

export const useDriverStateStore = create<DriverStateStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setDriver: (driver) => {
        
        set((state) => ({
          ...state,
          ...driver,
          error: null,
        }));
      },

      updateStatus: (status) => {
        
        set((state) => ({
          ...state,
          status,
          isAvailable: status === "online",
          error: null,
        }));
      },

      updateLocation: (location) => {
        const locationData = {
          ...location,
          lastUpdate: new Date(),
          isActive: true,
        };
        
        set((state) => ({
          ...state,
          currentLocation: locationData,
          error: null,
        }));
      },

      setAvailable: (available) => {
        
        set((state) => ({
          ...state,
          isAvailable: available,
          status: available ? "online" : "offline",
        }));
      },

      setAutoAccept: (enabled, radius) => {
        
        set((state) => ({
          ...state,
          autoAcceptEnabled: enabled,
          autoAcceptRadius: radius ?? state.autoAcceptRadius,
        }));
      },

      updateStats: (stats) => {
        
        set((state) => ({
          ...state,
          ...(stats.period === "today"
            ? { todayRides: stats.rides, todayEarnings: stats.earnings }
            : { weeklyRides: stats.rides, weeklyEarnings: stats.earnings }),
        }));
      },

      setLoading: (loading) => {
        set((state) => ({ ...state, isLoading: loading }));
      },

      setError: (error) => {
        
        set((state) => ({ ...state, error }));
      },

      reset: () => {
        
        set(initialState);
      },

      // Helpers
      isOnline: () => get().status === "online",

      canReceiveRides: () => {
        const state = get();
        return (
          state.isDriver &&
          state.status === "online" &&
          state.verificationStatus === "approved" &&
          state.isAvailable
        );
      },

      getFullName: () => {
        const state = get();
        return state.firstName && state.lastName
          ? `${state.firstName} ${state.lastName}`
          : "Conductor";
      },
    }),
    {
      name: "driver-state-storage",
      // Solo persistir datos no sensibles
      partialize: (state) => ({
        isDriver: state.isDriver,
        status: state.status,
        verificationStatus: state.verificationStatus,
        driverId: state.driverId,
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        isAvailable: state.isAvailable,
        autoAcceptEnabled: state.autoAcceptEnabled,
        autoAcceptRadius: state.autoAcceptRadius,
        todayRides: state.todayRides,
        todayEarnings: state.todayEarnings,
        weeklyRides: state.weeklyRides,
        weeklyEarnings: state.weeklyEarnings,
      }),
    },
  ),
);
