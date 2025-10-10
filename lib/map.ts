/**
 * @deprecated This file is deprecated. Use the new modular map system instead.
 * 
 * Migration guide:
 * - Use RouteCalculator from '@/lib/map/routeCalculator' for route calculations
 * - Use RegionCalculator from '@/lib/map/regionCalculator' for region calculations  
 * - Use MarkerGenerator from '@/lib/map/markerGenerator' for marker generation
 * - Use useMapRoutes hook from '@/hooks/useMapRoutes' for route management
 * - Use useMapMarkers hook from '@/hooks/useMapMarkers' for marker management
 * 
 * See docs/map-system-api.md for complete migration guide.
 */

import { Driver, MarkerData } from "@/types/type";
import { endpoints } from "@/lib/endpoints";
import { DARK_MODERN_STYLE } from "@/constants/mapStyles";

// Debug function para verificar estilos del mapa
export const debugMapStyles = () => {
  console.warn('[DEPRECATED] debugMapStyles is deprecated. Use the new map system instead.');
};

/**
 * @deprecated Use MarkerGenerator.generateDriverMarkers instead
 */
export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  console.warn('[DEPRECATED] generateMarkersFromData is deprecated. Use MarkerGenerator.generateDriverMarkers instead.');
  
  return data.map((driver, index) => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

    // Handle both camelCase and snake_case naming conventions
    const firstName = driver.first_name || "Unknown";
    const lastName = driver.last_name || "Driver";

    

    const markerData = {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${firstName} ${lastName}`,
      ...driver,
      id: driver.id || index + 1, // Ensure we have an ID (placed after spread to avoid override)
      first_name: firstName, // Ensure consistent naming for compatibility
      last_name: lastName, // Ensure consistent naming for compatibility
    };

    

    return markerData;
  });
};

/**
 * @deprecated Use RegionCalculator.calculateRouteRegion instead
 */
export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  console.warn('[DEPRECATED] calculateRegion is deprecated. Use RegionCalculator.calculateRouteRegion instead.');
  
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

/**
 * @deprecated Use RouteCalculator for route calculations instead
 */
export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  console.warn('[DEPRECATED] calculateDriverTimes is deprecated. Use RouteCalculator for route calculations instead.');
  
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  try {
    
    const timesPromises = markers.map(async (marker) => {
      
      const responseToUser = await fetch(
        endpoints.googleMaps.directions("json", {
          origin: `${marker.latitude},${marker.longitude}`,
          destination: `${userLatitude},${userLongitude}`,
        }),
      );
      const dataToUser = await responseToUser.json();
      
      const timeToUser = dataToUser.routes[0].legs[0].duration.value; // Time in seconds

      const responseToDestination = await fetch(
        endpoints.googleMaps.directions("json", {
          origin: `${userLatitude},${userLongitude}`,
          destination: `${destinationLatitude},${destinationLongitude}`,
        }),
      );
      const dataToDestination = await responseToDestination.json();
      
      const timeToDestination =
        dataToDestination.routes[0].legs[0].duration.value; // Time in seconds

      const totalTime = (timeToUser + timeToDestination) / 60; // Total time in minutes
      const roundedTime = Math.round(totalTime * 10) / 10; // Round to 1 decimal place
      const price = (roundedTime * 0.5).toFixed(2); // Calculate price based on time

      

      return { ...marker, time: roundedTime, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    
  }
};
