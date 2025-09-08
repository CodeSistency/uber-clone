import { useRouter, usePathname } from "expo-router";
import { useCallback } from "react";

export const useDriverNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToDashboard = useCallback(() => {
    router.push('/(driver)/dashboard' as any);
  }, [router]);

  const navigateToEarnings = useCallback(() => {
    router.push('/(driver)/earnings' as any);
  }, [router]);

  const navigateToSafety = useCallback(() => {
    router.push('/(driver)/safety' as any);
  }, [router]);

  const navigateToRatings = useCallback(() => {
    router.push('/(driver)/ratings' as any);
  }, [router]);

  const navigateToSettings = useCallback(() => {
    router.push('/(driver)/settings' as any);
  }, [router]);

  const navigateToRideRequests = useCallback(() => {
    router.push('/(driver)/ride-requests' as any);
  }, [router]);

  const navigateToActiveRide = useCallback((rideId?: string) => {
    if (rideId) {
      router.push(`/(driver)/active-ride?id=${rideId}` as any);
    } else {
      router.push('/(driver)/active-ride' as any);
    }
  }, [router]);

  const navigateToEarningsHistory = useCallback(() => {
    router.push('/(driver)/earnings/history' as any);
  }, [router]);

  const navigateToEarningsAnalytics = useCallback(() => {
    router.push('/(driver)/earnings/analytics' as any);
  }, [router]);

  const navigateToEarningsPromotions = useCallback(() => {
    router.push('/(driver)/earnings/promotions' as any);
  }, [router]);

  const navigateToEarningsInstantPay = useCallback(() => {
    router.push('/(driver)/earnings/instant-pay' as any);
  }, [router]);

  const navigateToSafetyContacts = useCallback(() => {
    router.push('/(driver)/safety/contacts' as any);
  }, [router]);

  const navigateToSafetyIncidents = useCallback(() => {
    router.push('/(driver)/safety/incidents' as any);
  }, [router]);

  const navigateToSafetyShareTrip = useCallback(() => {
    router.push('/(driver)/safety/share-trip' as any);
  }, [router]);

  const navigateToSafetySettings = useCallback(() => {
    router.push('/(driver)/safety/settings' as any);
  }, [router]);

  const navigateToRatingsHistory = useCallback(() => {
    router.push('/(driver)/ratings/history' as any);
  }, [router]);

  const navigateToRatingsAnalytics = useCallback(() => {
    router.push('/(driver)/ratings/analytics' as any);
  }, [router]);

  const navigateToRatingsFeedback = useCallback(() => {
    router.push('/(driver)/ratings/feedback' as any);
  }, [router]);

  const navigateToRatingsSupport = useCallback(() => {
    router.push('/(driver)/ratings/support' as any);
  }, [router]);

  const navigateToSettingsProfile = useCallback(() => {
    router.push('/(driver)/settings/profile' as any);
  }, [router]);

  const navigateToSettingsVehicles = useCallback(() => {
    router.push('/(driver)/settings/vehicles' as any);
  }, [router]);

  const navigateToSettingsDocuments = useCallback(() => {
    router.push('/(driver)/settings/documents' as any);
  }, [router]);

  const navigateToSettingsServiceTypes = useCallback(() => {
    router.push('/(driver)/settings/service-types' as any);
  }, [router]);

  const navigateToSettingsPaymentMethods = useCallback(() => {
    router.push('/(driver)/settings/payment-methods' as any);
  }, [router]);

  const navigateToSettingsNotifications = useCallback(() => {
    router.push('/(driver)/settings/notifications' as any);
  }, [router]);

  const navigateToSettingsHelp = useCallback(() => {
    router.push('/(driver)/settings/help' as any);
  }, [router]);

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const navigateToHome = useCallback(() => {
    router.push('/(root)/(tabs)/home' as any);
  }, [router]);

  const isCurrentRoute = useCallback((route: string) => {
    return pathname === route;
  }, [pathname]);

  const isDriverRoute = useCallback(() => {
    return pathname.startsWith('/(driver)');
  }, [pathname]);

  return {
    // Navigation functions
    navigateToDashboard,
    navigateToEarnings,
    navigateToSafety,
    navigateToRatings,
    navigateToSettings,
    navigateToRideRequests,
    navigateToActiveRide,
    
    // Earnings navigation
    navigateToEarningsHistory,
    navigateToEarningsAnalytics,
    navigateToEarningsPromotions,
    navigateToEarningsInstantPay,
    
    // Safety navigation
    navigateToSafetyContacts,
    navigateToSafetyIncidents,
    navigateToSafetyShareTrip,
    navigateToSafetySettings,
    
    // Ratings navigation
    navigateToRatingsHistory,
    navigateToRatingsAnalytics,
    navigateToRatingsFeedback,
    navigateToRatingsSupport,
    
    // Settings navigation
    navigateToSettingsProfile,
    navigateToSettingsVehicles,
    navigateToSettingsDocuments,
    navigateToSettingsServiceTypes,
    navigateToSettingsPaymentMethods,
    navigateToSettingsNotifications,
    navigateToSettingsHelp,
    
    // Utility functions
    navigateBack,
    navigateToHome,
    isCurrentRoute,
    isDriverRoute,
    
    // Current state
    currentPath: pathname
  };
};
