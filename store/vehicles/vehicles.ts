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
    

    try {
      state.setLoading(true);
      state.setError(null);

      const vehicles = await vehicleService.getVehicles();
      set({ vehicles });

      
    } catch (error: any) {
      
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
    

    try {
      state.setLoading(true);
      state.setError(null);

      const newVehicle = await vehicleService.createVehicle(vehicleData);
      const vehicles = [...state.vehicles, newVehicle];
      set({ vehicles });

      
      return newVehicle;
    } catch (error: any) {
      
      state.setError(error.message || "Failed to create vehicle");
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  updateVehicle: async (id: string, updates: UpdateVehicleRequest) => {
    const state = get();
    

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

      
      return updatedVehicle;
    } catch (error: any) {
      
      state.setError(error.message || "Failed to update vehicle");
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  deleteVehicle: async (id: string) => {
    const state = get();
    

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

      
    } catch (error: any) {
      
      state.setError(error.message || "Failed to delete vehicle");
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  activateVehicle: async (id: string) => {
    const state = get();
    

    try {
      state.setLoading(true);
      state.setError(null);

      const activatedVehicle = await vehicleService.activateVehicle(id);
      const vehicles = state.vehicles.map((vehicle) =>
        vehicle.id === id ? activatedVehicle : vehicle,
      );
      set({ vehicles });

      
      return activatedVehicle;
    } catch (error: any) {
      
      state.setError(error.message || "Failed to activate vehicle");
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  deactivateVehicle: async (id: string) => {
    const state = get();
    

    try {
      state.setLoading(true);
      state.setError(null);

      const deactivatedVehicle = await vehicleService.deactivateVehicle(id);
      const vehicles = state.vehicles.map((vehicle) =>
        vehicle.id === id ? deactivatedVehicle : vehicle,
      );
      set({ vehicles });

      
      return deactivatedVehicle;
    } catch (error: any) {
      
      state.setError(error.message || "Failed to deactivate vehicle");
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  selectVehicle: (vehicle: Vehicle | null) => {
    
    set({ selectedVehicle: vehicle });
  },

  // Utilidades
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
