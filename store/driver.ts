import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mmkvStorage } from "@/lib/storage/zustandMMKVAdapter";
import type {
  DriverProfile,
  Vehicle,
  Document,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  DocumentType,
  DocumentStatus,
  VehicleVerificationStatus,
  EarningsSummary,
  TripEarning,
  Promotion,
  Challenge,
} from "@/types/driver";
import type { MarkerData } from "@/types/type";
import { driverService } from "@/app/services/driverService";
import { vehicleService } from "@/app/services/vehicleService";
import { documentService } from "@/app/services/documentService";
import { earningsService } from "@/app/services/earningsService";
import type { 
  TripEarning as ServiceTripEarning,
  Promotion as ServicePromotion,
  Challenge as ServiceChallenge,
  EarningsSummary as ServiceEarningsSummary,
} from "@/app/services/earningsService";

// ===== TYPES =====

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface AppSettings {
  theme: "light" | "dark" | "auto";
  language: string;
  notifications: {
    push: boolean;
    sms: boolean;
    email: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareContact: boolean;
  };
}

interface NavigationSettings {
  preferredMapProvider: "google" | "apple";
  voiceGuidance: boolean;
  avoidTolls: boolean;
  avoidHighways: boolean;
  autoReroute: boolean;
}

interface SoundSettings {
  rideNotifications: boolean;
  navigationVoice: boolean;
  systemSounds: boolean;
  volume: number;
}

interface RidePreferences {
  autoAccept: boolean;
  autoAcceptRadius: number; // km
  preferredVehicleTypes: string[];
  maxDistance: number; // km
  minFare: number;
}

interface OnboardingState {
  isCompleted: boolean;
  currentStep: number;
  progress: number;
  steps: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
    isRequired: boolean;
  }>;
}

interface DocumentStatusInfo {
  allApproved: boolean;
  pendingCount: number;
  expiringSoon: Document[];
}

interface EarningsData {
  today: { total: number; trips: number; avg: number };
  week: { total: number; trips: number; avg: number };
  month: { total: number; trips: number; avg: number };
  total: { total: number; trips: number; avg: number };
}

interface LoadingState {
  profile: boolean;
  vehicles: boolean;
  documents: boolean;
  earnings: boolean;
  settings: boolean;
  onboarding: boolean;
}

// ===== MAIN STORE INTERFACE =====

interface DriverStore {
  // ===== IDENTIDAD =====
  profile: DriverProfile | null;
  role: 'customer' | 'driver' | 'business';
  isDriver: boolean;
  
  // ===== ESTADO OPERACIONAL =====
  status: 'online' | 'offline' | 'busy';
  isAvailable: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  currentLocation: LocationData | null;
  
  // ===== DRIVER SELECTION (for ride booking) =====
  drivers: MarkerData[];
  selectedDriver: number | null;
  
  // ===== VEHÍCULOS =====
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  selectedVehicle: Vehicle | null;
  
  // ===== DOCUMENTOS =====
  documents: Document[];
  documentStatus: DocumentStatusInfo;
  
  // ===== GANANCIAS CONSOLIDADAS =====
  earnings: EarningsData;
  tripHistory: ServiceTripEarning[];
  promotions: ServicePromotion[];
  challenges: ServiceChallenge[];
  selectedPeriod: "today" | "week" | "month" | "total";
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  
  // ===== CONFIGURACIÓN =====
  settings: {
    app: AppSettings;
    navigation: NavigationSettings;
    sounds: SoundSettings;
    ridePreferences: RidePreferences;
  };
  
  // ===== ONBOARDING =====
  onboarding: OnboardingState;
  
  // ===== ESTADOS DE CARGA =====
  loading: LoadingState;
  error: string | null;
  
