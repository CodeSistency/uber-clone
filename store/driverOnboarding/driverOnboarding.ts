import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { driverService } from "@/app/services/driverService";
import { vehicleService } from "@/app/services/vehicleService";
import { documentService } from "@/app/services/documentService";
import { useDriverProfileStore } from "@/store/driverProfile/driverProfile";

// Types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isRequired: boolean;
  data?: any;
}

export interface DriverOnboardingData {
  // Step 1: Prerequisites
  age: number;
  experience: string;
  vehicleType: string;
  availableHours: string;

  // Step 2: Personal Info
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  address: string;
  phoneSecondary?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  references?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;

  // Step 3: Documents
  licenseNumber: string;
  licenseExpiry: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  registrationNumber: string;
  registrationExpiry: string;

  // Step 4: Vehicle
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  vehicleSeats: number;
  vehicleFeatures?: string[];
  vehiclePhotos: string[]; // URLs or base64

  // Step 5: Agreements
  termsAccepted: boolean;
  privacyAccepted: boolean;
  safetyAccepted: boolean;
  backgroundCheckConsent: boolean;
  marketingConsent?: boolean;
  dataSharingConsent?: boolean;

  // Metadata
  currentStep: number;
  completedSteps: number[];
  startedAt: Date;
  completedAt?: Date;
}

interface DriverOnboardingState {
  // State
  onboardingData: Partial<DriverOnboardingData>;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;

