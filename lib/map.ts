import { Driver, MarkerData } from "@/types/type";
import { endpoints } from "@/lib/endpoints";
import { DARK_MODERN_STYLE } from "@/constants/mapStyles";

// Debug function para verificar estilos del mapa
export const debugMapStyles = () => {
  console.log("[debugMapStyles] 🎨 DARK_MODERN_STYLE sample:", {
    name: DARK_MODERN_STYLE.name,
    jsonLength: DARK_MODERN_STYLE.json.length,
    firstElement: DARK_MODERN_STYLE.json[0],
    hasGeometryFill: DARK_MODERN_STYLE.json.some((style: any) => style.elementType === "geometry.fill"),
    darkColors: DARK_MODERN_STYLE.json.filter((style: any) =>
      style.stylers?.some((s: any) => s.color && s.color.includes("#1d"))
    ),
  });
};

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  console.log("[map] generateMarkersFromData ▶", {
    driversCount: data?.length,
    userLatitude,
    userLongitude,
  });
  return data.map((driver, index) => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

    // Handle both camelCase and snake_case naming conventions
    const firstName = driver.first_name || "Unknown";
    const lastName = driver.last_name || "Driver";

    console.log("[generateMarkersFromData] Driver data structure:", {
      driver,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      fullName: `${firstName} ${lastName}`,
      index,
    });

    const markerData = {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${firstName} ${lastName}`,
      ...driver,
      id: driver.id || index + 1, // Ensure we have an ID (placed after spread to avoid override)
      first_name: firstName, // Ensure consistent naming for compatibility
      last_name: lastName, // Ensure consistent naming for compatibility
    };

    console.log("[generateMarkersFromData] Creating marker:", {
      originalDriverId: driver.id,
      assignedId: markerData.id,
      title: markerData.title,
      firstName,
      lastName,
      index,
    });

    return markerData;
  });
};

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
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  try {
    console.log("[map] calculateDriverTimes ▶", {
      markersCount: markers?.length,
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude,
    });
    const timesPromises = markers.map(async (marker) => {
      console.log("[map] calculateDriverTimes ▶ marker", {
        id: (marker as any)?.id,
        latitude: marker.latitude,
        longitude: marker.longitude,
      });
      const responseToUser = await fetch(
        endpoints.googleMaps.directions("json", {
          origin: `${marker.latitude},${marker.longitude}`,
          destination: `${userLatitude},${userLongitude}`,
        }),
      );
      const dataToUser = await responseToUser.json();
      console.log(
        "[map] directions to user ◀",
        dataToUser?.status,
        dataToUser?.routes?.[0]?.legs?.[0]?.duration,
      );
      const timeToUser = dataToUser.routes[0].legs[0].duration.value; // Time in seconds

      const responseToDestination = await fetch(
        endpoints.googleMaps.directions("json", {
          origin: `${userLatitude},${userLongitude}`,
          destination: `${destinationLatitude},${destinationLongitude}`,
        }),
      );
      const dataToDestination = await responseToDestination.json();
      console.log(
        "[map] directions to destination ◀",
        dataToDestination?.status,
        dataToDestination?.routes?.[0]?.legs?.[0]?.duration,
      );
      const timeToDestination =
        dataToDestination.routes[0].legs[0].duration.value; // Time in seconds

      const totalTime = (timeToUser + timeToDestination) / 60; // Total time in minutes
      const roundedTime = Math.round(totalTime * 10) / 10; // Round to 1 decimal place
      const price = (roundedTime * 0.5).toFixed(2); // Calculate price based on time

      console.log("[calculateDriverTimes] Time calculation:", {
        timeToUser: timeToUser / 60,
        timeToDestination: timeToDestination / 60,
        totalTime,
        roundedTime,
        price,
      });

      return { ...marker, time: roundedTime, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("[map] ✖ Error calculating driver times", error);
  }
};
