import { jest } from "@jest/globals";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Import after mocking
import { CriticalDataCache } from "@/lib/cache/CriticalDataCache";

describe("CriticalDataCache", () => {
  let cache: CriticalDataCache;
  let mockAsyncStorage: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance
    (CriticalDataCache as any).instance = null;

    cache = CriticalDataCache.getInstance();
    mockAsyncStorage = require("@react-native-async-storage/async-storage");
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = CriticalDataCache.getInstance();
      const instance2 = CriticalDataCache.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("Location Caching", () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await cache.initializeCache();
    });

    it("should cache new location", async () => {
      const location = {
        latitude: 40.7128,
        longitude: -74.006,
        address: "New York, NY",
        formattedAddress: "New York, NY, USA",
        source: "search" as const,
      };

      const result = await cache.cacheLocation(location);

      expect(result).toBe("New York, NY");
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should update existing location frequency", async () => {
      const location1 = {
        latitude: 40.7128,
        longitude: -74.006,
        address: "New York, NY",
        formattedAddress: "New York, NY, USA",
        source: "search" as const,
      };

      const location2 = {
        latitude: 40.7128,
        longitude: -74.006,
        address: "New York, NY",
        formattedAddress: "New York, NY, USA",
        source: "search" as const,
      };

      // Cache same location twice
      await cache.cacheLocation(location1);
      await cache.cacheLocation(location2);

      const locations = await cache.getCachedLocations();
      expect(locations[0].frequency).toBe(2);
    });

    it("should respect maximum locations limit", async () => {
      // Mock existing locations
      const existingLocations = Array.from({ length: 200 }, (_, i) => ({
        id: `loc_${i}`,
        latitude: 40.7128 + i * 0.001,
        longitude: -74.006 + i * 0.001,
        address: `Location ${i}`,
        formattedAddress: `Location ${i}, USA`,
        source: "search" as const,
        timestamp: Date.now(),
        frequency: 1,
        lastUsed: Date.now(),
      }));

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingLocations),
      );

      await cache.initializeCache();

      // Add one more location (should keep 200 max)
      await cache.cacheLocation({
        latitude: 41.7128,
        longitude: -75.006,
        address: "New Location",
        formattedAddress: "New Location, USA",
        source: "search" as const,
      });

      const locations = await cache.getCachedLocations();
      expect(locations).toHaveLength(200);
    });

    it("should search locations by query", async () => {
      await cache.cacheLocation({
        latitude: 40.7128,
        longitude: -74.006,
        address: "New York City",
        formattedAddress: "New York City, NY, USA",
        source: "search" as const,
      });

      await cache.cacheLocation({
        latitude: 34.0522,
        longitude: -118.2437,
        address: "Los Angeles",
        formattedAddress: "Los Angeles, CA, USA",
        source: "search" as const,
      });

      const results = await cache.searchLocations("New York");
      expect(results).toHaveLength(1);
      expect(results[0].address).toContain("New York");
    });

    it("should rank search results by relevance", async () => {
      await cache.cacheLocation({
        latitude: 40.7128,
        longitude: -74.006,
        address: "New York City Center",
        formattedAddress: "New York City Center, NY, USA",
        source: "search" as const,
      });

      await cache.cacheLocation({
        latitude: 40.7589,
        longitude: -73.9851,
        address: "Times Square, New York",
        formattedAddress: "Times Square, New York, NY, USA",
        source: "search" as const,
      });

      // Manually update frequency for testing
      const locations = await cache.getCachedLocations();
      if (locations.length >= 2) {
        locations[0].frequency = 5;
        locations[1].frequency = 10;
      }

      const results = await cache.searchLocations("New York");
      expect(results[0].address).toBe("Times Square, New York"); // Higher frequency first
    });
  });

  describe("Ride Caching", () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await cache.initializeCache();
    });

    it("should cache new ride", async () => {
      const ride = {
        ride_id: 123,
        origin_address: "Origin",
        destination_address: "Destination",
        origin_latitude: 40.7128,
        origin_longitude: -74.006,
        destination_latitude: 40.7589,
        destination_longitude: -73.9851,
        fare_price: 25.5,
        ride_time: 1200,
        payment_status: "paid",
        created_at: new Date().toISOString(),
        status: "completed",
        driver_id: 456,
        user_id: 789,
      };

      await cache.cacheRide(ride);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should update existing ride", async () => {
      const ride = {
        ride_id: 123,
        origin_address: "Origin",
        destination_address: "Destination",
        origin_latitude: 40.7128,
        origin_longitude: -74.006,
        destination_latitude: 40.7589,
        destination_longitude: -73.9851,
        fare_price: 25.5,
        ride_time: 1200,
        payment_status: "paid",
        created_at: new Date().toISOString(),
        status: "completed",
        driver_id: 456,
        user_id: 789,
      };

      // Cache twice
      await cache.cacheRide(ride);
      await cache.cacheRide({ ...ride, fare_price: 30.0 });

      const rides = await cache.getCachedRides();
      expect(rides).toHaveLength(1);
      expect(rides[0].fare_price).toBe(30.0);
    });

    it("should get rides sorted by recency", async () => {
      const now = Date.now();

      await cache.cacheRide({
        ride_id: 1,
        origin_address: "Origin 1",
        destination_address: "Destination 1",
        origin_latitude: 40.7128,
        origin_longitude: -74.006,
        destination_latitude: 40.7589,
        destination_longitude: -73.9851,
        fare_price: 25.5,
        ride_time: 1200,
        payment_status: "paid",
        created_at: new Date(now - 2000).toISOString(),
        status: "completed",
        driver_id: 456,
        user_id: 789,
      });

      await cache.cacheRide({
        ride_id: 2,
        origin_address: "Origin 2",
        destination_address: "Destination 2",
        origin_latitude: 40.7128,
        origin_longitude: -74.006,
        destination_latitude: 40.7589,
        destination_longitude: -73.9851,
        fare_price: 25.5,
        ride_time: 1200,
        payment_status: "paid",
        created_at: new Date(now - 1000).toISOString(),
        status: "completed",
        driver_id: 456,
        user_id: 789,
      });

      const rides = await cache.getCachedRides();
      expect(rides[0].ride_id).toBe(2); // More recent first
    });
  });

  describe("Driver Caching", () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await cache.initializeCache();
    });

    it("should cache new driver", async () => {
      const driver = {
        driver_id: 123,
        first_name: "John",
        last_name: "Doe",
        profile_image_url: "https://example.com/profile.jpg",
        car_image_url: "https://example.com/car.jpg",
        car_seats: 4,
        rating: 4.8,
      };

      await cache.cacheDriver(driver);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should get drivers sorted by last seen", async () => {
      const now = Date.now();

      await cache.cacheDriver({
        driver_id: 1,
        first_name: "Driver 1",
        last_name: "One",
        profile_image_url: "https://example.com/1.jpg",
        car_image_url: "https://example.com/car1.jpg",
        car_seats: 4,
        rating: 4.8,
      });

      await cache.cacheDriver({
        driver_id: 2,
        first_name: "Driver 2",
        last_name: "Two",
        profile_image_url: "https://example.com/2.jpg",
        car_image_url: "https://example.com/car2.jpg",
        car_seats: 4,
        rating: 4.8,
      });

      const drivers = await cache.getCachedDrivers();
      expect(drivers).toHaveLength(2);
      expect(drivers[0].driver_id).toBe(2); // More recent first
    });
  });

  describe("Favorites Management", () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await cache.initializeCache();
    });

    it("should add location to favorites", async () => {
      const location = {
        id: "loc_1",
        latitude: 40.7128,
        longitude: -74.006,
        address: "New York",
        formattedAddress: "New York, NY, USA",
        source: "search" as const,
        timestamp: Date.now(),
        frequency: 1,
        lastUsed: Date.now(),
      };

      await cache.addToFavorites(location);

      const favorites = await cache.getFavorites();
      expect(favorites).toHaveLength(1);
      expect(favorites[0].address).toBe("New York");
    });

    it("should not add duplicate to favorites", async () => {
      const location = {
        id: "loc_1",
        latitude: 40.7128,
        longitude: -74.006,
        address: "New York",
        formattedAddress: "New York, NY, USA",
        source: "search" as const,
        timestamp: Date.now(),
        frequency: 1,
        lastUsed: Date.now(),
      };

      await cache.addToFavorites(location);
      await cache.addToFavorites(location); // Add again

      const favorites = await cache.getFavorites();
      expect(favorites).toHaveLength(1);
    });

    it("should remove from favorites", async () => {
      const location = {
        id: "loc_1",
        latitude: 40.7128,
        longitude: -74.006,
        address: "New York",
        formattedAddress: "New York, NY, USA",
        source: "search" as const,
        timestamp: Date.now(),
        frequency: 1,
        lastUsed: Date.now(),
      };

      await cache.addToFavorites(location);
      await cache.removeFromFavorites("loc_1");

      const favorites = await cache.getFavorites();
      expect(favorites).toHaveLength(0);
    });
  });

  describe("Cache Statistics", () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await cache.initializeCache();
    });

    it("should calculate correct statistics", async () => {
      const now = Date.now();

      // Add some test data
      await cache.cacheLocation({
        latitude: 40.7128,
        longitude: -74.006,
        address: "New York",
        formattedAddress: "New York, NY, USA",
        source: "search" as const,
      });

      await cache.cacheRide({
        ride_id: 1,
        origin_address: "Origin",
        destination_address: "Destination",
        origin_latitude: 40.7128,
        origin_longitude: -74.006,
        destination_latitude: 40.7589,
        destination_longitude: -73.9851,
        fare_price: 25.5,
        ride_time: 1200,
        payment_status: "paid",
        created_at: new Date(now - 2000).toISOString(),
        status: "completed",
        driver_id: 456,
        user_id: 789,
      });

      const stats = await cache.getStats();

      expect(stats.locations.total).toBe(1);
      expect(stats.rides.total).toBe(1);
      expect(stats.locations.bySource.search).toBe(1);
    });

    it("should return empty stats for empty cache", async () => {
      const stats = await cache.getStats();

      expect(stats.locations.total).toBe(0);
      expect(stats.rides.total).toBe(0);
      expect(stats.drivers.total).toBe(0);
    });
  });

  describe("Cache Health Check", () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await cache.initializeCache();
    });

    it("should report healthy cache", async () => {
      const health = await cache.getCacheHealth();

      expect(health.isHealthy).toBe(true);
      expect(health.issues).toHaveLength(0);
      expect(health.recommendations).toHaveLength(0);
    });

    it("should detect full cache", async () => {
      // Mock full cache
      const fullLocations = Array.from({ length: 200 }, (_, i) => ({
        id: `loc_${i}`,
        latitude: 40.7128 + i * 0.001,
        longitude: -74.006 + i * 0.001,
        address: `Location ${i}`,
        formattedAddress: `Location ${i}, USA`,
        source: "search" as const,
        timestamp: Date.now(),
        frequency: 1,
        lastUsed: Date.now(),
      }));

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(fullLocations))
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await cache.initializeCache();

      const health = await cache.getCacheHealth();

      expect(health.isHealthy).toBe(false);
      expect(health.issues.length).toBeGreaterThan(0);
    });
  });

  describe("Performance Monitoring", () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await cache.initializeCache();
    });

    it("should track performance metrics", async () => {
      const initialMetrics = cache.getPerformanceMetrics();

      await cache.cacheLocation({
        latitude: 40.7128,
        longitude: -74.006,
        address: "Test Location",
        formattedAddress: "Test Location, USA",
        source: "search" as const,
      });

      const metrics = cache.getPerformanceMetrics();

      expect(metrics.totalRequests).toBe(initialMetrics.totalRequests + 1);
      expect(metrics.cacheMisses).toBe(initialMetrics.cacheMisses + 1);
    });

    it("should reset performance metrics", () => {
      cache.resetPerformanceMetrics();

      const metrics = cache.getPerformanceMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
    });
  });

  describe("Bulk Operations", () => {
    beforeEach(async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await cache.initializeCache();
    });

    it("should bulk cache locations", async () => {
      const locations = [
        {
          latitude: 40.7128,
          longitude: -74.006,
          address: "New York",
          formattedAddress: "New York, NY, USA",
          source: "search" as const,
        },
        {
          latitude: 34.0522,
          longitude: -118.2437,
          address: "Los Angeles",
          formattedAddress: "Los Angeles, CA, USA",
          source: "search" as const,
        },
      ];

      await cache.bulkCacheLocations(locations);

      const cachedLocations = await cache.getCachedLocations();
      expect(cachedLocations).toHaveLength(2);
    });

    it("should bulk cache rides", async () => {
      const rides = [
        {
          ride_id: 1,
          origin_address: "Origin 1",
          destination_address: "Destination 1",
          origin_latitude: 40.7128,
          origin_longitude: -74.006,
          destination_latitude: 40.7589,
          destination_longitude: -73.9851,
          fare_price: 25.5,
          ride_time: 1200,
          payment_status: "paid",
          created_at: new Date().toISOString(),
          status: "completed",
          driver_id: 456,
          user_id: 789,
        },
        {
          ride_id: 2,
          origin_address: "Origin 2",
          destination_address: "Destination 2",
          origin_latitude: 40.7128,
          origin_longitude: -74.006,
          destination_latitude: 40.7589,
          destination_longitude: -73.9851,
          fare_price: 30.0,
          ride_time: 1500,
          payment_status: "paid",
          created_at: new Date().toISOString(),
          status: "completed",
          driver_id: 456,
          user_id: 789,
        },
      ];

      await cache.bulkCacheRides(rides);

      const cachedRides = await cache.getCachedRides();
      expect(cachedRides).toHaveLength(2);
    });
  });

  describe("Cleanup Operations", () => {
    it("should cleanup expired data", async () => {
      const oldTime = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31 days ago

      const oldLocation = {
        id: "loc_old",
        latitude: 40.7128,
        longitude: -74.006,
        address: "Old Location",
        formattedAddress: "Old Location, USA",
        source: "search" as const,
        timestamp: oldTime,
        frequency: 1,
        lastUsed: oldTime,
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([oldLocation]));

      await cache.initializeCache();

      // Should have cleaned up the old location
      const locations = await cache.getCachedLocations();
      expect(locations).toHaveLength(0);
    });

    it("should clear all cache", async () => {
      await cache.cacheLocation({
        latitude: 40.7128,
        longitude: -74.006,
        address: "Test Location",
        formattedAddress: "Test Location, USA",
        source: "search" as const,
      });

      await cache.clearAllCache();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledTimes(4); // 4 cache keys
    });
  });
});
