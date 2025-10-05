import { create } from "zustand";
import { onboardingStorage } from "@/app/lib/storage";

export interface OnboardingData {
  // Location
  country?: string;
  state?: string;
  city?: string;

  // Personal Info
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";

  // Preferences
  preferredVehicleType?: "standard" | "suv" | "motorcycle" | "bike";
  preferredServiceLevel?: "economy" | "comfort" | "premium";
  preferredLanguage?: string;
  timezone?: string;
  currency?: string;

  // Verification
  phoneVerified?: boolean;
  emailVerified?: boolean;

  // Profile
  address?: string;
  profileImage?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface OnboardingState {
  // Current state
  currentStep: number;
  completedSteps: string[];
  progress: number;
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;

  // User data
  userData: OnboardingData;

  // Actions
  setCurrentStep: (step: number) => void;
  completeStep: (stepId: string, data?: Partial<OnboardingData>) => void;
  updateUserData: (data: Partial<OnboardingData>) => void;
  setUserData: (data: OnboardingData) => void; // Alias for updateUserData
  setCompleted: (completed: boolean) => void; // Alias for completeOnboarding
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetOnboarding: () => void;
  completeOnboarding: () => void;
  // Helpers
  stepIdToIndex?: (id: string | number | undefined) => number;

  // Persistence actions
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;

  // Step navigation
  nextStep: () => void;
  previousStep: () => void;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
}

const STEPS = [
  "location", // Consolidated country/state/city
  "travel-preferences", // Preferences (optional)
  "phone-verification", // Optional per user request
  "profile-completion", // Address + optional emergency contact
];

const initialState = {
  currentStep: 0,
  completedSteps: [],
  progress: 0,
  isCompleted: false,
  isLoading: false,
  error: null,
  userData: {},
};

// Initialize store with data from storage
const initializeStore = async () => {
  try {
    
    const isCompleted = await onboardingStorage.isCompleted();
    const userData = await onboardingStorage.getData();
    const currentStep = await onboardingStorage.getStep();

    return {
      ...initialState,
      isCompleted,
      userData: userData || initialState.userData,
      currentStep: currentStep || initialState.currentStep,
      progress: isCompleted ? 100 : initialState.progress,
    };
  } catch (error) {
    
    return initialState;
  }
};

export const useOnboardingStore = create<OnboardingState>((set, get) => {
  // Initialize with storage data
  let initialData = initialState;

  // Note: Async initialization is handled in the component that uses the store
  // This is because Zustand doesn't support async initial state directly

  return {
    ...initialState,

    setCurrentStep: (step: number) => {
      
      set((state) => ({
        currentStep: Math.max(0, Math.min(step, STEPS.length - 1)),
        progress: ((step + 1) / STEPS.length) * 100,
      }));
    },

    completeStep: (stepId: string, data?: Partial<OnboardingData>) => {
      
      

      set((state) => {
        const newCompletedSteps = [...state.completedSteps];
        if (!newCompletedSteps.includes(stepId)) {
          newCompletedSteps.push(stepId);
        }

        const newUserData = data
          ? { ...state.userData, ...data }
          : state.userData;
        const progress = (newCompletedSteps.length / STEPS.length) * 100;

        // Auto-advance to next step if possible
        let nextStepIndex = state.currentStep;
        if (
          stepId === STEPS[state.currentStep] &&
          state.currentStep < STEPS.length - 1
        ) {
          nextStepIndex = state.currentStep + 1;
          
        }

        

        return {
          completedSteps: newCompletedSteps,
          userData: newUserData,
          progress,
          currentStep: nextStepIndex,
          error: null,
        };
      });
    },

    updateUserData: (data: Partial<OnboardingData>) => {
      
      set((state) => ({
        userData: { ...state.userData, ...data },
      }));
    },

    setUserData: (data: OnboardingData) => {
      
      set(() => ({ userData: data }));
    },

    setCompleted: (completed: boolean) => {
      
      set(() => ({ isCompleted: completed }));
    },

    setLoading: (loading: boolean) => {
      
      set(() => ({ isLoading: loading }));
    },

    setError: (error: string | null) => {
      
      set(() => ({ error }));
    },

    // Helper to map string step ids to numeric index
    stepIdToIndex: (id?: string | number) => {
      const map: Record<string, number> = {
        location: 0,
        "travel-preferences": 1,
        "phone-verification": 2,
        "profile-completion": 3,
      };
      if (typeof id === "number" && Number.isFinite(id)) {
        return Math.max(0, Math.min(STEPS.length - 1, id));
      }
      if (typeof id === "string") {
        return map[id] ?? 0;
      }
      return 0;
    },

    completeOnboarding: () => {
      
      set((state) => ({
        isCompleted: true,
        progress: 100,
        error: null,
      }));

      // Save completion status to storage
      onboardingStorage.setCompleted(true).catch((error) => {
        
      });
    },

    nextStep: () => {
      const state = get();
      if (state.currentStep < STEPS.length - 1) {
        const nextStepIndex = state.currentStep + 1;
        state.setCurrentStep(nextStepIndex);
      }
    },

    previousStep: () => {
      const state = get();
      if (state.currentStep > 0) {
        const prevStepIndex = state.currentStep - 1;
        state.setCurrentStep(prevStepIndex);
      }
    },

    canGoNext: () => {
      const state = get();
      return state.currentStep < STEPS.length - 1;
    },

    canGoPrevious: () => {
      const state = get();
      return state.currentStep > 0;
    },

    loadFromStorage: async () => {
      try {
        

        // Load completion status
        const isCompleted = await onboardingStorage.isCompleted();

        // Load user data
        const userData = await onboardingStorage.getData();

        // Load current step
        const currentStep = await onboardingStorage.getStep();

        set((state) => ({
          isCompleted,
          userData: userData || state.userData,
          currentStep: currentStep || state.currentStep,
          progress: isCompleted ? 100 : state.progress,
        }));

        
      } catch (error) {
        
      }
    },

    saveToStorage: async () => {
      try {
        const state = get();
        

        // Save completion status
        await onboardingStorage.setCompleted(state.isCompleted);

        // Save user data
        await onboardingStorage.saveData(state.userData);

        // Save current step
        await onboardingStorage.saveStep(state.currentStep);

        
      } catch (error) {
        
      }
    },

    resetOnboarding: () => {
      
      set(initialState);

      // Clear storage as well
      onboardingStorage.clear().catch((error) => {
        
      });
    },
  };
});
