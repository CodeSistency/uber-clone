import { create } from "zustand";
import { useDriverStore } from "../driver";

export const useLocationStore = create<{
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) {
      clearSelectedDriver();
    }
  },

  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) {
      clearSelectedDriver();
    }
  },
}));

// ===== OPTIMIZED SELECTORS =====
// These selectors prevent unnecessary re-renders by only returning the specific data that components need

export const useUserLocation = () =>
  useLocationStore((state) => ({
    latitude: state.userLatitude,
    longitude: state.userLongitude,
    address: state.userAddress,
  }));

export const useUserCoordinates = () =>
  useLocationStore((state) => ({
    latitude: state.userLatitude,
    longitude: state.userLongitude,
  }));

export const useUserAddress = () =>
  useLocationStore((state) => state.userAddress);

export const useDestinationLocation = () =>
  useLocationStore((state) => ({
    latitude: state.destinationLatitude,
    longitude: state.destinationLongitude,
    address: state.destinationAddress,
  }));

export const useDestinationCoordinates = () =>
  useLocationStore((state) => ({
    latitude: state.destinationLatitude,
    longitude: state.destinationLongitude,
  }));

export const useDestinationAddress = () =>
  useLocationStore((state) => state.destinationAddress);

export const useHasUserLocation = () =>
  useLocationStore(
    (state) => state.userLatitude !== null && state.userLongitude !== null,
  );

export const useHasDestinationLocation = () =>
  useLocationStore(
    (state) =>
      state.destinationLatitude !== null && state.destinationLongitude !== null,
  );

export const useHasCompleteRoute = () =>
  useLocationStore(
    (state) =>
      state.userLatitude !== null &&
      state.userLongitude !== null &&
      state.destinationLatitude !== null &&
      state.destinationLongitude !== null,
  );

export const useRouteCoordinates = () =>
  useLocationStore((state) => ({
    origin: {
      latitude: state.userLatitude,
      longitude: state.userLongitude,
    },
    destination: {
      latitude: state.destinationLatitude,
      longitude: state.destinationLongitude,
    },
  }));

// Action selectors
export const useLocationActions = () =>
  useLocationStore((state) => ({
    setUserLocation: state.setUserLocation,
    setDestinationLocation: state.setDestinationLocation,
  }));
