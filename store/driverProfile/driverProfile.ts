import { create } from "zustand";
import type {
  DriverProfile,
  Vehicle,
  Document,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  DocumentType,
  DocumentStatus,
} from "@/types/driver";
import { driverService } from "@/app/services/driverService";
import { vehicleService } from "@/app/services/vehicleService";
import { documentService } from "@/app/services/documentService";

interface DriverProfileState {
  // Estado del perfil
  profile: DriverProfile | null;
  vehicles: Vehicle[];
  documents: Document[];

  // Estados de carga
  isLoading: boolean;
  error: string | null;

  // Acciones del perfil
  setProfile: (profile: DriverProfile | null) => void;
  updateProfile: (updates: Partial<DriverProfile>) => Promise<void>;
  fetchProfile: () => Promise<void>;

  // Acciones de vehículos
  setVehicles: (vehicles: Vehicle[]) => void;
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicleData: CreateVehicleRequest) => Promise<void>;
  updateVehicle: (id: string, updates: UpdateVehicleRequest) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // Acciones de documentos
  setDocuments: (documents: Document[]) => void;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (type: DocumentType, file: File | string, description?: string) => Promise<void>;
  updateDocumentStatus: (id: string, status: DocumentStatus) => void;
  deleteDocument: (id: string) => Promise<void>;

  // Estados de UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useDriverProfileStore = create<DriverProfileState>((set, get) => ({
  // Estado inicial
  profile: null,
  vehicles: [],
  documents: [],
  isLoading: false,
  error: null,

  // Acciones del perfil
  setProfile: (profile) => {
    console.log("[DriverProfileStore] setProfile called with:", profile?.id);
    set({ profile });
  },

  updateProfile: async (updates) => {
    const state = get();
    console.log("[DriverProfileStore] updateProfile called with:", updates);

    try {
      state.setLoading(true);
      state.setError(null);

      // Real API call using driverService
      const response = await driverService.updateProfile(updates);

      // Validate response structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format from update profile API');
      }

      // Update local state with API response
      const updatedProfile = { ...state.profile, ...response } as DriverProfile;
      state.setProfile(updatedProfile);

      console.log("[DriverProfileStore] Profile updated successfully via API");
    } catch (error: any) {
      console.error("[DriverProfileStore] Error updating profile:", error);

      // Enhanced error handling with specific messages
      let errorMessage = "Failed to update profile";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.statusCode === 400) {
        errorMessage = "Invalid profile data provided";
      } else if (error.statusCode === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error.statusCode === 403) {
        errorMessage = "You don't have permission to update this profile";
      } else if (error.statusCode >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      state.setError(errorMessage);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  fetchProfile: async () => {
    const state = get();
    console.log("[DriverProfileStore] fetchProfile called");

    try {
      state.setLoading(true);
      state.setError(null);

      // Call real API
      const profileData = await driverService.getProfile();

      // Transform API response to match our DriverProfile type
      const profile: DriverProfile = {
        id: profileData.id,
        userId: profileData.id, // Assuming userId is the same as driver id
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        profilePicture: undefined,
        dateOfBirth: new Date(), // Default value
        licenseNumber: "", // Default value
        licenseExpiry: new Date(), // Default value
        insuranceProvider: "", // Default value
        insuranceExpiry: new Date(), // Default value
        vehicleRegistration: "", // Default value
        registrationExpiry: new Date(), // Default value
        isVerified: profileData.isVerified,
        verificationStatus: profileData.isVerified ? "approved" : "pending",
        joinedDate: profileData.joinedDate,
        totalRides: profileData.totalRides,
        totalEarnings: profileData.totalEarnings || 0,
        averageRating: profileData.averageRating,
        status: profileData.isVerified ? "active" : "inactive",
        isOnline: false, // This would come from status endpoint
        currentLocation: profileData.currentLocation || {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
          timestamp: new Date(),
          address: ""
        }
      };

      state.setProfile(profile);
      console.log("[DriverProfileStore] Profile fetched successfully");
    } catch (error: any) {
      console.error("[DriverProfileStore] Error fetching profile:", error);
      state.setError(error.message || "Failed to fetch profile");

      // Fallback to mock data for development
      console.log("[DriverProfileStore] Using fallback mock data");
      const mockProfile: DriverProfile = {
        id: "driver_123",
        userId: "user_123",
        firstName: "Carlos",
        lastName: "Rodriguez",
        email: "carlos@example.com",
        phone: "+1234567890",
        profilePicture: undefined,
        dateOfBirth: new Date("1985-05-15"),
        licenseNumber: "DL123456789",
        licenseExpiry: new Date("2025-12-31"),
        insuranceProvider: "State Farm",
        insuranceExpiry: new Date("2024-12-31"),
        vehicleRegistration: "ABC123",
        registrationExpiry: new Date("2024-12-31"),
        isVerified: true,
        verificationStatus: "approved" as const,
        joinedDate: new Date("2023-01-15"),
        totalRides: 1247,
        totalEarnings: 18765.4,
        averageRating: 4.8,
        status: "active" as const,
        isOnline: true,
        currentLocation: {
          latitude: 25.7617,
          longitude: -80.1918,
          accuracy: 10,
          timestamp: new Date(),
          address: "Miami, FL"
        }
      };
      state.setProfile(mockProfile);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  // Acciones de vehículos
  setVehicles: (vehicles) => {
    console.log("[DriverProfileStore] setVehicles called with:", vehicles.length, "vehicles");
    set({ vehicles });
  },

  fetchVehicles: async () => {
    const state = get();
    console.log("[DriverProfileStore] fetchVehicles called");

    try {
      state.setLoading(true);
      state.setError(null);

      // Call real API
      const vehiclesData = await vehicleService.getVehicles();

      // Transform API response if needed
      const vehicles: Vehicle[] = vehiclesData.map(vehicle => ({
        id: vehicle.id,
        driverId: vehicle.driverId,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
        color: vehicle.color,
        seats: vehicle.seats,
        status: vehicle.status,
        insurancePolicyNumber: vehicle.insurancePolicyNumber,
        insuranceProvider: vehicle.insuranceProvider,
        insuranceExpiry: vehicle.insuranceExpiry,
        registrationNumber: vehicle.registrationNumber,
        registrationExpiry: vehicle.registrationExpiry,
        vehiclePhotos: vehicle.vehiclePhotos,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
      }));

      state.setVehicles(vehicles);
      console.log("[DriverProfileStore] Vehicles fetched successfully");
    } catch (error: any) {
      console.error("[DriverProfileStore] Error fetching vehicles:", error);
      state.setError(error.message || "Failed to fetch vehicles");

      // Fallback to empty array for development
      state.setVehicles([]);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  addVehicle: async (vehicleData: CreateVehicleRequest) => {
    const state = get();
    console.log("[DriverProfileStore] addVehicle called with:", vehicleData);

    try {
      state.setLoading(true);
      state.setError(null);

      // Call real API
      const newVehicle = await vehicleService.createVehicle(vehicleData);

      // Transform API response if needed
      const vehicle: Vehicle = {
        id: newVehicle.id,
        driverId: newVehicle.driverId,
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year,
        licensePlate: newVehicle.licensePlate,
        color: newVehicle.color,
        seats: newVehicle.seats,
        status: newVehicle.status,
        insurancePolicyNumber: newVehicle.insurancePolicyNumber,
        insuranceProvider: newVehicle.insuranceProvider,
        insuranceExpiry: newVehicle.insuranceExpiry,
        registrationNumber: newVehicle.registrationNumber,
        registrationExpiry: newVehicle.registrationExpiry,
        vehiclePhotos: newVehicle.vehiclePhotos,
        createdAt: newVehicle.createdAt,
        updatedAt: newVehicle.updatedAt,
      };

      const updatedVehicles = [...state.vehicles, vehicle];
      state.setVehicles(updatedVehicles);

      console.log("[DriverProfileStore] Vehicle added successfully");
    } catch (error: any) {
      console.error("[DriverProfileStore] Error adding vehicle:", error);
      state.setError(error.message || "Failed to add vehicle");

      // Fallback to local creation for development
      console.log("[DriverProfileStore] Using fallback local creation");
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: `vehicle_${Date.now()}`,
        driverId: "current_driver", // This should come from auth
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const updatedVehicles = [...state.vehicles, newVehicle];
      state.setVehicles(updatedVehicles);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  updateVehicle: async (id: string, updates: UpdateVehicleRequest) => {
    const state = get();
    console.log("[DriverProfileStore] updateVehicle called for:", id, "with:", updates);

    try {
      state.setLoading(true);
      state.setError(null);

      // Real API call using vehicleService
      const response = await vehicleService.updateVehicle(id, updates);

      // Validate response
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format from update vehicle API');
      }

      // Optimistic update: Update local state immediately with API response
      const updatedVehicles = state.vehicles.map(vehicle =>
        vehicle.id === id ? response : vehicle
      );

      state.setVehicles(updatedVehicles);
      console.log("[DriverProfileStore] Vehicle updated successfully");
    } catch (error: any) {
      console.error("[DriverProfileStore] Error updating vehicle:", error);

      // Enhanced error handling with specific messages
      let errorMessage = "Failed to update vehicle";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.statusCode === 400) {
        errorMessage = "Invalid vehicle data provided";
      } else if (error.statusCode === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error.statusCode === 403) {
        errorMessage = "You don't have permission to update this vehicle";
      } else if (error.statusCode === 404) {
        errorMessage = "Vehicle not found";
      } else if (error.statusCode >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      state.setError(errorMessage);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  deleteVehicle: async (id) => {
    const state = get();
    console.log("[DriverProfileStore] deleteVehicle called for:", id);

    try {
      state.setLoading(true);
      state.setError(null);

      // Real API call using vehicleService
      await vehicleService.deleteVehicle(id);

      // Remove vehicle from local state after successful API call
      const updatedVehicles = state.vehicles.filter(vehicle => vehicle.id !== id);
      state.setVehicles(updatedVehicles);

      console.log("[DriverProfileStore] Vehicle deleted successfully via API");
    } catch (error: any) {
      console.error("[DriverProfileStore] Error deleting vehicle:", error);

      // Enhanced error handling with specific messages
      let errorMessage = "Failed to delete vehicle";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.statusCode === 400) {
        errorMessage = "Cannot delete vehicle - it may be in use or have active reservations";
      } else if (error.statusCode === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error.statusCode === 403) {
        errorMessage = "You don't have permission to delete this vehicle";
      } else if (error.statusCode === 404) {
        errorMessage = "Vehicle not found";
      } else if (error.statusCode === 409) {
        errorMessage = "Cannot delete vehicle - it has pending documents or payments";
      } else if (error.statusCode >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      state.setError(errorMessage);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  // Acciones de documentos
  setDocuments: (documents) => {
    console.log("[DriverProfileStore] setDocuments called with:", documents.length, "documents");
    set({ documents });
  },

  fetchDocuments: async () => {
    const state = get();
    console.log("[DriverProfileStore] fetchDocuments called");

    try {
      state.setLoading(true);
      state.setError(null);

      // Call real API
      const documentsData = await documentService.getDocuments();

      // Transform API response if needed
      const documents: Document[] = documentsData.map(doc => ({
        id: doc.id,
        driverId: doc.driverId,
        type: doc.type,
        name: doc.name,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        verifiedAt: doc.verifiedAt,
        expiresAt: doc.expiresAt,
        rejectionReason: doc.rejectionReason,
        fileUrl: doc.fileUrl,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        description: doc.description,
        isRequired: doc.isRequired,
        verificationNotes: doc.verificationNotes,
      }));

      state.setDocuments(documents);
      console.log("[DriverProfileStore] Documents fetched successfully");
    } catch (error: any) {
      console.error("[DriverProfileStore] Error fetching documents:", error);
      state.setError(error.message || "Failed to fetch documents");

      // Fallback to empty array for development
      state.setDocuments([]);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  uploadDocument: async (type: DocumentType, file: File | string, description?: string) => {
    const state = get();
    console.log("[DriverProfileStore] uploadDocument called for type:", type);

    try {
      state.setLoading(true);
      state.setError(null);

      // Call real API
      const uploadRequest = {
        type,
        file,
        description,
      };

      const newDocument = await documentService.uploadDocument(uploadRequest);

      // Transform API response if needed
      const document: Document = {
        id: newDocument.id,
        driverId: newDocument.driverId,
        type: newDocument.type,
        name: newDocument.name,
        status: newDocument.status,
        uploadedAt: newDocument.uploadedAt,
        verifiedAt: newDocument.verifiedAt,
        expiresAt: newDocument.expiresAt,
        rejectionReason: newDocument.rejectionReason,
        fileUrl: newDocument.fileUrl,
        fileName: newDocument.fileName,
        fileSize: newDocument.fileSize,
        mimeType: newDocument.mimeType,
        description: newDocument.description,
        isRequired: newDocument.isRequired,
        verificationNotes: newDocument.verificationNotes,
      };

      const updatedDocuments = [...state.documents, document];
      state.setDocuments(updatedDocuments);

      console.log("[DriverProfileStore] Document uploaded successfully");
    } catch (error: any) {
      console.error("[DriverProfileStore] Error uploading document:", error);
      state.setError(error.message || "Failed to upload document");

      // Fallback to local document creation for development
      console.log("[DriverProfileStore] Using fallback local document creation");
      const newDocument: Document = {
        id: `doc_${Date.now()}`,
        driverId: "current_driver",
        type,
        name: `${type.replace('_', ' ').toUpperCase()} Document`,
        status: "pending_review",
        uploadedAt: new Date(),
        isRequired: true,
        description,
      };
      const updatedDocuments = [...state.documents, newDocument];
      state.setDocuments(updatedDocuments);
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  updateDocumentStatus: (id: string, status: DocumentStatus) => {
    console.log("[DriverProfileStore] updateDocumentStatus called for:", id, "status:", status);
    const updatedDocuments = get().documents.map(doc =>
      doc.id === id ? { ...doc, status, updatedAt: new Date().toISOString() } : doc
    );
    set({ documents: updatedDocuments });
  },

  deleteDocument: async (id: string) => {
    const state = get();
    console.log("[DriverProfileStore] deleteDocument called for:", id);

    try {
      state.setLoading(true);
      state.setError(null);

      // Call real API
      await documentService.deleteDocument(id);

      // Remove from local state
      const updatedDocuments = state.documents.filter(doc => doc.id !== id);
      state.setDocuments(updatedDocuments);

      console.log("[DriverProfileStore] Document deleted successfully");
    } catch (error: any) {
      console.error("[DriverProfileStore] Error deleting document:", error);
      state.setError(error.message || "Failed to delete document");
      throw error;
    } finally {
      state.setLoading(false);
    }
  },

  // Estados de UI
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
