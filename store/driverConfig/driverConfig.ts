import { create } from "zustand";

// Types for Driver Configuration
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

export interface DriverDocument {
  id: string;
  type:
    | "license"
    | "insurance"
    | "registration"
    | "background_check"
    | "vehicle_inspection";
  name: string;
  fileUrl: string;
  uploadDate: Date;
  expiryDate?: Date;
  status: "pending" | "approved" | "rejected" | "expired";
  rejectionReason?: string;
  isRequired: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin: string;
  isActive: boolean;
  isDefault: boolean;
  serviceTypes: ServiceType[];
  capacity: number;
  features: VehicleFeature[];
  inspectionDate?: Date;
  inspectionExpiry?: Date;
}

export interface VehicleFeature {
  id: string;
  name: string;
  type: "comfort" | "safety" | "accessibility" | "entertainment";
  isAvailable: boolean;
}

export interface ServiceType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  baseFare: number;
  perMinuteRate: number;
  perMileRate: number;
  minimumFare: number;
  isActive: boolean;
  requirements: {
    minRating?: number;
    vehicleYear?: number;
    vehicleCapacity?: number;
    features?: string[];
  };
}

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  language: string;
  notifications: {
    rideRequests: boolean;
    earnings: boolean;
    promotions: boolean;
    safety: boolean;
    system: boolean;
  };
  sounds: {
    rideRequest: boolean;
    navigation: boolean;
    notifications: boolean;
    volume: number;
  };
  display: {
    mapStyle: "standard" | "satellite" | "hybrid";
    showTraffic: boolean;
    showDemandZones: boolean;
    showPeakHours: boolean;
    zoomLevel: number;
  };
  privacy: {
    shareLocation: boolean;
    shareTripData: boolean;
    analytics: boolean;
  };
}

export interface NavigationSettings {
  defaultApp: "uber" | "waze" | "google_maps";
  voiceGuidance: boolean;
  avoidTolls: boolean;
  avoidHighways: boolean;
  avoidFerries: boolean;
  unitSystem: "metric" | "imperial";
  autoReroute: boolean;
}

export interface SoundSettings {
  rideRequestSound: string;
  navigationSound: string;
  notificationSound: string;
  masterVolume: number;
  vibrationEnabled: boolean;
}

export interface RidePreferences {
  serviceTypes: string[]; // Service type IDs
  petFriendly: boolean;
  womenOnlyMode: boolean;
  maxDistance: number; // in km
  maxWaitTime: number; // in minutes
  preferredAreas: string[];
  avoidAreas: string[];
  autoAccept: boolean;
  autoAcceptRadius: number; // in km
  workingHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
    days: number[]; // 0-6 (Sunday-Saturday)
  };
}

// Driver Config Store Interface
interface DriverConfigStore {
  // State
  profile: DriverProfile | null;
  documents: DriverDocument[];
  vehicles: Vehicle[];
  serviceTypes: ServiceType[];
  appSettings: AppSettings;
  navigationSettings: NavigationSettings;
  soundSettings: SoundSettings;
  ridePreferences: RidePreferences;

