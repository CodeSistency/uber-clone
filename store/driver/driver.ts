import { create } from "zustand";
import { MarkerData, DriverStore } from "@/types/type";

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number | null) => {
    console.log("[DriverStore] setSelectedDriver called with:", driverId);
    const newState = { selectedDriver: driverId };
    console.log("[DriverStore] Setting new state:", newState);
    set(() => newState);
    console.log("[DriverStore] State updated successfully");
  },
  setDrivers: (drivers: MarkerData[]) => {
    console.log(
      "[DriverStore] setDrivers called with:",
      drivers?.length,
      "drivers",
    );
    set(() => ({ drivers }));
  },
  clearSelectedDriver: () => {
    console.log("[DriverStore] clearSelectedDriver called");
    set(() => ({ selectedDriver: null }));
  },
}));
