import React, { lazy, Suspense, ComponentType } from "react";
import { View, ActivityIndicator } from "react-native";

// Loading component for Suspense boundaries
const LoadingSpinner = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#0286FF" />
  </View>
);

// Higher-order component for lazy loading with Suspense
function withSuspense<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType,
) {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense
      fallback={fallback ? React.createElement(fallback) : <LoadingSpinner />}
    >
      <LazyComponent {...props} />
    </Suspense>
  );
}

// ===== AUTH GROUP LAZY ROUTES =====
export const LazyWelcome = withSuspense(() => import("./(auth)/welcome"));
export const LazySignIn = withSuspense(() => import("./(auth)/sign-in"));
export const LazySignUp = withSuspense(() => import("./(auth)/sign-up"));
export const LazyBusinessRegisterIndex = withSuspense(
  () => import("./(auth)/business-register/index"),
);
export const LazyDriverRegisterIndex = withSuspense(
  () => import("./(auth)/driver-register/index"),
);

// ===== ROOT GROUP LAZY ROUTES =====
export const LazyHome = withSuspense(() => import("./(root)/(tabs)/home"));
export const LazyRides = withSuspense(() => import("./(root)/(tabs)/rides"));
export const LazyChat = withSuspense(() => import("./(root)/(tabs)/chat"));
export const LazyProfile = withSuspense(
  () => import("./(root)/(tabs)/profile"),
);

export const LazyFindRide = withSuspense(() => import("./(root)/find-ride"));
export const LazyConfirmRide = withSuspense(
  () => import("./(root)/confirm-ride-new"),
);
export const LazyBookRide = withSuspense(() => import("./(root)/book-ride"));
export const LazyActiveRide = withSuspense(
  () => import("./(root)/active-ride"),
);
export const LazyRatingScreen = withSuspense(
  () => import("./(root)/rating-screen"),
);
export const LazyVehicleSelection = withSuspense(
  () => import("./(root)/vehicle-selection"),
);

// ===== DRIVER GROUP LAZY ROUTES =====
export const LazyDriverDashboard = withSuspense(
  () => import("./(driver)/dashboard"),
);
export const LazyDriverEarnings = withSuspense(
  () => import("./(driver)/earnings"),
);
export const LazyDriverProfile = withSuspense(
  () => import("./(driver)/profile"),
);
export const LazyDriverRatings = withSuspense(
  () => import("./(driver)/ratings"),
);
export const LazyDriverRideRequests = withSuspense(
  () => import("./(driver)/ride-requests"),
);
export const LazyDriverSafety = withSuspense(() => import("./(driver)/safety"));
export const LazyDriverSettings = withSuspense(
  () => import("./(driver)/settings"),
);
export const LazyDriverAvailable = withSuspense(
  () => import("./(driver)/available"),
);

// ===== BUSINESS GROUP LAZY ROUTES =====
export const LazyBusinessDashboard = withSuspense(
  () => import("./(business)/dashboard"),
);
export const LazyBusinessAnalytics = withSuspense(
  () => import("./(business)/analytics"),
);
export const LazyBusinessMenu = withSuspense(() => import("./(business)/menu"));
export const LazyBusinessOrders = withSuspense(
  () => import("./(business)/orders"),
);

// ===== MARKETPLACE GROUP LAZY ROUTES =====
export const LazyMarketplaceIndex = withSuspense(
  () => import("./(marketplace)/index"),
);
export const LazyMarketplaceCheckout = withSuspense(
  () => import("./(marketplace)/checkout"),
);

// ===== ONBOARDING GROUP LAZY ROUTES =====
export const LazyOnboardingIndex = withSuspense(
  () => import("./(onboarding)/index"),
);
export const LazyOnboardingWelcome = withSuspense(
  () => import("./(onboarding)/welcome"),
);
export const LazyOnboardingPersonalInfo = withSuspense(
  () => import("./(onboarding)/personal-info"),
);
export const LazyOnboardingPhoneVerification = withSuspense(
  () => import("./(onboarding)/phone-verification"),
);
export const LazyOnboardingCountrySelection = withSuspense(
  () => import("./(onboarding)/country-selection"),
);
export const LazyOnboardingStateSelection = withSuspense(
  () => import("./(onboarding)/state-selection"),
);
export const LazyOnboardingCitySelection = withSuspense(
  () => import("./(onboarding)/city-selection"),
);
export const LazyOnboardingTravelPreferences = withSuspense(
  () => import("./(onboarding)/travel-preferences"),
);
export const LazyOnboardingProfileCompletion = withSuspense(
  () => import("./(onboarding)/profile-completion"),
);
export const LazyOnboardingCompletionSuccess = withSuspense(
  () => import("./(onboarding)/completion-success"),
);

// ===== WALLET GROUP LAZY ROUTES =====
export const LazyWalletIndex = withSuspense(() => import("./(wallet)/index"));

// ===== EMERGENCY GROUP LAZY ROUTES =====
export const LazyEmergencyIndex = withSuspense(
  () => import("./(emergency)/index"),
);

// ===== COMPONENT CHUNKS =====
// Heavy components that should be loaded separately
export const LazyMap = withSuspense(() => import("../components/Map"));
export const LazyGoogleTextInput = withSuspense(
  () => import("../components/GoogleTextInput"),
);
export const LazyPayment = withSuspense(() => import("../components/Payment"));
export const LazyRatingSystem = withSuspense(
  () => import("../components/RatingSystem"),
);

// ===== SERVICE CHUNKS =====
// Note: Services are typically not lazy-loaded as they don't render UI
// These would be regular dynamic imports if needed

// ===== UTILITY COMPONENTS =====
export const LazyErrorBoundary = withSuspense(
  () => import("../components/ErrorBoundary"),
);
export const LazyUIWrapper = withSuspense(
  () => import("../components/UIWrapper"),
);

// Export the loading component for custom fallbacks
export { LoadingSpinner };
