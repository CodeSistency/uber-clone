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
      console.log("[VehicleTiersStore] Setting tiers:", {
        carCount: tiers.car?.length || 0,
        motorcycleCount: tiers.motorcycle?.length || 0,
        carTiers: tiers.car,
        motorcycleTiers: tiers.motorcycle,
        fullTiers: tiers,
      });

      // Validate tiers before saving
      const hasValidTiers =
        (tiers.car && tiers.car.length > 0) ||
        (tiers.motorcycle && tiers.motorcycle.length > 0);

      if (hasValidTiers) {
        // Save to AsyncStorage only if we have valid tiers
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tiers));
        console.log("[VehicleTiersStore] Valid tiers saved to AsyncStorage");
      } else {
        console.log(
          "[VehicleTiersStore] No valid tiers to save, skipping AsyncStorage",
        );
      }

      // Update store
      set({ tiers, loading: false, error: null });
      console.log("[VehicleTiersStore] Store updated with new tiers");
    } catch (error) {
      console.error("[VehicleTiersStore] Error saving tiers:", error);
      set({ error: "Error saving tiers to storage", loading: false });
    }
  },

  loadTiersFromStorage: async () => {
    try {
      console.log("[VehicleTiersStore] Loading tiers from AsyncStorage");
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      console.log("[VehicleTiersStore] Raw stored data:", stored);

      if (stored) {
        const tiers = JSON.parse(stored) as VehicleTiersData;
        console.log("[VehicleTiersStore] Loaded tiers from storage:", {
          carCount: tiers.car?.length || 0,
          motorcycleCount: tiers.motorcycle?.length || 0,
          carTiers: tiers.car,
          motorcycleTiers: tiers.motorcycle,
          fullTiers: tiers,
        });
        set({ tiers, loading: false, error: null });
        return tiers;
      } else {
        console.log("[VehicleTiersStore] No tiers found in storage");
        return null;
      }
    } catch (error) {
      console.error(
        "[VehicleTiersStore] Error loading tiers from storage:",
        error,
      );
      set({ error: "Error loading tiers from storage", loading: false });
      return null;
    }
  },

  fetchTiers: async () => {
    try {
      console.log("[VehicleTiersStore] Fetching tiers from API");
      set({ loading: true, error: null });

      // Get access token for authentication
      const token = await SecureStore.getItemAsync("access_token");
      console.log("[VehicleTiersStore] Access token available:", !!token);

      if (!token) {
        throw new Error("No access token found. Please login first.");
      }

      const apiUrl = `${process.env.EXPO_PUBLIC_SERVER_URL}/rides/flow/client/transport/tiers`;
      console.log("[VehicleTiersStore] Making API call to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[VehicleTiersStore] API response status:", response.status);
      console.log("[VehicleTiersStore] API response ok:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("[VehicleTiersStore] Raw API response:", data);
      console.log("[VehicleTiersStore] Response data type:", typeof data);
      console.log("[VehicleTiersStore] Response data keys:", Object.keys(data));
      console.log(
        "[VehicleTiersStore] Response has data property:",
        !!data.data,
      );
      console.log("[VehicleTiersStore] Response data value:", data.data);

      if (data && data.data && data.data.data) {
        console.log("[VehicleTiersStore] Processing data.data.data as tiers");
        const rawTiers = data.data.data;
        console.log("[VehicleTiersStore] Raw tiers from API:", rawTiers);
        console.log(
          "[VehicleTiersStore] Raw tiers keys:",
          Object.keys(rawTiers),
        );

        // Extract only car and motorcycle tiers (ignore bicycle for now)
        const tiers: VehicleTiersData = {
          car: rawTiers.car || [],
          motorcycle: rawTiers.motorcycle || [],
        };

        console.log("[VehicleTiersStore] Processed tiers:", {
          carCount: tiers.car.length,
          motorcycleCount: tiers.motorcycle.length,
          car: tiers.car,
          motorcycle: tiers.motorcycle,
        });

        await get().setTiers(tiers);
        console.log("[VehicleTiersStore] Tiers fetched and saved successfully");
        return tiers;
      } else {
        console.error(
          "[VehicleTiersStore] Invalid response structure - no data.data.data",
        );
        console.error("[VehicleTiersStore] Full response:", data);
        console.error(
          "[VehicleTiersStore] Response data keys:",
          data?.data ? Object.keys(data.data) : "no data",
        );
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("[VehicleTiersStore] Error fetching tiers:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
      return null;
    }
  },

  clearTiers: async () => {
    try {
      console.log("[VehicleTiersStore] Clearing tiers");
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ tiers: null, loading: false, error: null });
    } catch (error) {
      console.error("[VehicleTiersStore] Error clearing tiers:", error);
    }
  },

  forceRefreshTiers: async () => {
    try {
      console.log(
        "[VehicleTiersStore] Force refreshing tiers - clearing cache and fetching from API",
      );
      await AsyncStorage.removeItem(STORAGE_KEY);
      await get().fetchTiers();
    } catch (error) {
      console.error("[VehicleTiersStore] Error force refreshing tiers:", error);
    }
  },
}));