  // ===== ACCIONES DE PERFIL =====
  setProfile: (profile: DriverProfile | null) => void;
  updateProfile: (updates: Partial<DriverProfile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  
  // ===== ACCIONES DE DRIVER SELECTION =====
  setDrivers: (drivers: MarkerData[]) => void;
  setSelectedDriver: (driverId: number | null) => void;
  clearSelectedDriver: () => void;
  
  // ===== ACCIONES DE VEHÍCULOS =====
  setVehicles: (vehicles: Vehicle[]) => void;
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicleData: CreateVehicleRequest) => Promise<void>;
  updateVehicle: (id: string, updates: UpdateVehicleRequest) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  selectVehicle: (vehicle: Vehicle | null) => void;
  activateVehicle: (id: string) => Promise<void>;
  deactivateVehicle: (id: string) => Promise<void>;
  
  // ===== ACCIONES DE DOCUMENTOS =====
  setDocuments: (documents: Document[]) => void;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (
    type: DocumentType,
    file: File | string,
    description?: string,
  ) => Promise<void>;
  updateDocumentStatus: (id: string, status: DocumentStatus) => void;
  deleteDocument: (id: string) => Promise<void>;
  
  // ===== ACCIONES DE GANANCIAS =====
  fetchEarningsSummary: (period?: "today" | "week" | "month" | "total") => Promise<void>;
  fetchTripHistory: (period?: "today" | "week" | "month" | "all") => Promise<void>;
  fetchPromotions: () => Promise<void>;
  fetchChallenges: () => Promise<void>;
  setSelectedPeriod: (period: "today" | "week" | "month" | "total") => void;
  setDateRange: (startDate: Date | null, endDate: Date | null) => void;
  refreshEarnings: () => Promise<void>;
  
  // ===== ACCIONES DE CONFIGURACIÓN =====
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  updateNavigationSettings: (settings: Partial<NavigationSettings>) => void;
  updateSoundSettings: (settings: Partial<SoundSettings>) => void;
  updateRidePreferences: (preferences: Partial<RidePreferences>) => void;
  
  // ===== ACCIONES DE ONBOARDING =====
  updateOnboardingStep: (stepId: string, isCompleted: boolean) => void;
  nextOnboardingStep: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // ===== ACCIONES DE ESTADO =====
  setRole: (role: 'customer' | 'driver' | 'business') => void;
  updateStatus: (status: 'online' | 'offline' | 'busy') => void;
  setAvailability: (available: boolean) => void;
  updateLocation: (location: LocationData) => void;
  
  // ===== UTILIDADES =====
  setLoading: (loading: Partial<LoadingState>) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// ===== INITIAL STATE =====

const initialState = {
  // Identity
  profile: null,
  role: 'customer' as const,
  isDriver: false,
  
  // Operational state
  status: 'offline' as const,
  isAvailable: false,
  verificationStatus: 'pending' as const,
  currentLocation: null,
  
  // Driver selection
  drivers: [],
  selectedDriver: null,
  
  // Vehicles
  vehicles: [],
  activeVehicle: null,
  selectedVehicle: null,
  
  // Documents
  documents: [],
  documentStatus: {
    allApproved: false,
    pendingCount: 0,
    expiringSoon: [],
  },
  
  // Earnings
  earnings: {
    today: { total: 0, trips: 0, avg: 0 },
    week: { total: 0, trips: 0, avg: 0 },
    month: { total: 0, trips: 0, avg: 0 },
    total: { total: 0, trips: 0, avg: 0 },
  },
  tripHistory: [],
  promotions: [],
  challenges: [],
  selectedPeriod: "today" as const,
  dateRange: {
    startDate: null,
    endDate: null,
  },
  
  // Settings
  settings: {
    app: {
      theme: "auto" as const,
      language: "es",
      notifications: {
        push: true,
        sms: false,
        email: true,
      },
      privacy: {
        shareLocation: true,
        shareContact: false,
      },
    },
    navigation: {
      preferredMapProvider: "google" as const,
      voiceGuidance: true,
      avoidTolls: false,
      avoidHighways: false,
      autoReroute: true,
    },
    sounds: {
      rideNotifications: true,
      navigationVoice: true,
      systemSounds: true,
      volume: 0.8,
    },
    ridePreferences: {
      autoAccept: false,
      autoAcceptRadius: 5,
      preferredVehicleTypes: [],
      maxDistance: 50,
      minFare: 0,
    },
  },
  
  // Onboarding
  onboarding: {
    isCompleted: false,
    currentStep: 0,
    progress: 0,
    steps: [
      { id: "prerequisites", title: "Prerequisites", isCompleted: false, isRequired: true },
      { id: "personal_info", title: "Personal Information", isCompleted: false, isRequired: true },
      { id: "documents", title: "Documents", isCompleted: false, isRequired: true },
      { id: "vehicle", title: "Vehicle Information", isCompleted: false, isRequired: true },
      { id: "verification", title: "Verification", isCompleted: false, isRequired: true },
    ],
  },
  
  // Loading states
  loading: {
    profile: false,
    vehicles: false,
    documents: false,
    earnings: false,
    settings: false,
    onboarding: false,
  },
  error: null,
};

// ===== STORE IMPLEMENTATION =====

export const useDriverStore = create<DriverStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ===== PROFILE ACTIONS =====
      setProfile: (profile) => {
        console.log('[DriverStore] setProfile called with:', profile);
        set({ profile });
      },
      
