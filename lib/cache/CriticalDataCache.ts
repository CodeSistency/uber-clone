import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CachedLocation {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  formattedAddress: string;
  placeId?: string;
  types?: string[];
  timestamp: number;
  frequency: number; // How often this location is used
  lastUsed: number;
  lastAccessed?: number;
  source: "search" | "current" | "recent" | "favorite";
}

export interface CachedRide {
  id: string;
  ride_id: number;
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  fare_price: number;
  ride_time: number;
  payment_status: string;
  created_at: string;
  status?: string;
  driver_id: number;
  user_id: number;
  driver?: {
    first_name: string;
    last_name: string;
    car_seats: number;
    rating: number;
  };
  timestamp: number; // When cached
  lastAccessed?: number; // Last time accessed for LRU
}

export interface CachedDriver {
  id: string;
  driver_id: number;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  car_image_url: string;
  car_seats: number;
  rating: number;
  timestamp: number;
  lastSeen: number;
  lastAccessed?: number;
}

export interface CacheStats {
  locations: {
    total: number;
    bySource: Record<string, number>;
    oldest: number | null;
    newest: number | null;
    averageAge: number;
  };
  rides: {
    total: number;
    oldest: number | null;
    newest: number | null;
    averageAge: number;
  };
  drivers: {
    total: number;
    oldest: number | null;
    newest: number | null;
    averageAge: number;
  };
  totalSize: number; // Approximate size in bytes
}

export class CriticalDataCache {
  private static instance: CriticalDataCache;

  // Storage keys
  private readonly LOCATIONS_KEY = "@cached_locations";
  private readonly RIDES_KEY = "@cached_rides";
  private readonly DRIVERS_KEY = "@cached_drivers";
  private readonly FAVORITES_KEY = "@favorite_locations";

  // Cache limits
  private readonly MAX_LOCATIONS = 200;
  private readonly MAX_RIDES = 100;
  private readonly MAX_DRIVERS = 50;
  private readonly MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly MAX_FREQUENCY = 1000; // Prevent unlimited frequency growth

  // Performance optimization
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> =
    new Map();
  private readonly DEBOUNCE_DELAY = 300; // 300ms debounce for storage writes
  private readonly COMPRESSION_THRESHOLD = 1024 * 1024; // 1MB threshold for compression

  // Event listeners for cache changes
  private listeners: ((type: string, data: any) => void)[] = [];

  static getInstance(): CriticalDataCache {
    if (!CriticalDataCache.instance) {
      CriticalDataCache.instance = new CriticalDataCache();
    }
    return CriticalDataCache.instance;
  }

  private constructor() {
    this.initializeCache();
  }

  async initializeCache(): Promise<void> {
    console.log("[CriticalDataCache] Initializing cache system...");

    try {
      // Load existing data
      await Promise.all([
        this.loadLocationsFromStorage(),
        this.loadRidesFromStorage(),
        this.loadDriversFromStorage(),
      ]);

      // Cleanup expired data
      await this.cleanupExpiredData();

      console.log("[CriticalDataCache] ✅ Cache initialized successfully");
    } catch (error) {
      console.error(
        "[CriticalDataCache] ❌ Failed to initialize cache:",
        error,
      );
    }
  }

  private notifyListeners(type: string, data: any): void {
    this.listeners.forEach((listener) => {
      try {
        listener(type, data);
      } catch (error) {
        console.error("[CriticalDataCache] Error notifying listener:", error);
      }
    });
  }

