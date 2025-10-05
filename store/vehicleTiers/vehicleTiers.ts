import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

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

export interface VehicleTiersStore {
  tiers: VehicleTiersData | null;
  loading: boolean;
  error: string | null;

  // Actions
  setTiers: (tiers: VehicleTiersData) => Promise<void>;
  loadTiersFromStorage: () => Promise<VehicleTiersData | null>;
  fetchTiers: () => Promise<VehicleTiersData | null>;
  clearTiers: () => Promise<void>;
  forceRefreshTiers: () => Promise<void>;
}

const STORAGE_KEY = "@vehicle_tiers";

export const useVehicleTiersStore = create<VehicleTiersStore>((set, get) => ({
  tiers: null,
  loading: false,
  error: null,

  setTiers: async (tiers: VehicleTiersData) => {
    try {
      

      // Validate tiers before saving
      const hasValidTiers =
        (tiers.car && tiers.car.length > 0) ||
        (tiers.motorcycle && tiers.motorcycle.length > 0);

      if (hasValidTiers) {
        // Save to AsyncStorage only if we have valid tiers
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tiers));
        
      } else {
        
      }

      // Update store
      set({ tiers, loading: false, error: null });
      
    } catch (error) {
      
      set({ error: "Error saving tiers to storage", loading: false });
    }
  },

  loadTiersFromStorage: async () => {
    try {
      
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      

      if (stored) {
        const tiers = JSON.parse(stored) as VehicleTiersData;
        
        set({ tiers, loading: false, error: null });
        return tiers;
      } else {
        
        return null;
      }
    } catch (error) {
      
      set({ error: "Error loading tiers from storage", loading: false });
      return null;
    }
  },

  fetchTiers: async () => {
    try {
      
      set({ loading: true, error: null });

      // Get access token for authentication
      const token = await SecureStore.getItemAsync("access_token");
      

      if (!token) {
        throw new Error("No access token found. Please login first.");
      }

      const apiUrl = `${process.env.EXPO_PUBLIC_SERVER_URL}/rides/flow/client/transport/tiers`;
      

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      
      

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      
      
      
      

      if (data && data.data && data.data.data) {
        
        const rawTiers = data.data.data;
        
        

        // Extract only car and motorcycle tiers (ignore bicycle for now)
        const tiers: VehicleTiersData = {
          car: rawTiers.car || [],
          motorcycle: rawTiers.motorcycle || [],
        };

        

        await get().setTiers(tiers);
        
        return tiers;
      } else {
        
        
        
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
      return null;
    }
  },

  clearTiers: async () => {
    try {
      
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ tiers: null, loading: false, error: null });
    } catch (error) {
      
    }
  },

  forceRefreshTiers: async () => {
    try {
      
      await AsyncStorage.removeItem(STORAGE_KEY);
      await get().fetchTiers();
    } catch (error) {
      
    }
  },
}));
