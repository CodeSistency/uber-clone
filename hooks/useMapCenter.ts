import { useMemo } from "react";
import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface UseMapCenterOptions {
  bottomSheetHeight?: number; // Percentage of screen height
  topOffset?: number; // Additional top offset in pixels
  sideOffset?: number; // Side margin in pixels
  floatingElements?: Array<{
    height: number;
    position: "top" | "bottom";
  }>;
}

interface MapCenterResult {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const useMapCenter = (
  userLatitude: number | null,
  userLongitude: number | null,
  destinationLatitude?: number | null,
  destinationLongitude?: number | null,
  options: UseMapCenterOptions = {},
): MapCenterResult | null => {
  const {
    bottomSheetHeight = 40, // Default 40% bottom sheet
    topOffset = 100, // Default top offset for floating elements
    sideOffset = 20,
    floatingElements = [],
  } = options;

  return useMemo(() => {
    // If no user location, return null
    if (!userLatitude || !userLongitude) {
      return null;
    }

    // If destination exists, calculate center between user and destination
    if (destinationLatitude && destinationLongitude) {
      const latDiff = Math.abs(destinationLatitude - userLatitude);
      const lngDiff = Math.abs(destinationLongitude - userLongitude);

      const centerLat = (userLatitude + destinationLatitude) / 2;
      const centerLng = (userLongitude + destinationLongitude) / 2;

      // Calculate deltas with padding for floating elements
      const latDelta = Math.max(latDiff * 1.5, 0.01);
      const lngDelta = Math.max(lngDiff * 1.5, 0.01);

      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };
    }

    // Single point (user location only)
    // Calculate available map area considering bottom sheet and floating elements
    const availableHeight = SCREEN_HEIGHT * ((100 - bottomSheetHeight) / 100);

    // Account for floating elements
    const totalFloatingHeight = floatingElements.reduce((total, element) => {
      return total + element.height;
    }, 0);

    const effectiveHeight = availableHeight - totalFloatingHeight - topOffset;

    // Calculate zoom level based on available space
    const latitudeDelta = Math.max(
      0.01,
      (SCREEN_HEIGHT / effectiveHeight) * 0.01,
    );
    const longitudeDelta = Math.max(
      0.01,
      (SCREEN_WIDTH / (SCREEN_WIDTH - sideOffset * 2)) * latitudeDelta,
    );

    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta,
      longitudeDelta,
    };
  }, [
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    bottomSheetHeight,
    topOffset,
    sideOffset,
    floatingElements,
  ]);
};

// Hook for business-specific map centering
export const useBusinessMapCenter = (
  businessLatitude: number | null,
  businessLongitude: number | null,
  deliveryLatitude?: number | null,
  deliveryLongitude?: number | null,
) => {
  return useMapCenter(
    businessLatitude,
    businessLongitude,
    deliveryLatitude,
    deliveryLongitude,
    {
      bottomSheetHeight: 60, // Business typically uses more bottom sheet space
      topOffset: 120, // More top space for business headers
      floatingElements: [
        { height: 60, position: "top" }, // Header height
      ],
    },
  );
};

// Hook for driver-specific map centering
export const useDriverMapCenter = (
  driverLatitude: number | null,
  driverLongitude: number | null,
  pickupLatitude?: number | null,
  pickupLongitude?: number | null,
  deliveryLatitude?: number | null,
  deliveryLongitude?: number | null,
) => {
  // Calculate center considering both pickup and delivery if available
  const primaryLat = pickupLatitude || driverLatitude;
  const primaryLng = pickupLongitude || driverLongitude;

  return useMapCenter(
    primaryLat,
    primaryLng,
    deliveryLatitude,
    deliveryLongitude,
    {
      bottomSheetHeight: 50, // Driver uses medium bottom sheet
      topOffset: 80,
      floatingElements: [
        { height: 40, position: "top" }, // Status bar
      ],
    },
  );
};