      // ===== DRIVER SELECTION ACTIONS =====
      setDrivers: (drivers) => {
        console.log('[DriverStore] setDrivers called with:', drivers);
        set({ drivers });
      },
      
      setSelectedDriver: (driverId) => {
        console.log('[DriverStore] setSelectedDriver called with:', driverId);
        set({ selectedDriver: driverId });
      },
      
      clearSelectedDriver: () => {
        console.log('[DriverStore] clearSelectedDriver called');
        set({ selectedDriver: null });
      },

      updateProfile: async (updates) => {
        const state = get();
        console.log('[DriverStore] updateProfile called with:', updates);

        try {
          state.setLoading({ profile: true });
          state.setError(null);

          const response = await driverService.updateProfile(updates);

          if (!response || typeof response !== "object") {
            throw new Error("Invalid response format from update profile API");
          }

          const updatedProfile = { ...state.profile, ...response } as DriverProfile;
          state.setProfile(updatedProfile);

          console.log('[DriverStore] Profile updated successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error updating profile:', error);

          let errorMessage = "Failed to update profile";
          if (error.message) {
            errorMessage = error.message;
          } else if (error.statusCode === 400) {
            errorMessage = "Invalid profile data provided";
          } else if (error.statusCode === 401) {
            errorMessage = "Authentication required. Please log in again.";
          } else if (error.statusCode === 403) {
            errorMessage = "You don't have permission to update this profile";
          } else if (error.statusCode === 404) {
            errorMessage = "Profile not found";
          } else if (error.statusCode >= 500) {
            errorMessage = "Server error. Please try again later.";
          }

          state.setError(errorMessage);
        } finally {
          state.setLoading({ profile: false });
        }
      },

      fetchProfile: async () => {
        const state = get();
        console.log('[DriverStore] fetchProfile called');

        try {
          state.setLoading({ profile: true });
          state.setError(null);

          const profile = await driverService.getProfile();
          state.setProfile(profile);

          console.log('[DriverStore] Profile fetched successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error fetching profile:', error);
          state.setError(error.message || "Failed to fetch profile");
        } finally {
          state.setLoading({ profile: false });
        }
      },

      // ===== VEHICLE ACTIONS =====
      setVehicles: (vehicles) => {
        console.log('[DriverStore] setVehicles called with:', vehicles.length, 'vehicles');
        set({ vehicles });
      },

      fetchVehicles: async () => {
        const state = get();
        console.log('[DriverStore] fetchVehicles called');

        try {
          state.setLoading({ vehicles: true });
          state.setError(null);

          const vehicles = await vehicleService.getVehicles();
          state.setVehicles(vehicles);

          console.log('[DriverStore] Vehicles fetched successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error fetching vehicles:', error);
          state.setError(error.message || "Failed to fetch vehicles");
        } finally {
          state.setLoading({ vehicles: false });
        }
      },

