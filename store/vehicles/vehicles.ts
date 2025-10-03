import { create } from "zustand";
import type {
  Vehicle,
  CreateVehicleRequest,
  UpdateVehicleRequest,
} from "@/types/driver";
import { vehicleService } from "@/app/services/vehicleService";

interface VehiclesState {
  // Estado
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchVehicles: () => Promise<void>;
  createVehicle: (vehicleData: CreateVehicleRequest) => Promise<Vehicle>;
  updateVehicle: (
    id: string,
    updates: UpdateVehicleRequest,
  ) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
  activateVehicle: (id: string) => Promise<Vehicle>;
  deactivateVehicle: (id: string) => Promise<Vehicle>;
  selectVehicle: (vehicle: Vehicle | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useVehiclesStore = create<VehiclesState>((set, get) => ({
  // Estado inicial
  vehicles: [],
  selectedVehicle: null,
  isLoading: false,
  error: null,

  // Acciones
  fetchVehicles: async () => {
    const state = get();
    console.log("[VehiclesStore] fetchVehicles called");

    try {
      state.setLoading(true);
      state.setError(null);

      const vehicles = await vehicleService.getVehicles();
      set({ vehicles });

      console.log(
        "[VehiclesStore] Vehicles fetched successfully:",
        vehicles.length,
      );
    } catch (error: any) {
      console.error("[VehiclesStore] Error fetching vehicles:", error);
      state.setError(error.message || "Failed to fetch vehicles");

      // Fallback to empty array
      set({ vehicles: [] });
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  createVehicle: async (vehicleData: CreateVehicleRequest) => {
    const state = get();
    console.log("[VehiclesStore] createVehicle called:", vehicleData);

    try {
      state.setLoading(true);
      state.setError(null);

      const newVehicle = await vehicleService.createVehicle(vehicleData);
      const vehicles = [...state.vehicles, newVehicle];
      set({ vehicles });

      console.log(
        "[VehiclesStore] Vehicle created successfully:",
        newVehicle.id,
      );
      return newVehicle;
    } catch (error: any) {
      console.error("[VehiclesStore] Error creating vehicle:", error);
      state.setError(error.message || "Failed to create vehicle");
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  updateVehicle: async (id: string, updates: UpdateVehicleRequest) => {
    const state = get();
    console.log("[VehiclesStore] updateVehicle called:", id, updates);

    try {
      state.setLoading(true);
      state.setError(null);

      const updatedVehicle = await vehicleService.updateVehicle(id, updates);
      const vehicles = state.vehicles.map((vehicle) =>
        vehicle.id === id ? updatedVehicle : vehicle,
      );
      set({ vehicles });

      // Update selected vehicle if it was the one updated
      const selectedVehicle = state.selectedVehicle;
      if (selectedVehicle && selectedVehicle.id === id) {
        set({ selectedVehicle: updatedVehicle });
      }

      console.log("[VehiclesStore] Vehicle updated successfully:", id);
      return updatedVehicle;
    } catch (error: any) {
      console.error("[VehiclesStore] Error updating vehicle:", error);
      state.setError(error.message || "Failed to update vehicle");
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  deleteVehicle: async (id: string) => {
    const state = get();
    console.log("[VehiclesStore] deleteVehicle called:", id);

    try {
      state.setLoading(true);
      state.setError(null);

      await vehicleService.deleteVehicle(id);
      const vehicles = state.vehicles.filter((vehicle) => vehicle.id !== id);
      set({ vehicles });

      // Clear selected vehicle if it was the one deleted
      const selectedVehicle = state.selectedVehicle;
      if (selectedVehicle && selectedVehicle.id === id) {
        set({ selectedVehicle: null });
      }

      console.log("[VehiclesStore] Vehicle deleted successfully:", id);
    } catch (error: any) {
      console.error("[VehiclesStore] Error deleting vehicle:", error);
      state.setError(error.message || "Failed to delete vehicle");
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  activateVehicle: async (id: string) => {
    const state = get();
    console.log("[VehiclesStore] activateVehicle called:", id);

    try {
      state.setLoading(true);
      state.setError(null);

      const activatedVehicle = await vehicleService.activateVehicle(id);
      const vehicles = state.vehicles.map((vehicle) =>
        vehicle.id === id ? activatedVehicle : vehicle,
      );
      set({ vehicles });

      console.log("[VehiclesStore] Vehicle activated successfully:", id);
      return activatedVehicle;
    } catch (error: any) {
      console.error("[VehiclesStore] Error activating vehicle:", error);
      state.setError(error.message || "Failed to activate vehicle");
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  deactivateVehicle: async (id: string) => {
    const state = get();
    console.log("[VehiclesStore] deactivateVehicle called:", id);

    try {
      state.setLoading(true);
      state.setError(null);

      const deactivatedVehicle = await vehicleService.deactivateVehicle(id);
      const vehicles = state.vehicles.map((vehicle) =>
        vehicle.id === id ? deactivatedVehicle : vehicle,
      );
      set({ vehicles });

      console.log("[VehiclesStore] Vehicle deactivated successfully:", id);
      return deactivatedVehicle;
    } catch (error: any) {
      console.error("[VehiclesStore] Error deactivating vehicle:", error);
      state.setError(error.message || "Failed to deactivate vehicle");
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  selectVehicle: (vehicle: Vehicle | null) => {
    console.log("[VehiclesStore] selectVehicle called:", vehicle?.id);
    set({ selectedVehicle: vehicle });
  },

  // Utilidades
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
