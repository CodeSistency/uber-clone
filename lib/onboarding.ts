import { fetchAPI } from "./fetch";
import { onboardingStorage } from "@/app/lib/storage";

export interface OnboardingStatus {
  isCompleted: boolean;
  nextStep?: number;
  userData?: any;
  source: 'storage' | 'api' | 'fallback';
}

/**
 * Verifica el estado del onboarding usando múltiples fuentes
 * 1. Primero verifica el storage local
 * 2. Si no hay datos locales, consulta la API
 * 3. Si la API falla, asume que no está completado
 */
export const checkOnboardingStatus = async (): Promise<OnboardingStatus> => {
  try {
    console.log("[OnboardingCheck] Checking onboarding status");

    // 1. Check local storage first (fast)
    const isCompletedLocal = await onboardingStorage.isCompleted();
    console.log("[OnboardingCheck] Local storage completion status:", isCompletedLocal);

    if (isCompletedLocal) {
      console.log("[OnboardingCheck] Onboarding completed according to local storage");
      return {
        isCompleted: true,
        source: 'storage'
      };
    }

    // 2. If not completed locally, check API
    console.log("[OnboardingCheck] Checking API for onboarding status");
    try {
      const response = await fetchAPI("onboarding/status", { requiresAuth: true });
      console.log("[OnboardingCheck] API response:", response);

      const isCompletedAPI = response?.data?.isCompleted === true;
      const nextStep = response?.data?.nextStep || 0;
      const userData = response?.data;

      console.log("[OnboardingCheck] API completion status:", isCompletedAPI);

      // If API says it's completed, update local storage
      if (isCompletedAPI) {
        await onboardingStorage.setCompleted(true);
        if (userData) {
          await onboardingStorage.saveData(userData);
        }
        console.log("[OnboardingCheck] Updated local storage with API data");
      }

      return {
        isCompleted: isCompletedAPI,
        nextStep,
        userData,
        source: 'api'
      };

    } catch (apiError) {
      console.error("[OnboardingCheck] API check failed:", apiError);

      // 3. Fallback: assume not completed if both local and API fail
      console.log("[OnboardingCheck] Using fallback - assuming not completed");
      return {
        isCompleted: false,
        source: 'fallback'
      };
    }

  } catch (error) {
    console.error("[OnboardingCheck] Error checking onboarding status:", error);
    return {
      isCompleted: false,
      source: 'fallback'
    };
  }
};

/**
 * Marca el onboarding como completado en ambas fuentes
 */
export const markOnboardingCompleted = async (userData?: any): Promise<void> => {
  try {
    console.log("[OnboardingCheck] Marking onboarding as completed");

    // Save to local storage
    await onboardingStorage.setCompleted(true);
    if (userData) {
      await onboardingStorage.saveData(userData);
    }

    // Try to update API (optional, don't fail if it doesn't work)
    try {
      await fetchAPI("onboarding/complete", {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({ userData })
      });
      console.log("[OnboardingCheck] API updated successfully");
    } catch (apiError) {
      console.warn("[OnboardingCheck] API update failed, but local storage was updated:", apiError);
    }

  } catch (error) {
    console.error("[OnboardingCheck] Error marking onboarding completed:", error);
    throw error;
  }
};

/**
 * Resetea el estado del onboarding
 */
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    console.log("[OnboardingCheck] Resetting onboarding status");

    // Clear local storage
    await onboardingStorage.clear();

    // Try to reset API (optional)
    try {
      await fetchAPI("onboarding/reset", {
        method: 'POST',
        requiresAuth: true
      });
      console.log("[OnboardingCheck] API reset successfully");
    } catch (apiError) {
      console.warn("[OnboardingCheck] API reset failed:", apiError);
    }

  } catch (error) {
    console.error("[OnboardingCheck] Error resetting onboarding:", error);
    throw error;
  }
};