      addVehicle: async (vehicleData) => {
        const state = get();
        console.log('[DriverStore] addVehicle called with:', vehicleData);

        try {
          state.setLoading({ vehicles: true });
          state.setError(null);

          const newVehicle = await vehicleService.createVehicle(vehicleData);
          const updatedVehicles = [...state.vehicles, newVehicle];
          state.setVehicles(updatedVehicles);

          console.log('[DriverStore] Vehicle added successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error adding vehicle:', error);
          state.setError(error.message || "Failed to add vehicle");
        } finally {
          state.setLoading({ vehicles: false });
        }
      },

      updateVehicle: async (id, updates) => {
        const state = get();
        console.log('[DriverStore] updateVehicle called with id:', id, 'updates:', updates);

        try {
          state.setLoading({ vehicles: true });
          state.setError(null);

          const updatedVehicle = await vehicleService.updateVehicle(id, updates);
          const updatedVehicles = state.vehicles.map(v => 
            v.id === id ? updatedVehicle : v
          );
          state.setVehicles(updatedVehicles);

          console.log('[DriverStore] Vehicle updated successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error updating vehicle:', error);
          state.setError(error.message || "Failed to update vehicle");
        } finally {
          state.setLoading({ vehicles: false });
        }
      },

      deleteVehicle: async (id) => {
        const state = get();
        console.log('[DriverStore] deleteVehicle called with id:', id);

        try {
          state.setLoading({ vehicles: true });
          state.setError(null);

          await vehicleService.deleteVehicle(id);
          const updatedVehicles = state.vehicles.filter(v => v.id !== id);
          state.setVehicles(updatedVehicles);

          // Clear active/selected vehicle if it was deleted
          if (state.activeVehicle?.id === id) {
            set({ activeVehicle: null });
          }
          if (state.selectedVehicle?.id === id) {
            set({ selectedVehicle: null });
          }

          console.log('[DriverStore] Vehicle deleted successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error deleting vehicle:', error);
          state.setError(error.message || "Failed to delete vehicle");
        } finally {
          state.setLoading({ vehicles: false });
        }
      },

      selectVehicle: (vehicle) => {
        console.log('[DriverStore] selectVehicle called with:', vehicle?.id);
        set({ selectedVehicle: vehicle });
      },

      activateVehicle: async (id) => {
        const state = get();
        console.log('[DriverStore] activateVehicle called with id:', id);

        try {
          state.setLoading({ vehicles: true });
          state.setError(null);

          const vehicle = state.vehicles.find(v => v.id === id);
          if (!vehicle) {
            throw new Error("Vehicle not found");
          }

          // Deactivate current active vehicle
          if (state.activeVehicle) {
            const updatedVehicles = state.vehicles.map(v => 
              v.id === state.activeVehicle!.id ? { ...v, isActive: false } : v
            );
            state.setVehicles(updatedVehicles);
          }

          // Activate new vehicle
          const updatedVehicles = state.vehicles.map(v => 
            v.id === id ? { ...v, isActive: true } : v
          );
          state.setVehicles(updatedVehicles);
          set({ activeVehicle: vehicle });

          console.log('[DriverStore] Vehicle activated successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error activating vehicle:', error);
          state.setError(error.message || "Failed to activate vehicle");
        } finally {
          state.setLoading({ vehicles: false });
        }
      },

      deactivateVehicle: async (id) => {
        const state = get();
        console.log('[DriverStore] deactivateVehicle called with id:', id);

        try {
          state.setLoading({ vehicles: true });
          state.setError(null);

          const updatedVehicles = state.vehicles.map(v => 
            v.id === id ? { ...v, isActive: false } : v
          );
          state.setVehicles(updatedVehicles);

          if (state.activeVehicle?.id === id) {
            set({ activeVehicle: null });
          }

          console.log('[DriverStore] Vehicle deactivated successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error deactivating vehicle:', error);
          state.setError(error.message || "Failed to deactivate vehicle");
        } finally {
          state.setLoading({ vehicles: false });
        }
      },

