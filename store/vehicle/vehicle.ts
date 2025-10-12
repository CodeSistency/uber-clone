import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mmkvStorage } from "@/lib/storage/zustandMMKVAdapter";
import type {
  Vehicle,
  CreateVehicleRequest,
  UpdateVehicleRequest,
} from "@/types/driver";
import { vehicleService } from "@/app/services/vehicleService";

// ===== TYPES =====

export interface VehicleTier {
  id: number;
  name: string;
  baseFare: number | string; // API returns as string
  perMinuteRate: number | string; // API returns as string
  perMileRate: number | string; // API returns as string
  imageUrl?: string;
  vehicleTypeId: number;
  vehicleTypeName: string;
  vehicleTypeIcon: string;
}

export interface VehicleTiersData {
  car: VehicleTier[];
  motorcycle: VehicleTier[];
}

interface VehicleStore {
  // ===== MY VEHICLES =====
  myVehicles: {
    list: Vehicle[];
    selected: Vehicle | null;
    active: Vehicle | null;
  };
  
  // ===== CATALOG =====
  catalog: {
    tiers: VehicleTiersData | null;
    carTiers: VehicleTier[];
    motorcycleTiers: VehicleTier[];
    loading: boolean;
    lastFetch: Date | null;
  };
  
  // ===== LOADING STATES =====
  loading: {
    myVehicles: boolean;
    catalog: boolean;
  };
  error: string | null;
  
  // ===== MY VEHICLES ACTIONS =====
  fetchMyVehicles: () => Promise<void>;
  createVehicle: (data: CreateVehicleRequest) => Promise<Vehicle>;
  updateVehicle: (id: string, updates: UpdateVehicleRequest) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
  selectVehicle: (vehicle: Vehicle | null) => void;
  activateVehicle: (id: string) => Promise<Vehicle>;
  deactivateVehicle: (id: string) => Promise<Vehicle>;
  
  // ===== CATALOG ACTIONS =====
  fetchTiers: () => Promise<VehicleTiersData | null>;
  loadTiersFromStorage: () => Promise<VehicleTiersData | null>;
  forceRefreshTiers: () => Promise<void>;
  clearTiers: () => Promise<void>;
  
  // ===== UTILITIES =====
  getTierById: (tierId: number) => VehicleTier | null;
  getTiersByType: (type: 'car' | 'motorcycle') => VehicleTier[];
  
