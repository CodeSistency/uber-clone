import { fetchAPI } from "@/lib/fetch";
import type {
  Vehicle,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleVerificationStatus,
} from "@/types/driver";

export class VehicleService {
  // Get all vehicles for the current driver
  async getVehicles(): Promise<Vehicle[]> {
    try {
      
      const response = await fetchAPI("driver/vehicles", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Get a specific vehicle by ID
  async getVehicle(vehicleId: string): Promise<Vehicle> {
    try {
      
      const response = await fetchAPI(`driver/vehicles/${vehicleId}`, {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Create a new vehicle
  async createVehicle(vehicleData: CreateVehicleRequest): Promise<Vehicle> {
    try {
      
      const response = await fetchAPI("driver/vehicles", {
        method: "POST",
        body: JSON.stringify(vehicleData),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Update an existing vehicle
  async updateVehicle(
    vehicleId: string,
    updates: UpdateVehicleRequest,
  ): Promise<Vehicle> {
    try {
      
      const response = await fetchAPI(`driver/vehicles/${vehicleId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Delete a vehicle
  async deleteVehicle(vehicleId: string): Promise<void> {
    try {
      
      await fetchAPI(`driver/vehicles/${vehicleId}`, {
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  // Activate a vehicle (make it available for rides)
  async activateVehicle(vehicleId: string): Promise<Vehicle> {
    try {
      
      const response = await fetchAPI(`driver/vehicles/${vehicleId}/activate`, {
        method: "POST",
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Deactivate a vehicle
  async deactivateVehicle(vehicleId: string): Promise<Vehicle> {
    try {
      
      const response = await fetchAPI(
        `driver/vehicles/${vehicleId}/deactivate`,
        {
          method: "POST",
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Upload vehicle photos
  async uploadVehiclePhotos(
    vehicleId: string,
    photos: File[] | string[],
  ): Promise<Vehicle> {
    try {
      

      const formData = new FormData();

      // Handle both File objects and base64 strings
      if (photos.length > 0 && photos[0] instanceof File) {
        photos.forEach((photo, index) => {
          formData.append(`photos`, photo);
        });
      } else {
        // For base64 strings or URLs, send as JSON
        formData.append("photos", JSON.stringify(photos));
      }

      const response = await fetchAPI(`driver/vehicles/${vehicleId}/photos`, {
        method: "POST",
        body: formData,
        requiresAuth: true,
        // Note: Don't set Content-Type header for FormData
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Get vehicle verification status
  async getVehicleVerificationStatus(
    vehicleId: string,
  ): Promise<VehicleVerificationStatus> {
    try {
      
      const response = await fetchAPI(
        `driver/vehicles/${vehicleId}/verification`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Set default vehicle for the driver
  async setDefaultVehicle(vehicleId: string): Promise<void> {
    try {
      
      await fetchAPI("driver/vehicles/default", {
        method: "PUT",
        body: JSON.stringify({ vehicleId }),
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  // Get vehicle maintenance history
  async getVehicleMaintenanceHistory(vehicleId: string): Promise<any[]> {
    try {
      
      const response = await fetchAPI(
        `driver/vehicles/${vehicleId}/maintenance`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Report vehicle issue
  async reportVehicleIssue(
    vehicleId: string,
    issue: {
      type: "mechanical" | "accident" | "cleanliness" | "other";
      description: string;
      severity: "low" | "medium" | "high" | "critical";
      photos?: string[];
    },
  ): Promise<void> {
    try {
      
      await fetchAPI(`driver/vehicles/${vehicleId}/issues`, {
        method: "POST",
        body: JSON.stringify(issue),
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }
}

// Export singleton instance
export const vehicleService = new VehicleService();