      // ===== DOCUMENT ACTIONS =====
      setDocuments: (documents) => {
        console.log('[DriverStore] setDocuments called with:', documents.length, 'documents');
        
        // Calculate document status
        const allApproved = documents.every(doc => doc.status === 'approved');
        const pendingCount = documents.filter(doc => doc.status === 'pending').length;
        const expiringSoon = documents.filter(doc => {
          if (!doc.expiresAt) return false;
          const daysUntilExpiry = Math.ceil((new Date(doc.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        });

        set({ 
          documents,
          documentStatus: {
            allApproved,
            pendingCount,
            expiringSoon,
          }
        });
      },

      fetchDocuments: async () => {
        const state = get();
        console.log('[DriverStore] fetchDocuments called');

        try {
          state.setLoading({ documents: true });
          state.setError(null);

          const documents = await documentService.getDocuments();
          state.setDocuments(documents);

          console.log('[DriverStore] Documents fetched successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error fetching documents:', error);
          state.setError(error.message || "Failed to fetch documents");
        } finally {
          state.setLoading({ documents: false });
        }
      },

      uploadDocument: async (type, file, description) => {
        const state = get();
        console.log('[DriverStore] uploadDocument called with type:', type);

        try {
          state.setLoading({ documents: true });
          state.setError(null);

          const newDocument = await documentService.uploadDocument({
            driverId: state.profile?.id || '',
            type,
            file,
            fileName: (file as File).name || 'document',
            description,
          });
          const updatedDocuments = [...state.documents, newDocument];
          state.setDocuments(updatedDocuments);

          console.log('[DriverStore] Document uploaded successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error uploading document:', error);
          state.setError(error.message || "Failed to upload document");
        } finally {
          state.setLoading({ documents: false });
        }
      },

      updateDocumentStatus: (id, status) => {
        console.log('[DriverStore] updateDocumentStatus called with id:', id, 'status:', status);
        
        const currentState = get();
        const updatedDocuments = currentState.documents.map(doc => 
          doc.id === id ? { ...doc, status } : doc
        );
        currentState.setDocuments(updatedDocuments);
      },

      deleteDocument: async (id) => {
        const state = get();
        console.log('[DriverStore] deleteDocument called with id:', id);

        try {
          state.setLoading({ documents: true });
          state.setError(null);

          await documentService.deleteDocument(id);
          const updatedDocuments = state.documents.filter(doc => doc.id !== id);
          state.setDocuments(updatedDocuments);

          console.log('[DriverStore] Document deleted successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error deleting document:', error);
          state.setError(error.message || "Failed to delete document");
        } finally {
          state.setLoading({ documents: false });
        }
      },

      // ===== EARNINGS ACTIONS =====
      fetchEarningsSummary: async (period = "today") => {
        const state = get();
        console.log('[DriverStore] fetchEarningsSummary called with period:', period);

        try {
          state.setLoading({ earnings: true });
          state.setError(null);

          const summary = await earningsService.getEarningsSummary();
          
          // Update earnings data
          const earnings: EarningsData = {
            today: {
              total: summary.today?.earnings || 0,
              trips: summary.today?.rides || 0,
              avg: summary.today?.averagePerRide || 0,
            },
            week: {
              total: summary.week?.earnings || 0,
              trips: summary.week?.rides || 0,
              avg: summary.week?.averagePerRide || 0,
            },
            month: {
              total: summary.month?.earnings || 0,
              trips: summary.month?.rides || 0,
              avg: summary.month?.averagePerRide || 0,
            },
            total: {
              total: summary.total?.earnings || 0,
              trips: summary.total?.rides || 0,
              avg: summary.total?.averagePerRide || 0,
            },
          };

          set({ earnings });

          console.log('[DriverStore] Earnings summary fetched successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error fetching earnings summary:', error);
          state.setError(error.message || "Failed to fetch earnings summary");
        } finally {
          state.setLoading({ earnings: false });
        }
      },

      fetchTripHistory: async (period: "today" | "week" | "month" | "all" = "week") => {
        const state = get();
        console.log('[DriverStore] fetchTripHistory called with period:', period);

        try {
          state.setLoading({ earnings: true });
          state.setError(null);

          const history = await earningsService.getTripHistory(period);
          set({ tripHistory: history });

          console.log('[DriverStore] Trip history fetched successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error fetching trip history:', error);
          state.setError(error.message || "Failed to fetch trip history");
        } finally {
          state.setLoading({ earnings: false });
        }
      },

      fetchPromotions: async () => {
        const state = get();
        console.log('[DriverStore] fetchPromotions called');

        try {
          state.setLoading({ earnings: true });
          state.setError(null);

          const promotions = await earningsService.getAllPromotions();
          set({ promotions });

          console.log('[DriverStore] Promotions fetched successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error fetching promotions:', error);
          state.setError(error.message || "Failed to fetch promotions");
        } finally {
          state.setLoading({ earnings: false });
        }
      },

      fetchChallenges: async () => {
        const state = get();
        console.log('[DriverStore] fetchChallenges called');

        try {
          state.setLoading({ earnings: true });
          state.setError(null);

          const challenges = await earningsService.getAllChallenges();
          set({ challenges });

          console.log('[DriverStore] Challenges fetched successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error fetching challenges:', error);
          state.setError(error.message || "Failed to fetch challenges");
        } finally {
          state.setLoading({ earnings: false });
        }
      },

      setSelectedPeriod: (period) => {
        console.log('[DriverStore] setSelectedPeriod called with:', period);
        set({ selectedPeriod: period });
      },

      setDateRange: (startDate, endDate) => {
        console.log('[DriverStore] setDateRange called with:', startDate, endDate);
        set({ dateRange: { startDate, endDate } });
      },

      refreshEarnings: async () => {
        const state = get();
        console.log('[DriverStore] refreshEarnings called');

        try {
          await Promise.all([
            state.fetchEarningsSummary(state.selectedPeriod),
            state.fetchTripHistory(),
            state.fetchPromotions(),
            state.fetchChallenges(),
          ]);

          console.log('[DriverStore] Earnings refreshed successfully');
        } catch (error: any) {
          console.error('[DriverStore] Error refreshing earnings:', error);
          state.setError(error.message || "Failed to refresh earnings");
        }
      },

      // ===== SETTINGS ACTIONS =====
      updateAppSettings: (settings) => {
        console.log('[DriverStore] updateAppSettings called with:', settings);
        set((state) => ({
          settings: {
            ...state.settings,
            app: { ...state.settings.app, ...settings },
          },
        }));
      },

      updateNavigationSettings: (settings) => {
        console.log('[DriverStore] updateNavigationSettings called with:', settings);
        set((state) => ({
          settings: {
            ...state.settings,
            navigation: { ...state.settings.navigation, ...settings },
          },
        }));
      },

      updateSoundSettings: (settings) => {
        console.log('[DriverStore] updateSoundSettings called with:', settings);
        set((state) => ({
          settings: {
            ...state.settings,
            sounds: { ...state.settings.sounds, ...settings },
          },
        }));
      },

      updateRidePreferences: (preferences) => {
        console.log('[DriverStore] updateRidePreferences called with:', preferences);
        set((state) => ({
          settings: {
            ...state.settings,
            ridePreferences: { ...state.settings.ridePreferences, ...preferences },
          },
        }));
      },

      // ===== ONBOARDING ACTIONS =====
      updateOnboardingStep: (stepId: string, isCompleted: boolean) => {
        console.log('[DriverStore] updateOnboardingStep called with stepId:', stepId, 'isCompleted:', isCompleted);
        
        set((state) => {
          const updatedSteps = state.onboarding.steps.map((step: any) =>
            step.id === stepId ? { ...step, isCompleted } : step
          );
          
          const completedSteps = updatedSteps.filter((step: any) => step.isCompleted).length;
          const progress = (completedSteps / updatedSteps.length) * 100;
          const isOnboardingCompleted = updatedSteps.every((step: any) => !step.isRequired || step.isCompleted);
          
          return {
            onboarding: {
              ...state.onboarding,
              steps: updatedSteps,
              progress,
              isCompleted: isOnboardingCompleted,
            },
          };
        });
      },

      nextOnboardingStep: () => {
        console.log('[DriverStore] nextOnboardingStep called');
        
        set((state) => {
          const nextStep = Math.min(state.onboarding.currentStep + 1, state.onboarding.steps.length - 1);
          return {
            onboarding: {
              ...state.onboarding,
              currentStep: nextStep,
            },
          };
        });
      },

      completeOnboarding: () => {
        console.log('[DriverStore] completeOnboarding called');
        
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            isCompleted: true,
            progress: 100,
          },
        }));
      },

      resetOnboarding: () => {
        console.log('[DriverStore] resetOnboarding called');
        
        set({
          onboarding: {
            ...initialState.onboarding,
          },
        });
      },

      // ===== STATE ACTIONS =====
      setRole: (role) => {
        console.log('[DriverStore] setRole called with:', role);
        set({ 
          role,
          isDriver: role === 'driver',
        });
      },

      updateStatus: (status) => {
        console.log('[DriverStore] updateStatus called with:', status);
        set({ status });
      },

      setAvailability: (available) => {
        console.log('[DriverStore] setAvailability called with:', available);
        set({ isAvailable: available });
      },

      updateLocation: (location) => {
        console.log('[DriverStore] updateLocation called with:', location);
        set({ currentLocation: location });
      },

      // ===== UTILITY ACTIONS =====
      setLoading: (loading) => {
        console.log('[DriverStore] setLoading called with:', loading);
        set((state) => ({
          loading: { ...state.loading, ...loading },
        }));
      },

      setError: (error) => {
        console.log('[DriverStore] setError called with:', error);
        set({ error });
      },

      clearError: () => {
        console.log('[DriverStore] clearError called');
        set({ error: null });
      },

      reset: () => {
        console.log('[DriverStore] reset called');
        set(initialState);
      },
    }),
    {
      name: 'driver-store',
      storage: mmkvStorage as any,
      partialize: (state) => ({
        // Only persist essential data, not loading states or errors
        profile: state.profile,
        role: state.role,
        isDriver: state.isDriver,
        status: state.status,
        isAvailable: state.isAvailable,
        verificationStatus: state.verificationStatus,
        vehicles: state.vehicles,
        activeVehicle: state.activeVehicle,
        selectedVehicle: state.selectedVehicle,
        documents: state.documents,
        settings: state.settings,
        onboarding: state.onboarding,
        earnings: state.earnings,
        selectedPeriod: state.selectedPeriod,
        dateRange: state.dateRange,
      } as any),
    }
  )
);

