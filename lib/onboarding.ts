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
    // API-first to avoid stale local completion states
    console.log("[OnboardingCheck] Checking API for onboarding status");
    try {
      const response = await fetchAPI("onboarding/status", { requiresAuth: true });
      console.log("[OnboardingCheck] API response:", response);

      const isCompletedAPI = response?.data?.isCompleted === true;
      const nextStepRaw = response?.data?.nextStep;
      // Map string step ids to numeric indices
      const stepMap: Record<string, number> = {
        "location": 0,
        "travel-preferences": 1,
        "phone-verification": 2,
        "profile-completion": 3,
      };
      let nextStep: number = 0;
      if (typeof nextStepRaw === 'string') {
        nextStep = stepMap[nextStepRaw] ?? 0;
      } else if (typeof nextStepRaw === 'number' && Number.isFinite(nextStepRaw)) {
        nextStep = Math.max(0, Math.min(3, nextStepRaw));
      } else {
        nextStep = 0;
      }
      const userData = response?.data;

      console.log("[OnboardingCheck] API completion status:", isCompletedAPI);

      // If API says it's completed, update local storage
      // Always sync local storage with API
      await onboardingStorage.setCompleted(!!isCompletedAPI);
      await onboardingStorage.saveStep(nextStep);
      if (userData) {
        await onboardingStorage.saveData(userData);
      }
      console.log("[OnboardingCheck] Local storage synchronized with API", { isCompletedAPI, nextStep });

      // Fallback inference: some legacy users may be effectively completed
      // even if API hasn't updated their onboarding status. Consider completed
      // if the profile already contains essential location data.
      if (!isCompletedAPI) {
        try {
          const profileResp = await fetchAPI("auth/profile", { requiresAuth: true });
          const profile = profileResp?.data ?? profileResp;
          const hasLocation = !!(profile?.country && profile?.city);
          if (hasLocation) {
            console.log("[OnboardingCheck] Inferred completed from profile (country/city present). Overriding to completed.");
            await onboardingStorage.setCompleted(true);
            await onboardingStorage.saveStep(3);
            return {
              isCompleted: true,
              nextStep: 3,
              userData: userData,
              source: 'api',
            };
          }
        } catch (inferErr) {
          console.warn("[OnboardingCheck] Profile inference failed:", inferErr);
        }
      }

      return {
        isCompleted: isCompletedAPI,
        nextStep,
        userData,
        source: 'api'
      };

    } catch (apiError) {
      console.error("[OnboardingCheck] API check failed:", apiError);
      // Fallback to local only if API not reachable
      const isCompletedLocal = await onboardingStorage.isCompleted();
      const stepLocal = await onboardingStorage.getStep();
      const userDataLocal = await onboardingStorage.getData();
      console.log("[OnboardingCheck] Fallback to local:", { isCompletedLocal, stepLocal });
      return { isCompleted: !!isCompletedLocal, nextStep: stepLocal || 0, userData: userDataLocal || undefined, source: 'storage' };
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
