import { create } from "zustand";

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

  // Step navigation
  nextStep: () => void;
  previousStep: () => void;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
}

const STEPS = [
  "location-country",
  "location-state",
  "location-city",
  "personal-info",
  "travel-preferences",
  "phone-verification",
  "profile-completion"
];

const initialState = {
  currentStep: 0,
  completedSteps: [],
  progress: 0,
  isCompleted: false,
  isLoading: false,
  error: null,
  userData: {}
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,

  setCurrentStep: (step: number) => {
    console.log("[OnboardingStore] Setting current step:", step);
    set((state) => ({
      currentStep: Math.max(0, Math.min(step, STEPS.length - 1)),
      progress: ((step + 1) / STEPS.length) * 100
    }));
  },

  completeStep: (stepId: string, data?: Partial<OnboardingData>) => {
    console.log("[OnboardingStore] Completing step:", stepId, "with data:", data);
    set((state) => {
      const newCompletedSteps = [...state.completedSteps];
      if (!newCompletedSteps.includes(stepId)) {
        newCompletedSteps.push(stepId);
      }

      const newUserData = data ? { ...state.userData, ...data } : state.userData;
      const progress = (newCompletedSteps.length / STEPS.length) * 100;

      return {
        completedSteps: newCompletedSteps,
        userData: newUserData,
        progress,
        error: null
      };
    });
  },

  updateUserData: (data: Partial<OnboardingData>) => {
    console.log("[OnboardingStore] Updating user data:", data);
    set((state) => ({
      userData: { ...state.userData, ...data }
    }));
  },

  setUserData: (data: OnboardingData) => {
    console.log("[OnboardingStore] Setting user data:", data);
    set(() => ({ userData: data }));
  },

  setCompleted: (completed: boolean) => {
    console.log("[OnboardingStore] Setting completed:", completed);
    set(() => ({ isCompleted: completed }));
  },

  setLoading: (loading: boolean) => {
    console.log("[OnboardingStore] Setting loading:", loading);
    set(() => ({ isLoading: loading }));
  },

  setError: (error: string | null) => {
    console.log("[OnboardingStore] Setting error:", error);
    set(() => ({ error }));
  },

  resetOnboarding: () => {
    console.log("[OnboardingStore] Resetting onboarding");
    set(() => ({ ...initialState }));
  },

  completeOnboarding: () => {
    console.log("[OnboardingStore] Completing onboarding");
    set((state) => ({
      isCompleted: true,
      progress: 100,
      error: null
    }));
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
  }
}));