// ===== OPTIMIZED SELECTORS =====

// Basic selectors
export const useDriverProfile = () => useDriverStore(s => s.profile);
export const useDriverRole = () => useDriverStore(s => s.role);
export const useIsDriver = () => useDriverStore(s => s.isDriver);
export const useDriverStatus = () => useDriverStore(s => s.status);
export const useDriverAvailability = () => useDriverStore(s => s.isAvailable);
export const useDriverLocation = () => useDriverStore(s => s.currentLocation);
export const useDriverVerificationStatus = () => useDriverStore(s => s.verificationStatus);

// Driver selection selectors
export const useDrivers = () => useDriverStore(s => s.drivers);
export const useSelectedDriver = () => useDriverStore(s => s.selectedDriver);
export const useDriversCount = () => useDriverStore(s => s.drivers.length);
export const useHasDrivers = () => useDriverStore(s => s.drivers.length > 0);

// Vehicle selectors
export const useDriverVehicles = () => useDriverStore(s => s.vehicles);
export const useActiveVehicle = () => useDriverStore(s => s.activeVehicle);
export const useSelectedVehicle = () => useDriverStore(s => s.selectedVehicle);
export const useHasVehicles = () => useDriverStore(s => s.vehicles.length > 0);
export const useVehiclesCount = () => useDriverStore(s => s.vehicles.length);

