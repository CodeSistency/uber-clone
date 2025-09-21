import { fetchAPI } from "@/lib/fetch";

// Types for Driver Service
export interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  dateOfBirth: Date;
  licenseNumber: string;
  licenseExpiry: Date;
  insuranceProvider: string;
  insuranceExpiry: Date;
  vehicleRegistration: string;
  registrationExpiry: Date;
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected" | "expired";
  joinedDate: Date;
  totalRides: number;
  totalEarnings: number;
  averageRating: number;
}

export interface DriverStatus {
  isOnline: boolean;
  isAvailable: boolean;
  lastOnlineTime: Date | null;
  totalOnlineTime: number;
  connectionHistory: ConnectionEvent[];
}

export interface ConnectionEvent {
  id: string;
  timestamp: Date;
  action: "connect" | "disconnect";
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  heading?: number;
  speed?: number;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerRating: number;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedFare: number;
  estimatedDuration: number;
  estimatedDistance: number;
  requestedAt: Date;
  expiresAt: Date;
  serviceType: string;
  specialRequests?: string[];
}

export interface ActiveRide {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  passengerRating: number;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status:
    | "accepted"
    | "arriving"
    | "arrived"
    | "in_progress"
    | "completed"
    | "cancelled";
  acceptedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  fare: number;
  distance: number;
  duration: number;
  route?: {
    coordinates: { latitude: number; longitude: number }[];
    instructions: string[];
  };
}

export class DriverService {
  // Profile Management
  async getProfile(): Promise<DriverProfile> {
    try {
      console.log("[DriverService] Fetching driver profile");
      const response = await fetchAPI("driver/profile", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[DriverService] Error fetching profile:", error);
      throw error;
    }
  }

  async updateProfile(updates: Partial<DriverProfile>): Promise<DriverProfile> {
    try {
      console.log("[DriverService] Updating driver profile:", updates);
      const response = await fetchAPI("driver/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[DriverService] Error updating profile:", error);
      throw error;
    }
  }

  // Status Management
  async getStatus(): Promise<DriverStatus> {
    try {
      console.log("[DriverService] Fetching driver status");
      const response = await fetchAPI("driver/status", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[DriverService] Error fetching status:", error);
      throw error;
    }
  }

  async goOnline(): Promise<void> {
    try {
      console.log("[DriverService] Going online");
      await fetchAPI("driver/online", {
        method: "POST",
        requiresAuth: true,
      });
    } catch (error) {
      console.error("[DriverService] Error going online:", error);
      throw error;
    }
  }

  async goOffline(): Promise<void> {
    try {
      console.log("[DriverService] Going offline");
      await fetchAPI("driver/offline", {
        method: "POST",
        requiresAuth: true,
      });
    } catch (error) {
      console.error("[DriverService] Error going offline:", error);
      throw error;
    }
  }

  // Location Management
  async updateLocation(location: DriverLocation): Promise<void> {
    try {
      console.log("[DriverService] Updating driver location:", location);
      await fetchAPI("driver/location", {
        method: "POST",
        body: JSON.stringify(location),
        requiresAuth: true,
      });
    } catch (error) {
      console.error("[DriverService] Error updating location:", error);
      throw error;
    }
  }

  // Ride Management
  async getRideRequests(): Promise<RideRequest[]> {
    try {
      console.log("[DriverService] Fetching ride requests");
      const response = await fetchAPI("driver/ride-requests", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[DriverService] Error fetching ride requests:", error);
      throw error;
    }
  }

  async acceptRideRequest(rideId: string): Promise<ActiveRide> {
    try {
      console.log("[DriverService] Accepting ride request:", rideId);
      const response = await fetchAPI(`driver/ride-requests/${rideId}/accept`, {
        method: "POST",
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[DriverService] Error accepting ride request:", error);
      throw error;
    }
  }

  async rejectRideRequest(rideId: string, reason?: string): Promise<void> {
    try {
      console.log("[DriverService] Rejecting ride request:", rideId, reason);
      await fetchAPI(`driver/ride-requests/${rideId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        requiresAuth: true,
      });
    } catch (error) {
      console.error("[DriverService] Error rejecting ride request:", error);
      throw error;
    }
  }

  async getActiveRide(): Promise<ActiveRide | null> {
    try {
      console.log("[DriverService] Fetching active ride");
      const response = await fetchAPI("driver/active-ride", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[DriverService] Error fetching active ride:", error);
      throw error;
    }
  }

  async updateRideStatus(
    rideId: string,
    status: ActiveRide["status"],
  ): Promise<ActiveRide> {
    try {
      console.log("[DriverService] Updating ride status:", rideId, status);
      const response = await fetchAPI(`driver/rides/${rideId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[DriverService] Error updating ride status:", error);
      throw error;
    }
  }

  async completeRide(rideId: string): Promise<ActiveRide> {
    try {
      console.log("[DriverService] Completing ride:", rideId);
      const response = await fetchAPI(`driver/rides/${rideId}/complete`, {
        method: "POST",
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[DriverService] Error completing ride:", error);
      throw error;
    }
  }

  async cancelRide(rideId: string, reason: string): Promise<void> {
    try {
      console.log("[DriverService] Cancelling ride:", rideId, reason);
      await fetchAPI(`driver/rides/${rideId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        requiresAuth: true,
      });
    } catch (error) {
      console.error("[DriverService] Error cancelling ride:", error);
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
      console.log("[DriverService] Setting destination filter:", destination);
      await fetchAPI("driver/destination-filter", {
        method: "POST",
        body: JSON.stringify(destination),
        requiresAuth: true,
      });
    } catch (error) {
      console.error("[DriverService] Error setting destination filter:", error);
      throw error;
    }
  }

  async clearDestinationFilter(): Promise<void> {
    try {
      console.log("[DriverService] Clearing destination filter");
      await fetchAPI("driver/destination-filter", {
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      console.error(
        "[DriverService] Error clearing destination filter:",
        error,
      );
      throw error;
    }
  }

  // Service Types
  async getAvailableServiceTypes(): Promise<string[]> {
    try {
      console.log("[DriverService] Fetching available service types");
      const response = await fetchAPI("driver/service-types", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[DriverService] Error fetching service types:", error);
      throw error;
    }
  }

  async updateServiceTypes(serviceTypes: string[]): Promise<void> {
    try {
      console.log("[DriverService] Updating service types:", serviceTypes);
      await fetchAPI("driver/service-types", {
        method: "PUT",
        body: JSON.stringify({ serviceTypes }),
        requiresAuth: true,
      });
    } catch (error) {
      console.error("[DriverService] Error updating service types:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const driverService = new DriverService();