  // Actions
  initializeOnboarding: () => Promise<void>;
  updateStepData: (stepId: number, data: any) => Promise<void>;
  completeStep: (stepId: number) => Promise<void>;
  goToStep: (stepId: number) => void;
  submitOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  loadSavedProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

// Storage key
const ONBOARDING_DATA_KEY = "@driver_onboarding_data";

// Validation function for onboarding data
const validateOnboardingData = (data: Partial<DriverOnboardingData>) => {
  const errors: string[] = [];
  let isValid = true;

  // Step 1: Prerequisites
  if (data.age !== undefined && data.age < 18) {
    errors.push("Must be at least 18 years old to be a driver");
    isValid = false;
  }

  if (!data.experience?.trim()) {
    errors.push("Driving experience is required");
    isValid = false;
  }

  if (!data.vehicleType?.trim()) {
    errors.push("Vehicle type is required");
    isValid = false;
  }

  // Step 2: Personal Info
  if (!data.address?.trim()) {
    errors.push("Address is required");
    isValid = false;
  }

  // Step 3: Documents
  if (!data.licenseNumber?.trim()) {
    errors.push("Driver's license number is required");
    isValid = false;
  }

  if (!data.licenseExpiry) {
    errors.push("License expiry date is required");
    isValid = false;
  }

  if (!data.insuranceNumber?.trim()) {
    errors.push("Insurance policy number is required");
    isValid = false;
  }

  if (!data.insuranceExpiry) {
    errors.push("Insurance expiry date is required");
    isValid = false;
  }

  if (!data.registrationNumber?.trim()) {
    errors.push("Vehicle registration number is required");
    isValid = false;
  }

  if (!data.registrationExpiry) {
    errors.push("Registration expiry date is required");
    isValid = false;
  }

  // Step 4: Vehicle
  if (!data.vehicleMake?.trim()) {
    errors.push("Vehicle make is required");
    isValid = false;
  }

  if (!data.vehicleModel?.trim()) {
    errors.push("Vehicle model is required");
    isValid = false;
  }

  if (!data.vehicleYear || data.vehicleYear < 1990) {
    errors.push("Valid vehicle year is required");
    isValid = false;
  }

  if (!data.vehicleColor?.trim()) {
    errors.push("Vehicle color is required");
    isValid = false;
  }

  if (!data.vehicleSeats || data.vehicleSeats < 1) {
    errors.push("Valid number of seats is required");
    isValid = false;
  }

  // Step 5: Agreements
  if (!data.termsAccepted) {
    errors.push("Terms and conditions must be accepted");
    isValid = false;
  }

  if (!data.privacyAccepted) {
    errors.push("Privacy policy must be accepted");
    isValid = false;
  }

  if (!data.safetyAccepted) {
    errors.push("Safety guidelines must be accepted");
    isValid = false;
  }

  if (!data.backgroundCheckConsent) {
    errors.push("Background check consent is required");
    isValid = false;
  }

  return { isValid, errors };
};

// Submit onboarding data to backend
const submitOnboardingToBackend = async (
  data: Partial<DriverOnboardingData>,
) => {
  try {
    

    // Create driver profile
    const driverProfileData = {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phone: data.phone || "",
      phoneSecondary: data.phoneSecondary,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry
        ? new Date(data.licenseExpiry)
        : undefined,
      emergencyContact: data.emergencyContact || {
        name: "",
        phone: "",
        relationship: "",
      },
    };

    // Submit driver profile
    const driverResult = await driverService.updateProfile(driverProfileData);
    

    // Create vehicle
    const vehicleData = {
      driverId: useDriverProfileStore.getState().profile?.id || '',
      make: data.vehicleMake!,
      model: data.vehicleModel!,
      year: data.vehicleYear!,
      color: data.vehicleColor!,
      seats: data.vehicleSeats!,
      licensePlate: "", // Will be set later
      plateNumber: "", // Will be set later
      vin: `VIN${Date.now()}`,
      insurancePolicyNumber: data.insuranceNumber!,
      insuranceProvider: "", // Will be extracted from policy
      insuranceExpiry: data.insuranceExpiry
        ? new Date(data.insuranceExpiry)
        : new Date(),
      registrationNumber: data.registrationNumber!,
      registrationExpiry: data.registrationExpiry
        ? new Date(data.registrationExpiry)
        : new Date(),
    };

    const vehicleResult = await vehicleService.createVehicle(vehicleData);
    

    // Upload documents
    const documentsToUpload = [
      {
        type: "license",
        number: data.licenseNumber!,
        expiry: data.licenseExpiry!,
        files: [], // Will be uploaded separately
      },
      {
        type: "insurance",
        number: data.insuranceNumber!,
        expiry: data.insuranceExpiry!,
        files: [],
      },
      {
        type: "registration",
        number: data.registrationNumber!,
        expiry: data.registrationExpiry!,
        files: [],
      },
    ];

    for (const doc of documentsToUpload) {
      await documentService.uploadDocument({
        driverId: useDriverProfileStore.getState().profile?.id || '',
        type: doc.type as any,
        file: doc.files[0], // Take first file
        fileName: `${doc.type}_document`,
        description: `Uploaded ${doc.type} document`,
      });
    }

    

    // Mark onboarding as complete
    const onboardingResult = await driverService.updateProfile({
      status: 'active',
      onboardingCompletedAt: new Date(),
    });

    

    return {
      driver: driverResult,
      vehicle: vehicleResult,
      onboarding: onboardingResult,
    };
  } catch (error: any) {
    
    throw new Error(`Failed to complete onboarding: ${error.message}`);
  }
};

export const useDriverOnboardingStore = create<DriverOnboardingState>(
  (set, get) => ({
    // Initial state
    onboardingData: {},
    currentStep: 1,
    isLoading: false,
    error: null,
    isCompleted: false,

    // Initialize onboarding with migrated user data
    initializeOnboarding: async () => {
      const state = get();
      

      try {
        state.setLoading(true);

        // Try to load saved progress first
        await state.loadSavedProgress();

        // If no saved progress, initialize with migrated data
        if (Object.keys(state.onboardingData).length === 0) {
          const { useDriverRoleStore } = await import("@/store/driverRole");
          const driverRoleStore = useDriverRoleStore.getState();

          const migratedData = await driverRoleStore.getMigratedData();

          if (migratedData?.userData) {
            
            set({
              onboardingData: {
                ...migratedData.userData,
                currentStep: 1,
                completedSteps: [],
                startedAt: new Date(),
              },
            });
          } else {
            // Initialize empty onboarding
            set({
              onboardingData: {
                currentStep: 1,
                completedSteps: [],
                startedAt: new Date(),
              },
            });
          }
        }

        await state.saveProgress();
        
      } catch (error: any) {
        
        set({
          error: error.message || "Failed to initialize onboarding",
        });
      } finally {
        state.setLoading(false);
      }
    },

    // Update data for a specific step
    updateStepData: async (stepId: number, data: any) => {
      

      set((prevState) => ({
        onboardingData: {
          ...prevState.onboardingData,
          ...data,
        },
      }));

      await get().saveProgress();
    },

    // Mark a step as completed
    completeStep: async (stepId: number) => {
      

      set((prevState) => {
        const completedSteps = [
          ...(prevState.onboardingData.completedSteps || []),
        ];
        if (!completedSteps.includes(stepId)) {
          completedSteps.push(stepId);
        }

        return {
          onboardingData: {
            ...prevState.onboardingData,
            completedSteps,
            currentStep: Math.max(stepId + 1, prevState.currentStep),
          },
        };
      });

      await get().saveProgress();
    },

    // Navigate to a specific step
    goToStep: (stepId: number) => {
      
      set((prevState) => ({
        currentStep: stepId,
        onboardingData: {
          ...prevState.onboardingData,
          currentStep: stepId,
        },
      }));
    },

    // Submit final onboarding
    submitOnboarding: async () => {
      const state = get();
      

      try {
        state.setLoading(true);
        const data = state.onboardingData;

        // Validate all required data
        const validation = validateOnboardingData(data);
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
        }

        // Submit to backend
        const result = await submitOnboardingToBackend(data);

        // Update driver role
        const { useDriverRoleStore } = await import("@/store/driverRole");
        const driverRoleStore = useDriverRoleStore.getState();
        await driverRoleStore.setDriverRole("driver");

        // Clear migration data
        await driverRoleStore.clearMigrationData();

        // Mark as completed
        set({
          isCompleted: true,
          onboardingData: {
            ...data,
            completedAt: new Date(),
          },
        });

        // Clear saved progress
        await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);

        
      } catch (error: any) {
        
        set({
          error: error.message || "Failed to submit onboarding",
        });
        throw error;
      } finally {
        state.setLoading(false);
      }
    },

    // Reset onboarding (for testing or restart)
    resetOnboarding: async () => {
      

      try {
        set({
          onboardingData: {},
          currentStep: 1,
          isCompleted: false,
          error: null,
        });

        await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
        
      } catch (error: any) {
        
      }
    },

    // Load saved progress from storage
    loadSavedProgress: async () => {
      try {
        const savedData = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          

          set({
            onboardingData: parsedData,
            currentStep: parsedData.currentStep || 1,
            isCompleted: parsedData.completedAt ? true : false,
          });
        }
      } catch (error: any) {
        
      }
    },

    // Save current progress to storage
    saveProgress: async () => {
      try {
        const state = get();
        const dataToSave = {
          ...state.onboardingData,
          currentStep: state.currentStep,
        };

        await AsyncStorage.setItem(
          ONBOARDING_DATA_KEY,
          JSON.stringify(dataToSave),
        );
        
      } catch (error: any) {
        
      }
    },

    // Helper actions
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),
  }),
);
