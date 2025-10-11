import { fetchAPI } from "@/lib/fetch";
import type {
  DriverProfile,
  DriverStatusData,
  ConnectionEvent,
  DriverLocation,
  RideRequest,
  ActiveRide,
} from "@/types/driver";

// Types are now imported from @/types/driver

export class DriverService {
  // Profile Management
  async getProfile(): Promise<DriverProfile> {
    try {
      
      const response = await fetchAPI("driver/profile", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async updateProfile(updates: Partial<DriverProfile>): Promise<DriverProfile> {
    try {
      
      const response = await fetchAPI("driver/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Status Management
  async getStatus(): Promise<
    DriverStatusData & { isDriver: boolean; driverRole?: string }
  > {
    try {
      
      const response = await fetchAPI("driver/status", {
        requiresAuth: true,
      });
      // Add isDriver field based on response (assuming backend returns driver info if user is a driver)
      const isDriver =
        response &&
        (response.id || response.driverId || response.status === "active");
      return {
        ...response,
        isDriver: !!isDriver,
        driverRole: isDriver ? "driver" : "customer",
      };
    } catch (error) {
      
      // Return default status for non-drivers
      return {
        driverId: "unknown",
        isOnline: false,
        isAvailable: false,
        status: "offline",
        lastSeen: new Date(),
        lastOnlineTime: undefined,
        totalOnlineTime: 0,
        connectionHistory: [],
        isDriver: false,
        driverRole: "customer",
      };
    }
  }

  async goOnline(): Promise<void> {
    try {
      
      await fetchAPI("driver/online", {
        method: "POST",
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  async goOffline(): Promise<void> {
    try {
      
      await fetchAPI("driver/offline", {
        method: "POST",
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  // Location Management
  async updateLocation(location: DriverLocation): Promise<void> {
    try {
      
      await fetchAPI("driver/location", {
        method: "POST",
        body: JSON.stringify(location),
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  // Ride Management
  async getRideRequests(): Promise<RideRequest[]> {
    try {
      
      const response = await fetchAPI("driver/ride-requests", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async acceptRideRequest(rideId: string): Promise<ActiveRide> {
    try {
      
      const response = await fetchAPI(`driver/ride-requests/${rideId}/accept`, {
        method: "POST",
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async rejectRideRequest(rideId: string, reason?: string): Promise<void> {
    try {
      
      await fetchAPI(`driver/ride-requests/${rideId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  async getActiveRide(): Promise<ActiveRide | null> {
    try {
      
      const response = await fetchAPI("driver/active-ride", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async updateRideStatus(
    rideId: string,
    status: ActiveRide["status"],
  ): Promise<ActiveRide> {
    try {
      
      const response = await fetchAPI(`driver/rides/${rideId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async completeRide(rideId: string): Promise<ActiveRide> {
    try {
      
      const response = await fetchAPI(`driver/rides/${rideId}/complete`, {
        method: "POST",
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async cancelRide(rideId: string, reason: string): Promise<void> {
    try {
      
      await fetchAPI(`driver/rides/${rideId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  // Destination Filter
  async setDestinationFilter(destination: {
    latitude: number;
    longitude: number;
    address: string;
  }): Promise<void> {
    try {
      
      await fetchAPI("driver/destination-filter", {
        method: "POST",
        body: JSON.stringify(destination),
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  async clearDestinationFilter(): Promise<void> {
    try {
      
      await fetchAPI("driver/destination-filter", {
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  // Service Types
  async getAvailableServiceTypes(): Promise<string[]> {
    try {
      
      const response = await fetchAPI("driver/service-types", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async updateServiceTypes(serviceTypes: string[]): Promise<void> {
    try {
      
      await fetchAPI("driver/service-types", {
        method: "PUT",
        body: JSON.stringify({ serviceTypes }),
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }
}

// Export singleton instance
export const driverService = new DriverService();