  // ===== COMMON ACTIONS =====
  setLoading: (section: 'myVehicles' | 'catalog', loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// ===== INITIAL STATE =====

const initialState = {
  myVehicles: {
    list: [],
    selected: null,
    active: null,
  },
  catalog: {
    tiers: null,
    carTiers: [],
    motorcycleTiers: [],
    loading: false,
    lastFetch: null,
  },
  loading: {
    myVehicles: false,
    catalog: false,
  },
  error: null,
};

// ===== STORAGE KEYS =====

const STORAGE_KEY = "@vehicle_tiers";

// ===== STORE IMPLEMENTATION =====

export const useVehicleStore = create<VehicleStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ===== MY VEHICLES ACTIONS =====
      fetchMyVehicles: async () => {
        const state = get();
        console.log('[VehicleStore] fetchMyVehicles called');

        try {
          state.setLoading('myVehicles', true);
          state.setError(null);

          const vehicles = await vehicleService.getVehicles();
          set((state) => ({
            myVehicles: {
              ...state.myVehicles,
              list: vehicles,
            },
          }));

          console.log('[VehicleStore] My vehicles fetched successfully');
        } catch (error: any) {
          console.error('[VehicleStore] Error fetching my vehicles:', error);
          state.setError(error.message || "Failed to fetch vehicles");
        } finally {
          state.setLoading('myVehicles', false);
        }
      },

      createVehicle: async (data) => {
        const state = get();
        console.log('[VehicleStore] createVehicle called with:', data);

        try {
          state.setLoading('myVehicles', true);
          state.setError(null);

          const newVehicle = await vehicleService.createVehicle(data);
          
          set((state) => ({
            myVehicles: {
              ...state.myVehicles,
              list: [...state.myVehicles.list, newVehicle],
            },
          }));

          console.log('[VehicleStore] Vehicle created successfully');
          return newVehicle;
        } catch (error: any) {
          console.error('[VehicleStore] Error creating vehicle:', error);
          state.setError(error.message || "Failed to create vehicle");
          throw error;
        } finally {
          state.setLoading('myVehicles', false);
        }
      },

      updateVehicle: async (id, updates) => {
        const state = get();
        console.log('[VehicleStore] updateVehicle called with id:', id, 'updates:', updates);

        try {
          state.setLoading('myVehicles', true);
          state.setError(null);

          const updatedVehicle = await vehicleService.updateVehicle(id, updates);
          
          set((state) => ({
            myVehicles: {
              ...state.myVehicles,
              list: state.myVehicles.list.map(vehicle =>
                vehicle.id === id ? updatedVehicle : vehicle
              ),
              selected: state.myVehicles.selected?.id === id ? updatedVehicle : state.myVehicles.selected,
              active: state.myVehicles.active?.id === id ? updatedVehicle : state.myVehicles.active,
            },
          }));

          console.log('[VehicleStore] Vehicle updated successfully');
          return updatedVehicle;
        } catch (error: any) {
          console.error('[VehicleStore] Error updating vehicle:', error);
          state.setError(error.message || "Failed to update vehicle");
          throw error;
        } finally {
          state.setLoading('myVehicles', false);
        }
      },

      deleteVehicle: async (id) => {
        const state = get();
        console.log('[VehicleStore] deleteVehicle called with id:', id);

        try {
          state.setLoading('myVehicles', true);
          state.setError(null);

          await vehicleService.deleteVehicle(id);
          
          set((state) => ({
            myVehicles: {
              ...state.myVehicles,
              list: state.myVehicles.list.filter(vehicle => vehicle.id !== id),
              selected: state.myVehicles.selected?.id === id ? null : state.myVehicles.selected,
              active: state.myVehicles.active?.id === id ? null : state.myVehicles.active,
            },
          }));

          console.log('[VehicleStore] Vehicle deleted successfully');
        } catch (error: any) {
          console.error('[VehicleStore] Error deleting vehicle:', error);
          state.setError(error.message || "Failed to delete vehicle");
        } finally {
          state.setLoading('myVehicles', false);
        }
      },

      selectVehicle: (vehicle) => {
        console.log('[VehicleStore] selectVehicle called with:', vehicle);
        set((state) => ({
          myVehicles: {
            ...state.myVehicles,
            selected: vehicle,
          },
        }));
      },

      activateVehicle: async (id) => {
        const state = get();
        console.log('[VehicleStore] activateVehicle called with id:', id);

        try {
          state.setLoading('myVehicles', true);
          state.setError(null);

          const activatedVehicle = await vehicleService.activateVehicle(id);
          
          set((state) => ({
            myVehicles: {
              ...state.myVehicles,
              list: state.myVehicles.list.map(vehicle =>
                vehicle.id === id ? activatedVehicle : { ...vehicle, isActive: false }
              ),
              active: activatedVehicle,
            },
          }));

          console.log('[VehicleStore] Vehicle activated successfully');
          return activatedVehicle;
        } catch (error: any) {
          console.error('[VehicleStore] Error activating vehicle:', error);
          state.setError(error.message || "Failed to activate vehicle");
          throw error;
        } finally {
          state.setLoading('myVehicles', false);
        }
      },

      deactivateVehicle: async (id) => {
        const state = get();
        console.log('[VehicleStore] deactivateVehicle called with id:', id);

        try {
          state.setLoading('myVehicles', true);
          state.setError(null);

          const deactivatedVehicle = await vehicleService.deactivateVehicle(id);
          
          set((state) => ({
            myVehicles: {
              ...state.myVehicles,
              list: state.myVehicles.list.map(vehicle =>
                vehicle.id === id ? deactivatedVehicle : vehicle
              ),
              active: state.myVehicles.active?.id === id ? null : state.myVehicles.active,
            },
          }));

          console.log('[VehicleStore] Vehicle deactivated successfully');
          return deactivatedVehicle;
        } catch (error: any) {
          console.error('[VehicleStore] Error deactivating vehicle:', error);
          state.setError(error.message || "Failed to deactivate vehicle");
          throw error;
        } finally {
          state.setLoading('myVehicles', false);
        }
      },

      // ===== CATALOG ACTIONS =====
      fetchTiers: async () => {
        const state = get();
        console.log('[VehicleStore] fetchTiers called');

        try {
          state.setLoading('catalog', true);
          state.setError(null);

          // TODO: Call actual API
          // const tiers = await vehicleService.getVehicleTiers();
          
          // Mock data for now
          const mockTiers: VehicleTiersData = {
            car: [
              {
                id: 1,
                name: "Economy",
                baseFare: "2.50",
                perMinuteRate: "0.25",
                perMileRate: "1.50",
                vehicleTypeId: 1,
                vehicleTypeName: "Car",
                vehicleTypeIcon: "car",
              },
              {
                id: 2,
                name: "Comfort",
                baseFare: "3.50",
                perMinuteRate: "0.35",
                perMileRate: "2.00",
                vehicleTypeId: 1,
                vehicleTypeName: "Car",
                vehicleTypeIcon: "car",
              },
            ],
            motorcycle: [
              {
                id: 3,
                name: "Moto",
                baseFare: "1.50",
                perMinuteRate: "0.20",
                perMileRate: "1.00",
                vehicleTypeId: 2,
                vehicleTypeName: "Motorcycle",
                vehicleTypeIcon: "motorcycle",
              },
            ],
          };

          set((state) => ({
            catalog: {
              ...state.catalog,
              tiers: mockTiers,
              carTiers: mockTiers.car,
              motorcycleTiers: mockTiers.motorcycle,
              lastFetch: new Date(),
            },
          }));

          // Save to storage
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockTiers));

          console.log('[VehicleStore] Tiers fetched successfully');
          return mockTiers;
        } catch (error: any) {
          console.error('[VehicleStore] Error fetching tiers:', error);
          state.setError(error.message || "Failed to fetch vehicle tiers");
          return null;
        } finally {
          state.setLoading('catalog', false);
        }
      },

      loadTiersFromStorage: async () => {
        const state = get();
        console.log('[VehicleStore] loadTiersFromStorage called');

        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) {
            const tiers: VehicleTiersData = JSON.parse(stored);
            
            set((state) => ({
              catalog: {
                ...state.catalog,
                tiers,
                carTiers: tiers.car,
                motorcycleTiers: tiers.motorcycle,
              },
            }));

            console.log('[VehicleStore] Tiers loaded from storage successfully');
            return tiers;
          }
          return null;
        } catch (error: any) {
          console.error('[VehicleStore] Error loading tiers from storage:', error);
          return null;
        }
      },

      forceRefreshTiers: async () => {
        const state = get();
        console.log('[VehicleStore] forceRefreshTiers called');

        try {
          await state.clearTiers();
          await state.fetchTiers();
          console.log('[VehicleStore] Tiers force refreshed successfully');
        } catch (error: any) {
          console.error('[VehicleStore] Error force refreshing tiers:', error);
          state.setError(error.message || "Failed to refresh tiers");
        }
      },

      clearTiers: async () => {
        const state = get();
        console.log('[VehicleStore] clearTiers called');

        try {
          await AsyncStorage.removeItem(STORAGE_KEY);
          set((state) => ({
            catalog: {
              ...state.catalog,
              tiers: null,
              carTiers: [],
              motorcycleTiers: [],
              lastFetch: null,
            },
          }));

          console.log('[VehicleStore] Tiers cleared successfully');
        } catch (error: any) {
          console.error('[VehicleStore] Error clearing tiers:', error);
        }
      },

      // ===== UTILITIES =====
      getTierById: (tierId) => {
        const state = get();
        const allTiers = [...state.catalog.carTiers, ...state.catalog.motorcycleTiers];
        return allTiers.find(tier => tier.id === tierId) || null;
      },

      getTiersByType: (type) => {
        const state = get();
        return type === 'car' ? state.catalog.carTiers : state.catalog.motorcycleTiers;
      },

      // ===== COMMON ACTIONS =====
      setLoading: (section, loading) => {
        console.log(`[VehicleStore] setLoading called for ${section}:`, loading);
        set((state) => ({
          loading: {
            ...state.loading,
            [section]: loading,
          },
        }));
      },

      setError: (error) => {
        console.log('[VehicleStore] setError called with:', error);
        set(() => ({ error }));
      },

      clearError: () => {
        console.log('[VehicleStore] clearError called');
        set(() => ({ error: null }));
      },
    }),
    {
      name: 'vehicle-store',
      storage: mmkvStorage as any,
      partialize: (state) => ({
        // Only persist essential data, not loading states or errors
        myVehicles: state.myVehicles,
        catalog: {
          tiers: state.catalog.tiers,
          carTiers: state.catalog.carTiers,
          motorcycleTiers: state.catalog.motorcycleTiers,
          lastFetch: state.catalog.lastFetch,
        },
      } as any),
    }
  )
);

