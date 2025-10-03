import { create } from "zustand";
import { Ride } from "@/types/type";
import { criticalDataCache, CachedRide } from "@/lib/cache/CriticalDataCache";
import { offlineQueue } from "@/lib/offline/OfflineQueue";
import { useUserStore } from "../user";

export interface RidesStore {
  // State
  rides: Ride[];
  cachedRides: CachedRide[];
  isLoading: boolean;
  isLoadingCache: boolean;
  error: string | null;
  lastSync: Date | null;

  // Cache management
  loadFromCache: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  clearCache: () => Promise<void>;

  // CRUD operations
  fetchRides: (userId?: string) => Promise<void>;
  addRide: (ride: Ride) => Promise<void>;
  updateRide: (rideId: number, updates: Partial<Ride>) => Promise<void>;
  deleteRide: (rideId: number) => Promise<void>;

  // Offline operations
  addRideOffline: (ride: Omit<Ride, "ride_id">) => Promise<string>;
  getOfflineRides: () => Promise<CachedRide[]>;

  // Utility methods
  getRideById: (rideId: number) => Ride | undefined;
  getRecentRides: (limit?: number) => Ride[];
  getRidesByStatus: (status: string) => Ride[];
  getTotalSpent: () => number;
  getAverageRating: () => number;
}