// Document selectors
export const useDriverDocuments = () => useDriverStore(s => s.documents);
export const useDocumentStatus = () => useDriverStore(s => s.documentStatus);
export const useAllDocumentsApproved = () => useDriverStore(s => s.documentStatus.allApproved);
export const usePendingDocumentsCount = () => useDriverStore(s => s.documentStatus.pendingCount);
export const useExpiringDocuments = () => useDriverStore(s => s.documentStatus.expiringSoon);

// Earnings selectors
export const useDriverEarnings = () => useDriverStore(s => s.earnings);
export const useTodayEarnings = () => useDriverStore(s => s.earnings.today);
export const useWeekEarnings = () => useDriverStore(s => s.earnings.week);
export const useMonthEarnings = () => useDriverStore(s => s.earnings.month);
export const useTotalEarnings = () => useDriverStore(s => s.earnings.total);
export const useTripHistory = () => useDriverStore(s => s.tripHistory);
export const usePromotions = () => useDriverStore(s => s.promotions);
export const useChallenges = () => useDriverStore(s => s.challenges);
export const useSelectedPeriod = () => useDriverStore(s => s.selectedPeriod);
export const useDateRange = () => useDriverStore(s => s.dateRange);

// Settings selectors
export const useDriverSettings = () => useDriverStore(s => s.settings);
export const useAppSettings = () => useDriverStore(s => s.settings.app);
export const useNavigationSettings = () => useDriverStore(s => s.settings.navigation);
export const useSoundSettings = () => useDriverStore(s => s.settings.sounds);
export const useRidePreferences = () => useDriverStore(s => s.settings.ridePreferences);