// ===== OPTIMIZED SELECTORS =====

// My vehicles selectors
export const useMyVehicles = () => useVehicleStore((state) => state.myVehicles.list);
export const useSelectedVehicle = () => useVehicleStore((state) => state.myVehicles.selected);
export const useActiveVehicle = () => useVehicleStore((state) => state.myVehicles.active);
export const useHasVehicles = () => useVehicleStore((state) => state.myVehicles.list.length > 0);
export const useMyVehiclesCount = () => useVehicleStore((state) => state.myVehicles.list.length);

// Catalog selectors
export const useVehicleTiers = () => useVehicleStore((state) => state.catalog.tiers);
export const useCarTiers = () => useVehicleStore((state) => state.catalog.carTiers);
export const useMotorcycleTiers = () => useVehicleStore((state) => state.catalog.motorcycleTiers);
export const useTiersLoading = () => useVehicleStore((state) => state.catalog.loading);
export const useTiersLastFetch = () => useVehicleStore((state) => state.catalog.lastFetch);

// Loading and error selectors
export const useVehiclesLoading = () => useVehicleStore((state) => state.loading);
export const useMyVehiclesLoading = () => useVehicleStore((state) => state.loading.myVehicles);
export const useCatalogLoading = () => useVehicleStore((state) => state.loading.catalog);
export const useVehicleError = () => useVehicleStore((state) => state.error);

// Combined selectors
export const useVehicleData = () => useVehicleStore((state) => ({
  myVehicles: state.myVehicles.list,
  selected: state.myVehicles.selected,
  active: state.myVehicles.active,
  tiers: state.catalog.tiers,
  loading: state.loading,
}));
