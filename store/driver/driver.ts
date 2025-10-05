import { create } from "zustand";
import { MarkerData, DriverStore } from "@/types/type";

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number | null) => {
    set(() => ({ selectedDriver: driverId }));
  },
  setDrivers: (drivers: MarkerData[]) => {
    set(() => ({ drivers }));
  },
  clearSelectedDriver: () => {
    set(() => ({ selectedDriver: null }));
  },
}));