// Onboarding selectors
export const useOnboarding = () => useDriverStore(s => s.onboarding);
export const useOnboardingProgress = () => useDriverStore(s => s.onboarding.progress);
export const useIsOnboardingCompleted = () => useDriverStore(s => s.onboarding.isCompleted);
export const useCurrentOnboardingStep = () => useDriverStore(s => s.onboarding.currentStep);

// Loading selectors
export const useDriverLoading = () => useDriverStore(s => s.loading);
export const useIsProfileLoading = () => useDriverStore(s => s.loading.profile);
export const useIsVehiclesLoading = () => useDriverStore(s => s.loading.vehicles);
export const useIsDocumentsLoading = () => useDriverStore(s => s.loading.documents);
export const useIsEarningsLoading = () => useDriverStore(s => s.loading.earnings);

// Error selectors
export const useDriverError = () => useDriverStore(s => s.error);

// Compound selectors
export const useDriverBasicInfo = () => useDriverStore(s => ({
  profile: s.profile,
  status: s.status,
  isAvailable: s.isAvailable,
  verificationStatus: s.verificationStatus,
}));

export const useDriverVerificationDetails = () => useDriverStore(s => ({
  verificationStatus: s.verificationStatus,
  documentsApproved: s.documentStatus.allApproved,
  pendingDocuments: s.documentStatus.pendingCount,
  expiringSoon: s.documentStatus.expiringSoon,
}));

export const useDriverVehicleInfo = () => useDriverStore(s => ({
  vehicles: s.vehicles,
  activeVehicle: s.activeVehicle,
  selectedVehicle: s.selectedVehicle,
  hasVehicles: s.vehicles.length > 0,
}));

export const useDriverEarningsInfo = () => useDriverStore(s => ({
  earnings: s.earnings,
  tripHistory: s.tripHistory,
  promotions: s.promotions,
  challenges: s.challenges,
  selectedPeriod: s.selectedPeriod,
  dateRange: s.dateRange,
}));

export const useDriverOnboardingInfo = () => useDriverStore(s => ({
  isCompleted: s.onboarding.isCompleted,
  currentStep: s.onboarding.currentStep,
  progress: s.onboarding.progress,
  steps: s.onboarding.steps,
}));
