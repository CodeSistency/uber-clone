import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "expo-router";
import { useMapFlowStore } from "@/store/mapFlow/mapFlow";
import { useDriverProfileStore } from "@/store/driverProfile";
import { useUI } from "@/components/UIWrapper";

// Define restricted routes during active rides
const RESTRICTED_ROUTES_DURING_RIDE = [
  "/(driver)/vehicles",
  "/(driver)/documents",
  "/(driver)/earnings",
];

// Define routes that should show contextual notifications
const CONTEXTUAL_NOTIFICATION_ROUTES = [
  "/(driver)/profile",
  "/(driver)/vehicles",
  "/(driver)/documents",
  "/(driver)/earnings",
];

export const useDriverNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { showError, showSuccess, showInfo } = useUI();
  const { profile } = useDriverProfileStore();

  // Get current flow state
  const {
    step,
    rideId,
    orderId,
    errandId,
    parcelId,
    role,
    isActive: flowIsActive,
  } = useMapFlowStore();

  // Determine if driver has an active ride
  const hasActiveRide = useMemo(() => {
    // Check if there's any active service identifier
    const hasActiveService = !!(rideId || orderId || errandId || parcelId);

    // Check if current step is an operational step (not availability)
    const isOperationalStep = step && step !== "DRIVER_DISPONIBILIDAD";

    // Driver has active ride if they have a service identifier AND are in operational flow
    return hasActiveService && isOperationalStep && flowIsActive;
  }, [step, rideId, orderId, errandId, parcelId, flowIsActive]);

  // Get current service type based on active identifiers
  const currentServiceType = useMemo(() => {
    if (rideId) return "transport";
    if (orderId) return "delivery";
    if (errandId) return "mandado";
    if (parcelId) return "envio";
    return null;
  }, [rideId, orderId, errandId, parcelId]);

  // Check if current route is restricted during active ride
  const isCurrentRouteRestricted = useMemo(() => {
    return RESTRICTED_ROUTES_DURING_RIDE.includes(pathname);
  }, [pathname]);

  // Show contextual notifications based on current route and driver state
  useEffect(() => {
    if (!CONTEXTUAL_NOTIFICATION_ROUTES.includes(pathname)) return;

    const showContextualNotification = () => {
      // Don't show notifications if profile is loading or not available
      if (!profile) return;

      const baseMessage = "You can manage this information while offline.";
      const serviceType = currentServiceType || "service";

      if (hasActiveRide) {
        showInfo(
          "Active Service",
          `You're currently on a ${serviceType} service. ${baseMessage}`,
          5000, // Show for 5 seconds
        );
      } else if (step === "DRIVER_DISPONIBILIDAD") {
        showSuccess(
          "Available for Services",
          `You're online and available for ${serviceType || "services"}. ${baseMessage}`,
          3000,
        );
      }
    };

    // Small delay to allow UI to settle
    const timeoutId = setTimeout(showContextualNotification, 500);

    return () => clearTimeout(timeoutId);
  }, [pathname, hasActiveRide, currentServiceType, step, profile]);

  // Navigation guard for restricted routes during active rides
  useEffect(() => {
    if (hasActiveRide && isCurrentRouteRestricted) {
      const serviceType = currentServiceType || "service";

      showError(
        "Action Not Available",
        `You cannot access this section while on an active ${serviceType} service. Please complete your current service first.`,
        8000, // Show longer error message
      );

      // Navigate back to a safe route
      setTimeout(() => {
        router.replace("/(driver)/available");
      }, 2000);
    }
  }, [hasActiveRide, isCurrentRouteRestricted, currentServiceType]);

  // Helper methods for navigation
  const navigateToProfile = () => {
    if (canNavigateToManagement()) {
      router.push("/(driver)/profile");
    }
  };

  const navigateToVehicles = () => {
    if (canNavigateToManagement()) {
      router.push("/(driver)/vehicles" as any);
    }
  };

  const navigateToDocuments = () => {
    if (canNavigateToManagement()) {
      router.push("/(driver)/documents" as any);
    }
  };

  const navigateToEarnings = () => {
    if (canNavigateToManagement()) {
      router.push("/(driver)/earnings");
    }
  };

  const canNavigateToManagement = () => {
    if (hasActiveRide) {
      const serviceType = currentServiceType || "service";
      showError(
        "Action Not Available",
        `You cannot access management sections while on an active ${serviceType} service. Please complete your current service first.`,
      );
      return false;
    }
    return true;
  };

  const navigateToAvailable = () => {
    router.replace("/(driver)/available");
  };

  const navigateToEarningsFromRide = () => {
    // Allow navigation to earnings even during active ride for viewing current earnings
    router.push("/(driver)/earnings");
  };

  return {
    // State
    hasActiveRide,
    currentServiceType,
    isCurrentRouteRestricted,
    canNavigateToManagement,

    // Navigation methods
    navigateToProfile,
    navigateToVehicles,
    navigateToDocuments,
    navigateToEarnings,
    navigateToAvailable,
    navigateToEarningsFromRide,

    // Utility methods
    showContextualNotification: () => {
      if (CONTEXTUAL_NOTIFICATION_ROUTES.includes(pathname)) {
        const baseMessage = "You can manage this information while offline.";

        if (hasActiveRide) {
          const serviceType = currentServiceType || "service";
          showInfo(
            "Active Service",
            `You're currently on a ${serviceType} service. ${baseMessage}`,
          );
        } else if (step === "DRIVER_DISPONIBILIDAD") {
          showSuccess(
            "Available for Services",
            `You're online and available for services. ${baseMessage}`,
          );
        }
      }
    },
  };
};
