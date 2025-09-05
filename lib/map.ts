import { Driver, MarkerData } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY || "AIzaSyC4o0Jqu8FvUxqn2Xw2UVU2oDn2e2uvdG8";

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

    console.log("[generateMarkersFromData] Driver data structure:", {
      driver,
      firstName: driver.first_name || driver.firstName,
      lastName: driver.last_name || driver.lastName,
      name: driver.name,
      fullName: driver.full_name || driver.fullName,
      index,
    });

    const markerData = {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name || driver.firstName || 'Unknown'} ${driver.last_name || driver.lastName || 'Driver'}`,
      ...driver,
      id: driver.id || index + 1, // Ensure we have an ID (placed after spread to avoid override)
    };

    console.log("[generateMarkersFromData] Creating marker:", {
      originalDriverId: driver.id,
      assignedId: markerData.id,
      title: markerData.title,
      firstName: driver.first_name || driver.firstName,
      lastName: driver.last_name || driver.lastName,
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
        `https://maps.googleapis.com/maps/api/directions/json?origin=${marker.latitude},${marker.longitude}&destination=${userLatitude},${userLongitude}&key=${directionsAPI}`,
      );
      const dataToUser = await responseToUser.json();
      console.log(
        "[map] directions to user ◀",
        dataToUser?.status,
        dataToUser?.routes?.[0]?.legs?.[0]?.duration,
      );
      const timeToUser = dataToUser.routes[0].legs[0].duration.value; // Time in seconds

      const responseToDestination = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${directionsAPI}`,
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
        price
      });

      return { ...marker, time: roundedTime, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("[map] ✖ Error calculating driver times", error);
  }
};
