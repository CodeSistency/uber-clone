import { create } from "zustand";

import { DriverStore, LocationStore, MarkerData } from "@/types/type";

export const useLocationStore = create<LocationStore>((set) => ({
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
    console.log("[LocationStore] 📍 setUserLocation called with:", {
      latitude,
      longitude,
      address,
    });

    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));

    console.log("[LocationStore] ✅ User location updated in store");

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) {
      console.log("[LocationStore] 🔄 Clearing selected driver due to location change");
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
    console.log("[LocationStore] 🎯 setDestinationLocation called with:", {
      latitude,
      longitude,
      address,
    });

    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));

    console.log("[LocationStore] ✅ Destination location updated in store");

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) {
      console.log("[LocationStore] 🔄 Clearing selected driver due to location change");
      clearSelectedDriver();
    }
  },
}));

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) => {
    console.log("[DriverStore] setSelectedDriver called with:", driverId);
    const newState = { selectedDriver: driverId };
    console.log("[DriverStore] Setting new state:", newState);
    set(() => newState);
    console.log("[DriverStore] State updated successfully");
  },
  setDrivers: (drivers: MarkerData[]) => {
    console.log("[DriverStore] setDrivers called with:", drivers?.length, "drivers");
    set(() => ({ drivers }));
  },
  clearSelectedDriver: () => {
    console.log("[DriverStore] clearSelectedDriver called");
    set(() => ({ selectedDriver: null }));
  },
}));