  // Loading and Error States
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<DriverProfile>) => Promise<void>;

  // Documents Management
  fetchDocuments: () => Promise<void>;
  uploadDocument: (
    document: Omit<DriverDocument, "id" | "uploadDate" | "status">,
  ) => Promise<void>;
  updateDocument: (
    documentId: string,
    updates: Partial<DriverDocument>,
  ) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;

  // Vehicles Management
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<void>;
  updateVehicle: (
    vehicleId: string,
    updates: Partial<Vehicle>,
  ) => Promise<void>;
  deleteVehicle: (vehicleId: string) => Promise<void>;
  setDefaultVehicle: (vehicleId: string) => Promise<void>;

  // Service Types Management
  fetchServiceTypes: () => Promise<void>;
  updateServiceTypeStatus: (
    serviceTypeId: string,
    isActive: boolean,
  ) => Promise<void>;

  // Settings Management
  updateAppSettings: (settings: Partial<AppSettings>) => Promise<void>;
  updateNavigationSettings: (
    settings: Partial<NavigationSettings>,
  ) => Promise<void>;
  updateSoundSettings: (settings: Partial<SoundSettings>) => Promise<void>;
  updateRidePreferences: (
    preferences: Partial<RidePreferences>,
  ) => Promise<void>;

  // Utility Functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useDriverConfigStore = create<DriverConfigStore>((set, get) => ({
  // Initial State
  profile: {
    id: "driver_123",
    firstName: "Carlos",
    lastName: "Rodriguez",
    email: "carlos.rodriguez@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: new Date("1985-06-15"),
    licenseNumber: "DL123456789",
    licenseExpiry: new Date("2025-12-31"),
    insuranceProvider: "State Farm",
    insuranceExpiry: new Date("2024-12-31"),
    vehicleRegistration: "ABC123",
    registrationExpiry: new Date("2024-12-31"),
    isVerified: true,
    verificationStatus: "approved" as const,
    joinedDate: new Date("2023-01-15"),
    totalRides: 1234,
    totalEarnings: 18765.4,
    averageRating: 4.8,
  },
  documents: [],
  vehicles: [],
  serviceTypes: [],
  appSettings: {
    theme: "auto",
    language: "en",
    notifications: {
      rideRequests: true,
      earnings: true,
      promotions: true,
      safety: true,
      system: true,
    },
    sounds: {
      rideRequest: true,
      navigation: true,
      notifications: true,
      volume: 0.7,
    },
    display: {
      mapStyle: "standard",
      showTraffic: true,
      showDemandZones: true,
      showPeakHours: true,
      zoomLevel: 15,
    },
    privacy: {
      shareLocation: true,
      shareTripData: false,
      analytics: true,
    },
  },
  navigationSettings: {
    defaultApp: "uber",
    voiceGuidance: true,
    avoidTolls: false,
    avoidHighways: false,
    avoidFerries: false,
    unitSystem: "metric",
    autoReroute: true,
  },
  soundSettings: {
    rideRequestSound: "default",
    navigationSound: "default",
    notificationSound: "default",
    masterVolume: 0.7,
    vibrationEnabled: true,
  },
  ridePreferences: {
    serviceTypes: [],
    petFriendly: false,
    womenOnlyMode: false,
    maxDistance: 50,
    maxWaitTime: 10,
    preferredAreas: [],
    avoidAreas: [],
    autoAccept: false,
    autoAcceptRadius: 5,
    workingHours: {
      start: "06:00",
      end: "22:00",
      days: [1, 2, 3, 4, 5, 6, 0], // All days
    },
  },

  // Loading and Error States
  isLoading: false,
  error: null,

  // Actions
  fetchProfile: async () => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockProfile: DriverProfile = {
        id: "driver_001",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        profilePicture: "https://example.com/profile.jpg",
        dateOfBirth: new Date("1985-06-15"),
        licenseNumber: "DL123456789",
        licenseExpiry: new Date("2025-06-15"),
        insuranceProvider: "State Farm",
        insuranceExpiry: new Date("2024-12-31"),
        vehicleRegistration: "REG123456",
        registrationExpiry: new Date("2024-12-31"),
        isVerified: true,
        verificationStatus: "approved",
        joinedDate: new Date("2023-01-15"),
        totalRides: 1247,
        totalEarnings: 4250.3,
        averageRating: 4.8,
      };

      set(() => ({ profile: mockProfile }));
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to fetch profile");
    } finally {
      state.setLoading(false);
    }
  },

  updateProfile: async (updates: Partial<DriverProfile>) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      if (!state.profile) {
        throw new Error("No profile to update");
      }

      const updatedProfile = { ...state.profile, ...updates };
      set(() => ({ profile: updatedProfile }));

      // TODO: Send to backend
      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to update profile");
    } finally {
      state.setLoading(false);
    }
  },

  fetchDocuments: async () => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockDocuments: DriverDocument[] = [
        {
          id: "doc_001",
          type: "license",
          name: "Driver License",
          fileUrl: "https://example.com/license.pdf",
          uploadDate: new Date("2023-01-15"),
          expiryDate: new Date("2025-06-15"),
          status: "approved",
          isRequired: true,
        },
        {
          id: "doc_002",
          type: "insurance",
          name: "Vehicle Insurance",
          fileUrl: "https://example.com/insurance.pdf",
          uploadDate: new Date("2023-01-15"),
          expiryDate: new Date("2024-12-31"),
          status: "approved",
          isRequired: true,
        },
        {
          id: "doc_003",
          type: "registration",
          name: "Vehicle Registration",
          fileUrl: "https://example.com/registration.pdf",
          uploadDate: new Date("2023-01-15"),
          expiryDate: new Date("2024-12-31"),
          status: "approved",
          isRequired: true,
        },
      ];

      set(() => ({ documents: mockDocuments }));
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to fetch documents");
    } finally {
      state.setLoading(false);
    }
  },

  uploadDocument: async (
    document: Omit<DriverDocument, "id" | "uploadDate" | "status">,
  ) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      const documentId = `doc_${Date.now()}`;
      const newDocument: DriverDocument = {
        ...document,
        id: documentId,
        uploadDate: new Date(),
        status: "pending",
      };

      set((state) => ({
        documents: [...state.documents, newDocument],
      }));

      // TODO: Upload to backend
      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to upload document");
    } finally {
      state.setLoading(false);
    }
  },

  updateDocument: async (
    documentId: string,
    updates: Partial<DriverDocument>,
  ) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === documentId ? { ...doc, ...updates } : doc,
        ),
      }));

      // TODO: Update in backend
      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to update document");
    } finally {
      state.setLoading(false);
    }
  },

  deleteDocument: async (documentId: string) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== documentId),
      }));

      // TODO: Delete from backend
      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to delete document");
    } finally {
      state.setLoading(false);
    }
  },

  fetchVehicles: async () => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockVehicles: Vehicle[] = [
        {
          id: "vehicle_001",
          make: "Toyota",
          model: "Camry",
          year: 2020,
          color: "Silver",
          licensePlate: "ABC123",
          vin: "1HGBH41JXMN109186",
          isActive: true,
          isDefault: true,
          serviceTypes: ["uberx", "ubercomfort"] as any,
          capacity: 4,
          features: [
            {
              id: "feat_001",
              name: "Air Conditioning",
              type: "comfort",
              isAvailable: true,
            },
            {
              id: "feat_002",
              name: "Bluetooth",
              type: "entertainment",
              isAvailable: true,
            },
          ],
          inspectionDate: new Date("2023-06-15"),
          inspectionExpiry: new Date("2024-06-15"),
        },
      ];

      set(() => ({ vehicles: mockVehicles }));
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to fetch vehicles");
    } finally {
      state.setLoading(false);
    }
  },

  addVehicle: async (vehicle: Omit<Vehicle, "id">) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      const vehicleId = `vehicle_${Date.now()}`;
      const newVehicle: Vehicle = {
        ...vehicle,
        id: vehicleId,
      };

      set((state) => ({
        vehicles: [...state.vehicles, newVehicle],
      }));

      // TODO: Add to backend
      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to add vehicle");
    } finally {
      state.setLoading(false);
    }
  },

  updateVehicle: async (vehicleId: string, updates: Partial<Vehicle>) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === vehicleId ? { ...vehicle, ...updates } : vehicle,
        ),
      }));

      // TODO: Update in backend
      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to update vehicle");
    } finally {
      state.setLoading(false);
    }
  },

  deleteVehicle: async (vehicleId: string) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        vehicles: state.vehicles.filter((vehicle) => vehicle.id !== vehicleId),
      }));

      // TODO: Delete from backend
      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to delete vehicle");
    } finally {
      state.setLoading(false);
    }
  },

  setDefaultVehicle: async (vehicleId: string) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        vehicles: state.vehicles.map((vehicle) => ({
          ...vehicle,
          isDefault: vehicle.id === vehicleId,
        })),
      }));

      // TODO: Update in backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to set default vehicle",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchServiceTypes: async () => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockServiceTypes: ServiceType[] = [
        {
          id: "uberx",
          name: "uberx",
          displayName: "UberX",
          description: "Affordable rides for up to 4 passengers",
          baseFare: 2.55,
          perMinuteRate: 0.18,
          perMileRate: 1.15,
          minimumFare: 5.55,
          isActive: true,
          requirements: {
            minRating: 4.5,
            vehicleYear: 2010,
            vehicleCapacity: 4,
          },
        },
        {
          id: "ubercomfort",
          name: "ubercomfort",
          displayName: "Uber Comfort",
          description: "Newer cars with extra legroom",
          baseFare: 3.75,
          perMinuteRate: 0.27,
          perMileRate: 1.35,
          minimumFare: 7.55,
          isActive: true,
          requirements: {
            minRating: 4.7,
            vehicleYear: 2017,
            vehicleCapacity: 4,
            features: ["extra_legroom"],
          },
        },
      ];

      set(() => ({ serviceTypes: mockServiceTypes }));
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to fetch service types",
      );
    } finally {
      state.setLoading(false);
    }
  },

  updateServiceTypeStatus: async (serviceTypeId: string, isActive: boolean) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        serviceTypes: state.serviceTypes.map((serviceType) =>
          serviceType.id === serviceTypeId
            ? { ...serviceType, isActive }
            : serviceType,
        ),
      }));

      // TODO: Update in backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to update service type status",
      );
    } finally {
      state.setLoading(false);
    }
  },

  updateAppSettings: async (settings: Partial<AppSettings>) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        appSettings: { ...state.appSettings, ...settings },
      }));

      // TODO: Save to backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to update app settings",
      );
    } finally {
      state.setLoading(false);
    }
  },

  updateNavigationSettings: async (settings: Partial<NavigationSettings>) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        navigationSettings: { ...state.navigationSettings, ...settings },
      }));

      // TODO: Save to backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to update navigation settings",
      );
    } finally {
      state.setLoading(false);
    }
  },

  updateSoundSettings: async (settings: Partial<SoundSettings>) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        soundSettings: { ...state.soundSettings, ...settings },
      }));

      // TODO: Save to backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to update sound settings",
      );
    } finally {
      state.setLoading(false);
    }
  },

  updateRidePreferences: async (preferences: Partial<RidePreferences>) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        ridePreferences: { ...state.ridePreferences, ...preferences },
      }));

      // TODO: Save to backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to update ride preferences",
      );
    } finally {
      state.setLoading(false);
    }
  },

  // Utility Functions
  setLoading: (loading: boolean) => {
    
    set(() => ({ isLoading: loading }));
  },

  setError: (error: string | null) => {
    
    set(() => ({ error }));
  },

  clearError: () => {
    
    set(() => ({ error: null }));
  },
}));