  // Debounced storage operations for performance
  private async debouncedSave(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // Clear existing timer for this key
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounced timer
      const timerId = setTimeout(async () => {
        try {
          const dataSize = JSON.stringify(data).length;

          // Compress if data is large
          let dataToStore = data;
          if (dataSize > this.COMPRESSION_THRESHOLD) {
            console.log(
              `[CriticalDataCache] Compressing large data (${(dataSize / 1024 / 1024).toFixed(2)}MB)`,
            );
            dataToStore = await this.compressData(data);
          }

          await AsyncStorage.setItem(key, JSON.stringify(dataToStore));
          console.log(
            `[CriticalDataCache] ✅ Saved ${key} (${(dataSize / 1024).toFixed(1)}KB)`,
          );

          this.debounceTimers.delete(key);
          resolve();
        } catch (error) {
          console.error(`[CriticalDataCache] Failed to save ${key}:`, error);
          this.debounceTimers.delete(key);
          reject(error);
        }
      }, this.DEBOUNCE_DELAY);

      this.debounceTimers.set(key, timerId);
    });
  }

  private async compressData(data: any): Promise<any> {
    // Simple compression by removing redundant fields for large datasets
    // In a real implementation, you might use a proper compression library
    if (Array.isArray(data)) {
      return data.map((item) => {
        // Remove timestamp fields that can be recalculated
        const { timestamp, lastAccessed, ...compressed } = item;
        return compressed;
      });
    }
    return data;
  }

  private async decompressData(compressedData: any): Promise<any> {
    // Restore timestamp fields
    if (Array.isArray(compressedData)) {
      return compressedData.map((item, index) => ({
        ...item,
        timestamp: Date.now() - index * 1000, // Approximate timestamps
        lastAccessed: Date.now(),
      })) as CachedLocation[];
    }
    return compressedData;
  }

  // Location caching methods
  async cacheLocation(
    location: Omit<
      CachedLocation,
      "id" | "timestamp" | "frequency" | "lastUsed"
    >,
  ): Promise<string> {
    try {
      const existing = await this.getCachedLocations();
      const now = Date.now();

      // Check if location already exists (by coordinates or placeId)
      const existingIndex = existing.findIndex(
        (loc) =>
          (location.placeId && loc.placeId === location.placeId) ||
          (Math.abs(loc.latitude - location.latitude) < 0.0001 &&
            Math.abs(loc.longitude - location.longitude) < 0.0001),
      );

      if (existingIndex >= 0) {
        // Update existing location
        existing[existingIndex].frequency += 1;
        existing[existingIndex].lastUsed = now;
        existing[existingIndex].timestamp = now;

        // Move to front (most recently used)
        const updated = existing.splice(existingIndex, 1)[0];
        existing.unshift(updated);
      } else {
        // Add new location
        const newLocation: CachedLocation = {
          ...location,
          id: `loc_${now}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: now,
          frequency: 1,
          lastUsed: now,
        };

        existing.unshift(newLocation);
      }

      // Keep only most recent/frequent locations
      const trimmed = existing.slice(0, this.MAX_LOCATIONS);

      await AsyncStorage.setItem(this.LOCATIONS_KEY, JSON.stringify(trimmed));
      this.notifyListeners("location_added", location);

      console.log(
        `[CriticalDataCache] ✅ Cached location: ${location.address}`,
      );
      return location.address;
    } catch (error) {
      console.error("[CriticalDataCache] Failed to cache location:", error);
      throw error;
    }
  }

  async getCachedLocations(limit: number = 50): Promise<CachedLocation[]> {
    try {
      const locations = await this.loadLocationsFromStorage();

      // Sort by frequency and recency
      const sorted = locations
        .sort((a, b) => {
          // First by frequency
          if (a.frequency !== b.frequency) {
            return b.frequency - a.frequency;
          }
          // Then by last used
          return b.lastUsed - a.lastUsed;
        })
        .slice(0, limit);

      // Update last accessed time
      const now = Date.now();
      sorted.forEach((loc) => {
        loc.lastAccessed = now;
      });

      await this.saveLocationsToStorage(locations);

      return sorted;
    } catch (error) {
      console.error(
        "[CriticalDataCache] Failed to get cached locations:",
        error,
      );
      return [];
    }
  }

  async searchLocations(query: string): Promise<CachedLocation[]> {
    try {
      const locations = await this.loadLocationsFromStorage();
      const now = Date.now();

      const searchResults = locations
        .filter((loc) => {
          const searchText =
            `${loc.address} ${loc.formattedAddress}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        })
        .sort((a, b) => {
          // Prioritize by relevance (contains query in address)
          const aScore = this.calculateSearchScore(a, query);
          const bScore = this.calculateSearchScore(b, query);

          if (aScore !== bScore) {
            return bScore - aScore;
          }

          // Then by frequency and recency
          if (a.frequency !== b.frequency) {
            return b.frequency - a.frequency;
          }

          return b.lastUsed - a.lastUsed;
        })
        .slice(0, 20); // Limit results

      // Update last accessed
      searchResults.forEach((loc) => {
        loc.lastAccessed = now;
      });

      await this.saveLocationsToStorage(locations);

      return searchResults;
    } catch (error) {
      console.error("[CriticalDataCache] Failed to search locations:", error);
      return [];
    }
  }

  private calculateSearchScore(
    location: CachedLocation,
    query: string,
  ): number {
    const searchText =
      `${location.address} ${location.formattedAddress}`.toLowerCase();
    const queryLower = query.toLowerCase();

    let score = 0;

    // Exact match gets highest score
    if (location.address.toLowerCase() === queryLower) {
      score += 1000;
    }

    // Starts with query
    if (location.address.toLowerCase().startsWith(queryLower)) {
      score += 500;
    }

    // Contains query
    if (searchText.includes(queryLower)) {
      score += 100;
    }

    // Boost by frequency
    score += location.frequency;

    return score;
  }

  // Ride caching methods
  async cacheRide(
    ride: Omit<CachedRide, "id" | "timestamp" | "lastAccessed">,
  ): Promise<void> {
    try {
      const rides = await this.loadRidesFromStorage();
      const now = Date.now();

      // Check if ride already exists
      const existingIndex = rides.findIndex((r) => r.ride_id === ride.ride_id);

      if (existingIndex >= 0) {
        // Update existing ride
        rides[existingIndex] = {
          ...ride,
          id: rides[existingIndex].id,
          timestamp: now,
          lastAccessed: now,
        };
      } else {
        // Add new ride
        const newRide: CachedRide = {
          ...ride,
          id: `ride_${now}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: now,
          lastAccessed: now,
        };

        rides.unshift(newRide);
      }

      // Keep only most recent rides
      const trimmed = rides.slice(0, this.MAX_RIDES);

      await AsyncStorage.setItem(this.RIDES_KEY, JSON.stringify(trimmed));
      this.notifyListeners("ride_cached", ride);

      console.log(`[CriticalDataCache] ✅ Cached ride: ${ride.ride_id}`);
    } catch (error) {
      console.error("[CriticalDataCache] Failed to cache ride:", error);
    }
  }

  async getCachedRides(limit: number = 20): Promise<CachedRide[]> {
    try {
      const rides = await this.loadRidesFromStorage();
      const now = Date.now();

      // Sort by recency and update access time
      const sorted = rides
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);

      sorted.forEach((ride) => {
        ride.lastAccessed = now;
      });

      await this.saveRidesToStorage(rides);

      return sorted;
    } catch (error) {
      console.error("[CriticalDataCache] Failed to get cached rides:", error);
      return [];
    }
  }

  // Driver caching methods
  async cacheDriver(
    driver: Omit<CachedDriver, "id" | "timestamp" | "lastSeen">,
  ): Promise<void> {
    try {
      const drivers = await this.loadDriversFromStorage();
      const now = Date.now();

      // Check if driver already exists
      const existingIndex = drivers.findIndex(
        (d) => d.driver_id === driver.driver_id,
      );

      if (existingIndex >= 0) {
        // Update existing driver
        drivers[existingIndex] = {
          ...driver,
          id: drivers[existingIndex].id,
          timestamp: now,
          lastSeen: now,
        };
      } else {
        // Add new driver
        const newDriver: CachedDriver = {
          ...driver,
          id: `driver_${now}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: now,
          lastSeen: now,
        };

        drivers.unshift(newDriver);
      }

      // Keep only most recent drivers
      const trimmed = drivers.slice(0, this.MAX_DRIVERS);

      await AsyncStorage.setItem(this.DRIVERS_KEY, JSON.stringify(trimmed));
      this.notifyListeners("driver_cached", driver);

      console.log(
        `[CriticalDataCache] ✅ Cached driver: ${driver.first_name} ${driver.last_name}`,
      );
    } catch (error) {
      console.error("[CriticalDataCache] Failed to cache driver:", error);
    }
  }

  async getCachedDrivers(limit: number = 20): Promise<CachedDriver[]> {
    try {
      const drivers = await this.loadDriversFromStorage();
      const now = Date.now();

      // Sort by last seen and update access time
      const sorted = drivers
        .sort((a, b) => b.lastSeen - a.lastSeen)
        .slice(0, limit);

      sorted.forEach((driver) => {
        driver.lastAccessed = now;
      });

      await this.saveDriversToStorage(drivers);

      return sorted;
    } catch (error) {
      console.error("[CriticalDataCache] Failed to get cached drivers:", error);
      return [];
    }
  }

  // Storage methods
  private async loadLocationsFromStorage(): Promise<CachedLocation[]> {
    try {
      const stored = await AsyncStorage.getItem(this.LOCATIONS_KEY);
      if (!stored) return [];

      const data = JSON.parse(stored);

      // Check if data is compressed (missing timestamp fields)
      if (Array.isArray(data) && data.length > 0 && !data[0].timestamp) {
        return (await this.decompressData(data)) as CachedLocation[];
      }

      return data;
    } catch (error) {
      console.error("[CriticalDataCache] Failed to load locations:", error);
      return [];
    }
  }

  private async saveLocationsToStorage(
    locations: CachedLocation[],
  ): Promise<void> {
    try {
      // Debounce storage writes
      await this.debouncedSave(this.LOCATIONS_KEY, locations);
    } catch (error) {
      console.error("[CriticalDataCache] Failed to save locations:", error);
    }
  }

  private async saveRidesToStorage(rides: CachedRide[]): Promise<void> {
    try {
      await this.debouncedSave(this.RIDES_KEY, rides);
    } catch (error) {
      console.error("[CriticalDataCache] Failed to save rides:", error);
    }
  }

  private async saveDriversToStorage(drivers: CachedDriver[]): Promise<void> {
    try {
      await this.debouncedSave(this.DRIVERS_KEY, drivers);
    } catch (error) {
      console.error("[CriticalDataCache] Failed to save drivers:", error);
    }
  }

  private async loadRidesFromStorage(): Promise<CachedRide[]> {
    try {
      const stored = await AsyncStorage.getItem(this.RIDES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("[CriticalDataCache] Failed to load rides:", error);
      return [];
    }
  }

  private async loadDriversFromStorage(): Promise<CachedDriver[]> {
    try {
      const stored = await AsyncStorage.getItem(this.DRIVERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("[CriticalDataCache] Failed to load drivers:", error);
      return [];
    }
  }

  // Cache maintenance
  async cleanupExpiredData(): Promise<void> {
    try {
      const now = Date.now();
      let cleanupCount = 0;

      // Clean locations
      const locations = await this.loadLocationsFromStorage();
      const validLocations = locations.filter(
        (loc) => now - loc.timestamp < this.MAX_CACHE_AGE,
      );
      cleanupCount += locations.length - validLocations.length;

      if (validLocations.length !== locations.length) {
        await this.saveLocationsToStorage(validLocations);
      }

      // Clean rides
      const rides = await this.loadRidesFromStorage();
      const validRides = rides.filter(
        (ride) => now - ride.timestamp < this.MAX_CACHE_AGE,
      );
      cleanupCount += rides.length - validRides.length;

      if (validRides.length !== rides.length) {
        await this.saveRidesToStorage(validRides);
      }

      // Clean drivers
      const drivers = await this.loadDriversFromStorage();
      const validDrivers = drivers.filter(
        (driver) => now - driver.timestamp < this.MAX_CACHE_AGE,
      );
      cleanupCount += drivers.length - validDrivers.length;

      if (validDrivers.length !== drivers.length) {
        await this.saveDriversToStorage(validDrivers);
      }

      if (cleanupCount > 0) {
        console.log(
          `[CriticalDataCache] 🧹 Cleaned up ${cleanupCount} expired cache entries`,
        );
      }
    } catch (error) {
      console.error(
        "[CriticalDataCache] Failed to cleanup expired data:",
        error,
      );
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.LOCATIONS_KEY),
        AsyncStorage.removeItem(this.RIDES_KEY),
        AsyncStorage.removeItem(this.DRIVERS_KEY),
        AsyncStorage.removeItem(this.FAVORITES_KEY),
      ]);

      this.notifyListeners("cache_cleared", null);
      console.log("[CriticalDataCache] 🗑️ All cache cleared");
    } catch (error) {
      console.error("[CriticalDataCache] Failed to clear cache:", error);
    }
  }

  // Event system
  onCacheChange(listener: (type: string, data: any) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Statistics
  async getStats(): Promise<CacheStats> {
    try {
      const [locations, rides, drivers] = await Promise.all([
        this.loadLocationsFromStorage(),
        this.loadRidesFromStorage(),
        this.loadDriversFromStorage(),
      ]);

      const now = Date.now();

      const locationTimestamps = locations.map((l) => l.timestamp);
      const rideTimestamps = rides.map((r) => r.timestamp);
      const driverTimestamps = drivers.map((d) => d.timestamp);

      const locationStats = {
        total: locations.length,
        bySource: locations.reduce(
          (acc, loc) => {
            acc[loc.source] = (acc[loc.source] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
        oldest:
          locationTimestamps.length > 0
            ? Math.min(...locationTimestamps)
            : null,
        newest:
          locationTimestamps.length > 0
            ? Math.max(...locationTimestamps)
            : null,
        averageAge:
          locationTimestamps.length > 0
            ? locationTimestamps.reduce((sum, ts) => sum + (now - ts), 0) /
              locationTimestamps.length
            : 0,
      };

      const rideStats = {
        total: rides.length,
        oldest: rideTimestamps.length > 0 ? Math.min(...rideTimestamps) : null,
        newest: rideTimestamps.length > 0 ? Math.max(...rideTimestamps) : null,
        averageAge:
          rideTimestamps.length > 0
            ? rideTimestamps.reduce((sum, ts) => sum + (now - ts), 0) /
              rideTimestamps.length
            : 0,
      };

      const driverStats = {
        total: drivers.length,
        oldest:
          driverTimestamps.length > 0 ? Math.min(...driverTimestamps) : null,
        newest:
          driverTimestamps.length > 0 ? Math.max(...driverTimestamps) : null,
        averageAge:
          driverTimestamps.length > 0
            ? driverTimestamps.reduce((sum, ts) => sum + (now - ts), 0) /
              driverTimestamps.length
            : 0,
      };

      // Estimate size (rough calculation)
      const totalSize = JSON.stringify({ locations, rides, drivers }).length;

      return {
        locations: locationStats,
        rides: rideStats,
        drivers: driverStats,
        totalSize,
      };
    } catch (error) {
      console.error("[CriticalDataCache] Failed to get stats:", error);
      return {
        locations: {
          total: 0,
          bySource: {},
          oldest: null,
          newest: null,
          averageAge: 0,
        },
        rides: { total: 0, oldest: null, newest: null, averageAge: 0 },
        drivers: { total: 0, oldest: null, newest: null, averageAge: 0 },
        totalSize: 0,
      };
    }
  }

  // Favorites management
  async addToFavorites(location: CachedLocation): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const existingIndex = favorites.findIndex(
        (fav) => fav.id === location.id,
      );

      if (existingIndex < 0) {
        favorites.unshift(location);
        await AsyncStorage.setItem(
          this.FAVORITES_KEY,
          JSON.stringify(favorites),
        );
        this.notifyListeners("favorite_added", location);
        console.log(
          `[CriticalDataCache] ⭐ Added to favorites: ${location.address}`,
        );
      }
    } catch (error) {
      console.error("[CriticalDataCache] Failed to add to favorites:", error);
    }
  }

  async removeFromFavorites(locationId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter((fav) => fav.id !== locationId);

      if (filtered.length !== favorites.length) {
        await AsyncStorage.setItem(
          this.FAVORITES_KEY,
          JSON.stringify(filtered),
        );
        this.notifyListeners("favorite_removed", locationId);
        console.log(
          `[CriticalDataCache] ⭐ Removed from favorites: ${locationId}`,
        );
      }
    } catch (error) {
      console.error(
        "[CriticalDataCache] Failed to remove from favorites:",
        error,
      );
    }
  }

  async getFavorites(): Promise<CachedLocation[]> {
    try {
      const stored = await AsyncStorage.getItem(this.FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("[CriticalDataCache] Failed to get favorites:", error);
      return [];
    }
  }

  // Bulk operations
  async bulkCacheLocations(
    locations: Omit<
      CachedLocation,
      "id" | "timestamp" | "frequency" | "lastUsed"
    >[],
  ): Promise<void> {
    try {
      console.log(
        `[CriticalDataCache] 📦 Bulk caching ${locations.length} locations`,
      );

      for (const location of locations) {
        await this.cacheLocation(location);
      }

      console.log(`[CriticalDataCache] ✅ Bulk cache completed`);
    } catch (error) {
      console.error(
        "[CriticalDataCache] Failed to bulk cache locations:",
        error,
      );
    }
  }

  async bulkCacheRides(
    rides: Omit<CachedRide, "id" | "timestamp" | "lastAccessed">[],
  ): Promise<void> {
    try {
      console.log(`[CriticalDataCache] 📦 Bulk caching ${rides.length} rides`);

      for (const ride of rides) {
        await this.cacheRide(ride);
      }

      console.log(`[CriticalDataCache] ✅ Bulk cache completed`);
    } catch (error) {
      console.error("[CriticalDataCache] Failed to bulk cache rides:", error);
    }
  }

  // Health check
  async getCacheHealth(): Promise<{
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const stats = await this.getStats();

      // Check location cache
      if (stats.locations.total > this.MAX_LOCATIONS * 0.9) {
        issues.push(
          `Location cache is ${Math.round((stats.locations.total / this.MAX_LOCATIONS) * 100)}% full`,
        );
        recommendations.push(
          "Consider increasing MAX_LOCATIONS or implementing cleanup",
        );
      }

      if (stats.locations.averageAge > 7 * 24 * 60 * 60 * 1000) {
        // 7 days
        issues.push("Location cache contains very old data");
        recommendations.push("Consider reducing cache retention period");
      }

      // Check ride cache
      if (stats.rides.total > this.MAX_RIDES * 0.9) {
        issues.push(
          `Ride cache is ${Math.round((stats.rides.total / this.MAX_RIDES) * 100)}% full`,
        );
        recommendations.push(
          "Consider increasing MAX_RIDES or implementing cleanup",
        );
      }

      // Check total size
      if (stats.totalSize > 5 * 1024 * 1024) {
        // 5MB
        issues.push(
          `Cache size is ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`,
        );
        recommendations.push(
          "Consider implementing cache compression or size limits",
        );
      }

      return {
        isHealthy: issues.length === 0,
        issues,
        recommendations,
      };
    } catch (error) {
      console.error("[CriticalDataCache] Failed to check cache health:", error);
      return {
        isHealthy: false,
        issues: ["Failed to check cache health"],
        recommendations: ["Check cache implementation"],
      };
    }
  }

  // Performance monitoring
  private performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    avgResponseTime: 0,
    totalOperations: 0,
  };

  private recordOperation(duration: number, isHit: boolean): void {
    this.performanceMetrics.totalOperations++;

    if (isHit) {
      this.performanceMetrics.cacheHits++;
    } else {
      this.performanceMetrics.cacheMisses++;
    }

    // Update average response time
    this.performanceMetrics.avgResponseTime =
      (this.performanceMetrics.avgResponseTime *
        (this.performanceMetrics.totalOperations - 1) +
        duration) /
      this.performanceMetrics.totalOperations;
  }

  getPerformanceMetrics(): typeof this.performanceMetrics & {
    hitRate: number;
    totalRequests: number;
  } {
    const hitRate =
      this.performanceMetrics.totalOperations > 0
        ? this.performanceMetrics.cacheHits /
          this.performanceMetrics.totalOperations
        : 0;

    return {
      ...this.performanceMetrics,
      hitRate,
      totalRequests: this.performanceMetrics.totalOperations,
    };
  }

  resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
      totalOperations: 0,
    };
    console.log("[CriticalDataCache] 📊 Performance metrics reset");
  }
}

// Singleton instance
export const criticalDataCache = CriticalDataCache.getInstance();