export const useRidesStore = create<RidesStore>((set, get) => ({
  // Initial state
  rides: [],
  cachedRides: [],
  isLoading: false,
  isLoadingCache: false,
  error: null,
  lastSync: null,

  // Cache management methods
  loadFromCache: async () => {
    console.log("[RidesStore] Loading rides from cache...");
    set({ isLoadingCache: true, error: null });

    try {
      const cachedRides = await criticalDataCache.getCachedRides();
      const user = useUserStore.getState().user;

      // Filter rides by current user if logged in
      const userRides = user
        ? cachedRides.filter((ride: any) => ride.user_email === user.email)
        : cachedRides;

      set({
        cachedRides: userRides,
        isLoadingCache: false,
      });

      console.log(
        `[RidesStore] ✅ Loaded ${userRides.length} rides from cache`,
      );
    } catch (error) {
      console.error("[RidesStore] ❌ Failed to load from cache:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load cache",
        isLoadingCache: false,
      });
    }
  },

  syncWithServer: async () => {
    console.log("[RidesStore] Syncing rides with server...");
    const user = useUserStore.getState().user;

    if (!user?.email) {
      console.warn("[RidesStore] Cannot sync - no user logged in");
      return;
    }

    try {
      // Try to fetch from server
      await get().fetchRides(user.email);
      set({ lastSync: new Date() });

      // Update cache with server data
      const rides = get().rides;
      await criticalDataCache.bulkCacheRides(
        rides
          .filter(
            (ride) => ride.ride_id !== undefined && ride.user_id !== undefined,
          )
          .map((ride) => ({
            ride_id: ride.ride_id!,
            origin_address: ride.origin_address,
            destination_address: ride.destination_address,
            origin_latitude: ride.origin_latitude,
            origin_longitude: ride.origin_longitude,
            destination_latitude: ride.destination_latitude,
            destination_longitude: ride.destination_longitude,
            fare_price: ride.fare_price,
            ride_time: ride.ride_time,
            payment_status: ride.payment_status,
            created_at: ride.created_at,
            status: ride.status,
            driver_id: ride.driver_id,
            user_id: ride.user_id!,
            driver: ride.driver
              ? {
                  first_name: ride.driver.first_name,
                  last_name: ride.driver.last_name,
                  car_seats: ride.driver.car_seats,
                  rating: ride.driver.rating || 0,
                }
              : undefined,
          })),
      );

      console.log("[RidesStore] ✅ Synced with server successfully");
    } catch (error) {
      console.error("[RidesStore] ❌ Failed to sync with server:", error);
      // Don't throw - allow app to continue with cached data
    }
  },

  clearCache: async () => {
    console.log("[RidesStore] Clearing rides cache...");
    try {
      await criticalDataCache.clearAllCache();
      set({
        rides: [],
        cachedRides: [],
        error: null,
      });
      console.log("[RidesStore] ✅ Cache cleared");
    } catch (error) {
      console.error("[RidesStore] ❌ Failed to clear cache:", error);
      set({ error: "Failed to clear cache" });
    }
  },

  // CRUD operations
  fetchRides: async (userId?: string) => {
    console.log("[RidesStore] Fetching rides...", { userId });
    set({ isLoading: true, error: null });

    try {
      const user = useUserStore.getState().user;
      const targetUserId = userId || user?.email;

      if (!targetUserId) {
        throw new Error("No user ID provided");
      }

      // Try to fetch from API
      const { fetchAPI } = await import("@/lib/fetch");
      const response = await fetchAPI(`ride/${targetUserId}`, {
        requiresAuth: true,
        useRetryQueue: true, // Use offline queue if network fails
      });

      const rides = response.data || [];

      set({
        rides,
        isLoading: false,
        lastSync: new Date(),
      });

      // Cache the rides
      await criticalDataCache.bulkCacheRides(
        rides.map((ride: Ride) => ({
          ride_id: ride.ride_id || 0,
          origin_address: ride.origin_address,
          destination_address: ride.destination_address,
          origin_latitude: ride.origin_latitude,
          origin_longitude: ride.origin_longitude,
          destination_latitude: ride.destination_latitude,
          destination_longitude: ride.destination_longitude,
          fare_price: ride.fare_price,
          ride_time: ride.ride_time,
          payment_status: ride.payment_status,
          created_at: ride.created_at,
          status: ride.status || "unknown",
          driver_id: ride.driver_id || 0,
          user_id: ride.user_id || 0,
          driver: ride.driver
            ? {
                first_name: ride.driver.first_name,
                last_name: ride.driver.last_name,
                car_seats: ride.driver.car_seats,
                rating: ride.driver.rating || 0,
              }
            : undefined,
        })),
      );

      console.log(`[RidesStore] ✅ Fetched ${rides.length} rides from server`);
    } catch (error) {
      console.error("[RidesStore] ❌ Failed to fetch rides:", error);

      // Fallback to cache
      console.log("[RidesStore] 🔄 Falling back to cached rides");
      await get().loadFromCache();

      set({
        error: error instanceof Error ? error.message : "Failed to fetch rides",
        isLoading: false,
      });

      throw error;
    }
  },

  addRide: async (ride: Ride) => {
    console.log("[RidesStore] Adding ride:", ride.ride_id);

    try {
      // Add to local state
      set((state) => ({
        rides: [ride, ...state.rides],
      }));

      // Cache the ride
      await criticalDataCache.cacheRide({
        ride_id: ride.ride_id || 0,
        origin_address: ride.origin_address,
        destination_address: ride.destination_address,
        origin_latitude: ride.origin_latitude,
        origin_longitude: ride.origin_longitude,
        destination_latitude: ride.destination_latitude,
        destination_longitude: ride.destination_longitude,
        fare_price: ride.fare_price,
        ride_time: ride.ride_time,
        payment_status: ride.payment_status,
        created_at: ride.created_at,
        status: ride.status || "unknown",
        driver_id: ride.driver_id || 0,
        user_id: ride.user_id || 0,
        driver: ride.driver
          ? {
              first_name: ride.driver.first_name,
              last_name: ride.driver.last_name,
              car_seats: ride.driver.car_seats,
              rating: ride.driver.rating || 0,
            }
          : undefined,
      });

      console.log("[RidesStore] ✅ Ride added and cached");
    } catch (error) {
      console.error("[RidesStore] ❌ Failed to add ride:", error);
      set({ error: "Failed to add ride" });
    }
  },

  updateRide: async (rideId: number, updates: Partial<Ride>) => {
    console.log("[RidesStore] Updating ride:", rideId);

    try {
      // Update local state
      set((state) => ({
        rides: state.rides.map((ride) =>
          ride.ride_id === rideId ? { ...ride, ...updates } : ride,
        ),
      }));

      // Update cache
      const existingRide = get().rides.find((r) => r.ride_id === rideId);
      if (
        existingRide &&
        existingRide.ride_id !== undefined &&
        existingRide.user_id !== undefined
      ) {
        await criticalDataCache.cacheRide({
          ride_id: existingRide.ride_id,
          origin_address: existingRide.origin_address,
          destination_address: existingRide.destination_address,
          origin_latitude: existingRide.origin_latitude,
          origin_longitude: existingRide.origin_longitude,
          destination_latitude: existingRide.destination_latitude,
          destination_longitude: existingRide.destination_longitude,
          fare_price: existingRide.fare_price,
          ride_time: existingRide.ride_time,
          payment_status: existingRide.payment_status,
          created_at: existingRide.created_at,
          status: existingRide.status,
          driver_id: existingRide.driver_id,
          user_id: existingRide.user_id,
          driver: existingRide.driver
            ? ({
                first_name: existingRide.driver.first_name,
                last_name: existingRide.driver.last_name,
                car_seats: existingRide.driver.car_seats,
                rating: existingRide.driver.rating ?? 0,
              } as const)
            : undefined,
          ...updates,
        } as any);
      }

      console.log("[RidesStore] ✅ Ride updated");
    } catch (error) {
      console.error("[RidesStore] ❌ Failed to update ride:", error);
      set({ error: "Failed to update ride" });
    }
  },

  deleteRide: async (rideId: number) => {
    console.log("[RidesStore] Deleting ride:", rideId);

    try {
      // Remove from local state
      set((state) => ({
        rides: state.rides.filter((ride) => ride.ride_id !== rideId),
      }));

      // Remove from cache (we'll just not cache it anymore)
      console.log("[RidesStore] ✅ Ride deleted");
    } catch (error) {
      console.error("[RidesStore] ❌ Failed to delete ride:", error);
      set({ error: "Failed to delete ride" });
    }
  },

  // Offline operations
  addRideOffline: async (ride: Omit<Ride, "ride_id">): Promise<string> => {
    console.log("[RidesStore] Adding ride offline...");

    try {
      // Generate temporary ID
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const offlineRide: Ride = {
        ...ride,
        ride_id: parseInt(tempId.replace("temp_", "")),
      };

      // Add to local state
      set((state) => ({
        rides: [offlineRide, ...state.rides],
      }));

      // Cache locally (will be synced when connection returns)
      if (offlineRide.ride_id !== undefined) {
        await criticalDataCache.cacheRide({
          ride_id: offlineRide.ride_id,
          origin_address: ride.origin_address,
          destination_address: ride.destination_address,
          origin_latitude: ride.origin_latitude,
          origin_longitude: ride.origin_longitude,
          destination_latitude: ride.destination_latitude,
          destination_longitude: ride.destination_longitude,
          fare_price: ride.fare_price,
          ride_time: ride.ride_time,
          payment_status: ride.payment_status,
          created_at: ride.created_at,
          status: ride.status || "pending",
          driver_id: ride.driver_id || 0,
          user_id: ride.user_id || 0,
          driver: ride.driver
            ? {
                first_name: ride.driver.first_name,
                last_name: ride.driver.last_name,
                car_seats: ride.driver.car_seats,
                rating: ride.driver.rating || 0,
              }
            : undefined,
        });
      }

      // Queue server sync
      await offlineQueue.add({
        endpoint: "ride/create",
        method: "POST",
        data: ride,
        priority: "high", // High priority for ride creation
        requiresAuth: true,
      });

      console.log(`[RidesStore] ✅ Ride added offline with temp ID: ${tempId}`);
      return tempId;
    } catch (error) {
      console.error("[RidesStore] ❌ Failed to add ride offline:", error);
      throw error;
    }
  },

  getOfflineRides: async (): Promise<CachedRide[]> => {
    try {
      const cachedRides = await criticalDataCache.getCachedRides();
      return cachedRides;
    } catch (error) {
      console.error("[RidesStore] Failed to get offline rides:", error);
      return [];
    }
  },

  // Utility methods
  getRideById: (rideId: number): Ride | undefined => {
    return get().rides.find((ride) => ride.ride_id === rideId);
  },

  getRecentRides: (limit: number = 10): Ride[] => {
    return get()
      .rides.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, limit);
  },

  getRidesByStatus: (status: string): Ride[] => {
    return get().rides.filter((ride) => ride.status === status);
  },

  getTotalSpent: (): number => {
    return get()
      .rides.filter((ride) => ride.payment_status === "paid")
      .reduce((total, ride) => total + ride.fare_price, 0);
  },

  getAverageRating: (): number => {
    const ridesWithDriver = get().rides.filter((ride) => ride.driver);
    if (ridesWithDriver.length === 0) return 0;

    const totalRating = ridesWithDriver.reduce((sum, ride) => {
      return sum + (ride.driver?.rating || 0);
    }, 0);

    return Math.round((totalRating / ridesWithDriver.length) * 10) / 10; // Round to 1 decimal
  },
}));

// Selectors for better performance
export const useRides = () => useRidesStore((state) => state.rides);
export const useCachedRides = () => useRidesStore((state) => state.cachedRides);
export const useRidesLoading = () => useRidesStore((state) => state.isLoading);
export const useRidesError = () => useRidesStore((state) => state.error);
export const useRecentRides = (limit?: number) =>
  useRidesStore((state) => state.getRecentRides(limit));
export const useRidesByStatus = (status: string) =>
  useRidesStore((state) => state.getRidesByStatus(status));
export const useTotalSpent = () =>
  useRidesStore((state) => state.getTotalSpent());
export const useAverageRating = () =>
  useRidesStore((state) => state.getAverageRating());
export const useLastSync = () => useRidesStore((state) => state.lastSync);
