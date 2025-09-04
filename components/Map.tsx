import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, Platform } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY || "AIzaSyC4o0Jqu8FvUxqn2Xw2UVU2oDn2e2uvdG8";

const Map = () => {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  const { data: drivers, loading, error } = useFetch<Driver[]>("driver");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  // Function to get route coordinates from Google Directions API
  const getRouteCoordinates = async (
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ) => {
    try {
      console.log("[Map] Getting route coordinates:", {
        originLat,
        originLng,
        destLat,
        destLng,
      });

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${directionsAPI}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      console.log("[Map] Directions API response:", data.status);

      if (data.status === "OK" && data.routes && data.routes[0]) {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);

        console.log("[Map] Route decoded with", decodedPoints.length, "points");
        setRouteCoordinates(decodedPoints);
      } else {
        console.warn("[Map] No route found:", data.status);
        setRouteCoordinates([]);
      }
    } catch (error) {
      console.error("[Map] Error getting route:", error);
      setRouteCoordinates([]);
    }
  };

  // Function to decode Google Maps polyline
  const decodePolyline = (encoded: string) => {
    const points: { latitude: number; longitude: number }[] = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let shift = 0,
        result = 0;
      let byte;

      // Decode latitude
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      shift = 0;
      result = 0;

      // Decode longitude
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      points.push({
        latitude: lat / 100000,
        longitude: lng / 100000,
      });
    }

    return points;
  };

  // Get route when origin or destination changes
  useEffect(() => {
    if (
      userLatitude &&
      userLongitude &&
      destinationLatitude &&
      destinationLongitude
    ) {
      console.log("[Map] Origin and destination available, getting route...");
      getRouteCoordinates(
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      );
    } else {
      console.log("[Map] Clearing route - missing coordinates");
      setRouteCoordinates([]);
    }
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;

      console.log("[Map] drivers loaded", {
        count: drivers.length,
        userLatitude,
        userLongitude,
      });
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      console.log("[Map] markers generated", { count: newMarkers.length });
      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined
    ) {
      console.log("[Map] calculating driver times", {
        markers: markers.length,
        destinationLatitude,
        destinationLongitude,
      });
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        console.log("[Map] driver times calculated", {
          driversCount: drivers?.length,
        });
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  console.log("[Map] region", region);

  if (loading || (!userLatitude && !userLongitude))
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {markers.map((marker, index) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}

      {userLatitude && userLongitude && (
        <Marker
          key="origin"
          coordinate={{
            latitude: userLatitude,
            longitude: userLongitude,
          }}
          title="Origin"
          image={icons.point}
        />
      )}

      {destinationLatitude && destinationLongitude && (
        <Marker
          key="destination"
          coordinate={{
            latitude: destinationLatitude,
            longitude: destinationLongitude,
          }}
          title="Destination"
          image={icons.pin}
        />
      )}

      {routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#4285F4" // Google Maps blue
          strokeWidth={4}
          lineDashPattern={[0]}
        />
      )}
    </MapView>
  );
};

export default Map;
